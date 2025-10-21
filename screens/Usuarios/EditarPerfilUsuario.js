import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@react-navigation/native';
import { doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../src/config/firebaseConfig';
import { getStyles } from './EditarPerfilUsuario.styles';
import { Feather } from '@expo/vector-icons';
import CustomAlert from '../../src/components/CustomAlert';
import CustomActionSheet from './CustomActionSheet';
import * as ImagePicker from 'expo-image-picker';
import { cloudinaryConfig } from '../../src/config/cloudinaryConfig';
import { readAsStringAsync } from 'expo-file-system/legacy';

const FormInput = ({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false, styles }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && { height: 100, textAlignVertical: 'top' }]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={styles.placeholder.color}
      keyboardType={keyboardType}
      multiline={multiline}
      autoCapitalize="words"
    />
  </View>
);

export default function EditarPerfilUsuario({ route, navigation }) {
  const { user: initialUser } = route.params;
  const { dark: isDarkMode, colors } = useTheme();
  const styles = getStyles(isDarkMode, colors);

  const positionOptions = ['Gerente', 'Administración', 'Secretaria', 'Tecnico', 'Obrero'];

  const [formData, setFormData] = useState({
    firstName: initialUser.firstName || '',
    lastName: initialUser.lastName || '',
    phone: initialUser.phone || '',
    position: initialUser.position || '',
  });
  const [imageUri, setImageUri] = useState(initialUser.imageUrl || null);
  const [loading, setLoading] = useState(false);
  const [confirmAlertVisible, setConfirmAlertVisible] = useState(false);
  const [infoAlert, setInfoAlert] = useState({ visible: false, title: '', message: '', onConfirm: null });
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [imagePickerAction, setImagePickerAction] = useState(null);

  // useEffect para lanzar el selector de imágenes después de que la alerta se cierre.
  // Esto evita conflictos con el ciclo de vida de la UI en React Native.
  useEffect(() => { if (imagePickerAction) { pickImage(imagePickerAction); setImagePickerAction(null); } }, [imagePickerAction]);
  // ...existing code...
  // Eliminado imagePickerAction y useEffect que lanzaba el picker desde estado

  const handleInputChange = (field, value) => {
    let sanitizedValue = value;
    if (field === 'firstName' || field === 'lastName') {
      // Permite solo letras y espacios
      sanitizedValue = value.replace(/[^a-zA-Z\s]/g, '');
    } else if (field === 'phone') {
      // Permite solo números
      sanitizedValue = value.replace(/[^0-9]/g, '');
    }
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }));
  };

  const checkForChanges = () => {
    return (
      formData.firstName.trim() !== (initialUser.firstName || '').trim() ||
      formData.lastName.trim() !== (initialUser.lastName || '').trim() ||
      formData.phone.trim() !== (initialUser.phone || '').trim() ||
      formData.position !== (initialUser.position || '') ||
      imageUri !== (initialUser.imageUrl || null)
    );
  };

  const handleSavePress = () => {
    if (!formData.firstName || !formData.lastName) {
        setInfoAlert({ visible: true, title: 'Campos requeridos', message: 'El nombre y el apellido no pueden estar vacíos.' });
        return;
    }

    if (!checkForChanges()) {
        setInfoAlert({ visible: true, title: 'Sin cambios', message: 'No has realizado ninguna modificación.' });
        return;
    }

    // Si hay cambios, muestra la alerta de confirmación
    setConfirmAlertVisible(true);
  };
  
  const imagePickerOptions = [
    { label: 'Seleccionar Imagen', isTitle: true },
    { 
      label: 'Tomar Foto', 
      icon: 'camera', 
      onPress: () => { setActionSheetVisible(false); setImagePickerAction('camera'); }
    },
    { 
      label: 'Elegir de la Galería', 
      icon: 'image',
      onPress: () => { setActionSheetVisible(false); setImagePickerAction('gallery'); }
    },
    { label: 'Cancelar', isCancel: true, onPress: () => setActionSheetVisible(false) },
  ];

  const handleImagePick = () => setActionSheetVisible(true);

  const pickImage = async (source) => {
    try {
      // Compatibilidad con distintas versiones de expo-image-picker
      const mediaTypes = ImagePicker.MediaTypeOptions?.Images ?? 'Images';

      const options = {
        mediaTypes,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      };

      let result;
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a la cámara.');
          return;
        }
        result = await ImagePicker.launchCameraAsync(options);
      } else { // gallery
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a la galería.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      // Manejo del resultado según la API actual
      if (!result) {
        Alert.alert('Error', 'No se obtuvo resultado del selector de imágenes.');
        return;
      }

      // En algunas versiones result.canceled; en otras result.cancelled; manejamos ambos
      const canceled = result.canceled ?? result.cancelled ?? false;
      const assets = result.assets ?? (result.uri ? [{ uri: result.uri }] : null);

      if (!canceled && assets && assets.length > 0) {
        setImageUri(assets[0].uri);
      } else {
        // Usuario canceló o no hay assets
        // No mostrar alerta para cancelación normal
        console.log('pickImage: cancelado o sin assets', result);
      }
    } catch (err) {
      console.error('Error seleccionando imagen:', err);
      Alert.alert('Error seleccionando imagen', String(err));
    }
  };

  const uploadImage = async (uri) => {
    const formData = new FormData();
    formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: 'upload.jpg',
    });
    formData.append('upload_preset', cloudinaryConfig.upload_preset);

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloud_name}/image/upload`, {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        const data = await response.json();
        if (data.secure_url) {
            return data.secure_url;
        } else {
            throw new Error('Error al subir la imagen a Cloudinary.');
        }
    } catch (error) {
        console.error('Error al subir la imagen:', error);
        Alert.alert("Error", "Hubo un problema al subir la imagen.");
        return null;
    }
};

  const executeSave = async () => {
    setConfirmAlertVisible(false);
    setLoading(true);
    try {
      let newImageUrl = imageUri;
      if (imageUri && imageUri !== initialUser.imageUrl) {
        newImageUrl = await uploadImage(imageUri);
      }

      const userRef = doc(db, 'users', auth.currentUser.uid);
      const dataToUpdate = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        position: formData.position,
        imageUrl: newImageUrl,
      };

      await updateDoc(userRef, dataToUpdate);

      setInfoAlert({
        visible: true,
        title: 'Éxito',
        message: 'Tu perfil ha sido actualizado correctamente.',
        onConfirm: () => navigation.navigate('PerfilUsuario', { updated: Date.now() }),
      });
      
    } catch (error) {
      console.error("Error al actualizar el perfil: ", error);
      setInfoAlert({ visible: true, title: 'Error', message: 'No se pudo actualizar el perfil. Inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>Editar Información</Text>

          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={handleImagePick}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Feather name="camera" size={30} color="#FFFFFF" />
                </View>
              )}
              <View style={styles.editIcon}>
                <Feather name="edit-2" size={14} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.emailInfoContainer}>
            <Feather name="mail" size={20} style={styles.emailIcon} />
            <View>
                <Text style={styles.emailLabel}>Correo Electrónico (no editable)</Text>
                <Text style={styles.emailText}>{initialUser.email}</Text>
            </View>
        </View>

          <FormInput
            label="Nombre"
            value={formData.firstName}
            onChangeText={(val) => handleInputChange('firstName', val)}
            placeholder="Ingresa tu nombre"
            styles={styles}
          />
          <FormInput
            label="Apellido"
            value={formData.lastName}
            onChangeText={(val) => handleInputChange('lastName', val)}
            placeholder="Ingresa tu apellido"
            styles={styles}
          />
          <FormInput
            label="Teléfono"
            value={formData.phone}
            onChangeText={(val) => handleInputChange('phone', val)}
            placeholder="Ej: 1122334455"
            keyboardType="numeric"
            styles={styles}
          />
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Cargo</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.position}
                onValueChange={(itemValue) => handleInputChange('position', itemValue)}
                style={styles.picker}
                dropdownIconColor={colors.text}
              >
                <Picker.Item label="Selecciona un cargo..." value="" style={styles.pickerItemPlaceholder} />
                {positionOptions.map((pos) => <Picker.Item key={pos} label={pos} value={pos} style={styles.pickerItem} />)}
              </Picker>
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSavePress} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Guardar Cambios</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      <CustomAlert
        visible={confirmAlertVisible}
        title="Confirmar Cambios"
        message="¿Estás seguro de que quieres guardar las modificaciones?"
        onConfirm={executeSave}
        onCancel={() => setConfirmAlertVisible(false)}
      />
      <CustomAlert
        visible={infoAlert.visible}
        title={infoAlert.title}
        message={infoAlert.message}
        onConfirm={() => {
          const callback = infoAlert.onConfirm;
          setInfoAlert({ visible: false, title: '', message: '', onConfirm: null });
          if (callback) callback();
        }}
      />
      <CustomActionSheet
        visible={actionSheetVisible}
        onClose={() => setActionSheetVisible(false)}
        options={imagePickerOptions}
      />
    </>
  );
}