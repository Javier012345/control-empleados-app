
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image, BackHandler } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../../src/config/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cloudinaryConfig } from '../../src/config/cloudinaryConfig';

import CustomAlert from '../../src/components/CustomAlert';
import CustomActionSheet from '../../screens/Usuarios/CustomActionSheet';
import { useAppContext } from '../../src/context/AppContext';
import { getStyles } from './AgregarEmpleado.styles';

export default function AgregarEmpleado({ navigation }) {
  const { addActivity } = useAppContext();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dni, setDni] = useState('');
  const [position, setPosition] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [alertInfo, setAlertInfo] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [imagePickerAction, setImagePickerAction] = useState(null);

  useEffect(() => { if (imagePickerAction) { pickImage(imagePickerAction); setImagePickerAction(null); } }, [imagePickerAction]);

  // This ref stores the latest form state to avoid stale closures in the event listener.
  const formStateRef = React.useRef({ firstName, lastName, dni, position, telefono, email, direccion, image });
  formStateRef.current = { firstName, lastName, dni, position, telefono, email, direccion, image };

  useEffect(() => {
    const onBeforeRemove = (e) => {
      // Get the latest state directly from the ref.
      const { firstName, lastName, dni, position, telefono, email, direccion, image } = formStateRef.current;
      const hasUnsavedChanges = !!(firstName || lastName || dni || position || telefono || email || direccion || image);

      // Do nothing if there are no changes or if an alert is already showing.
      if (!hasUnsavedChanges || alertInfo.visible) {
        return;
      }

      e.preventDefault();

      setAlertInfo({
        visible: true,
        title: 'Atención',
        message: 'Se perderán los cambios si sales. ¿Estás seguro?',
        confirmButtonText: 'Salir',
        onConfirm: () => navigation.dispatch(e.data.action),
        cancelButtonText: 'Cancelar',
        onCancel: () => {
          // Just hide the alert on cancel
          setAlertInfo({ ...alertInfo, visible: false });
        },
      });
    };

    const unsubscribe = navigation.addListener('beforeRemove', onBeforeRemove);

    return unsubscribe;
  }, [navigation, alertInfo]);

  // This separate effect handles enabling/disabling the back gesture.
  useEffect(() => {
    const hasUnsavedChanges = !!(firstName || lastName || dni || position || telefono || email || direccion || image);
    navigation.setOptions({
      gestureEnabled: !hasUnsavedChanges,
    });
  }, [navigation, firstName, lastName, dni, position, telefono, email, direccion, image]);

  const isValidEmail = (email) => {
    // Regex proporcionado para una validación de email más robusta.
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const isValidArgentinianDNI = (dni) => {
    // Valida que el DNI sea numérico y tenga entre 7 y 8 dígitos.
    return /^\d{7,8}$/.test(dni);
  };

  const isValidArgentinianPhone = (phone) => {
    // Valida números de 10 dígitos (formato común: código de área + número).
    return /^\d{10}$/.test(phone);
  };

  const isValidName = (name) => {
    return /^[a-zA-Z\sñÑ\u00C0-\u017F]*$/g.test(name);
  };

  const pickImage = async (source) => {
    try {
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

      if (!result) {
        Alert.alert('Error', 'No se obtuvo resultado del selector de imágenes.');
        return;
      }

      const canceled = result.canceled ?? result.cancelled ?? false;
      const assets = result.assets ?? (result.uri ? [{ uri: result.uri }] : null);

      if (!canceled && assets && assets.length > 0) {
        setImage(assets[0].uri);
      } else {
        console.log('pickImage: cancelado o sin assets', result);
      }
    } catch (err) {
      console.error('Error seleccionando imagen:', err);
      Alert.alert('Error seleccionando imagen', String(err));
    }
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

  const handleUpload = async (uri) => {
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
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert("Error", "Hubo un problema al subir la imagen.");
      return null;
    }
  };

  const handleSaveEmployee = async () => {
    const newErrors = {};

    // Validaciones
    if (!firstName.trim() || firstName.trim().length < 4 || firstName.trim().length > 25 || !isValidName(firstName)) newErrors.firstName = true;
    if (!lastName.trim() || lastName.trim().length < 4 || lastName.trim().length > 25 || !isValidName(lastName)) newErrors.lastName = true;
    if (!isValidArgentinianDNI(dni)) newErrors.dni = true;
    if (!position) newErrors.position = true;
    if (!isValidArgentinianPhone(telefono)) newErrors.telefono = true;
    if (!isValidEmail(email)) newErrors.email = true;
    if (!direccion.trim() || direccion.trim().length < 5 || direccion.trim().length > 100) newErrors.direccion = true;
    if (!image) newErrors.image = true;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      let message = "Por favor, corrige los campos marcados en rojo.";
      if (newErrors.image) {
        message = "Todos los campos son obligatorios, incluyendo la foto. Por favor, corrige los campos marcados en rojo.";
      }
      setAlertInfo({
        visible: true,
        title: "Campos inválidos",
        message: message,
        confirmButtonText: "Aceptar"
      });
      return;
    }

    // Si no hay errores, procede a guardar
    executeSave();
  };

  const executeSave = async () => {
    // Limpia errores antiguos antes de intentar guardar
    setErrors({});

    setLoading(true);
    let imageUrl = '';
    const errorAlertProps = { confirmButtonText: "Aceptar" };

    if (image) {
      imageUrl = await handleUpload(image);
      if (!imageUrl) {
        setLoading(false);
        return;
      }
    }

    try {
      await addDoc(collection(db, "employees"), {
        firstName,
        lastName,
        dni,
        position,
        telefono,
        email,
        direccion,
        imageUrl,
        status: 'Activo',
        createdAt: serverTimestamp(),
      });

      addActivity({
        type: 'new_employee',
        text: `Nuevo empleado ${firstName} ${lastName} ha sido añadido.`,
        time: new Date(),
      });

      setAlertInfo({
        visible: true,
        title: "Éxito",
        message: "Empleado registrado correctamente.",
        confirmButtonText: "Aceptar",
        onConfirm: () => navigation.goBack(),
      });

    } catch (error) {
      console.error("Error adding document: ", error);
      setAlertInfo({ visible: true, title: "Error", message: "Hubo un problema al registrar el empleado.", confirmButtonText: "Aceptar" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (setter, fieldName) => (text) => {
    setter(text);
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: false }));
    }
  };
  return (
    <>
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <CustomAlert
        visible={alertInfo.visible}
        title={alertInfo.title}
        message={alertInfo.message}
        confirmButtonText={alertInfo.confirmButtonText}
        cancelButtonText={alertInfo.cancelButtonText}
        onConfirm={() => {
          // Hide alert first, then run the confirm action
          setAlertInfo({ ...alertInfo, visible: false });
          if (alertInfo.onConfirm) {
            alertInfo.onConfirm();
          }
        }}
        onCancel={() => {
          // Hide alert first, then run the cancel action
          setAlertInfo({ ...alertInfo, visible: false });
          if (alertInfo.onCancel) {
            alertInfo.onCancel();
          }
        }}
      />
      <View style={styles.formContainer}>
        <Text style={styles.title}>Registrar Nuevo Empleado</Text>

        <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={handleImagePick}>
              {image ? ( 
                <Image source={{ uri: image }} style={styles.avatar} />
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

        <View style={[styles.inputContainer, errors.firstName && styles.errorBorder]}>
          <Feather name="user" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            placeholderTextColor={colors.placeholder}
            value={firstName}
            onChangeText={(text) => {
              const sanitizedText = text.replace(/[^a-zA-Z\sñÑ\u00C0-\u017F]/g, '');
              handleInputChange(setFirstName, 'firstName')(sanitizedText);
            }}
            maxLength={25}
          />
        </View>

        <View style={[styles.inputContainer, errors.lastName && styles.errorBorder]}>
          <Feather name="user" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Apellido"
            placeholderTextColor={colors.placeholder}
            value={lastName}
            onChangeText={(text) => {
              const sanitizedText = text.replace(/[^a-zA-Z\sñÑ\u00C0-\u017F]/g, '');
              handleInputChange(setLastName, 'lastName')(sanitizedText);
            }}
            maxLength={25}
          />
        </View>

        <View style={[styles.inputContainer, errors.dni && styles.errorBorder]}>
          <Feather name="credit-card" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="DNI"
            placeholderTextColor={colors.placeholder}
            value={dni}
            onChangeText={handleInputChange(text => setDni(text.replace(/[^0-9]/g, '')), 'dni')}
            keyboardType="numeric"
            maxLength={8}
          />
        </View>

        <View style={[styles.inputContainer, errors.position && styles.errorBorder]}>
          <Feather name="briefcase" size={20} style={styles.icon} />
          <Picker
            selectedValue={position}
            style={[styles.input, { paddingLeft: 0 }]}
            onValueChange={handleInputChange(setPosition, 'position')}
            dropdownIconColor={colors.text}
          >
            <Picker.Item label="Seleccionar cargo..." value="" color={colors.placeholder} />
            <Picker.Item label="Gerente" value="Gerente" />
            <Picker.Item label="Secretaria" value="Secretaria" />
            <Picker.Item label="Tecnico" value="Tecnico" />
            <Picker.Item label="Obrero" value="Obrero" />
          </Picker>
        </View>

        <View style={[styles.inputContainer, errors.telefono && styles.errorBorder]}>
          <Feather name="phone" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            placeholderTextColor={colors.placeholder}
            value={telefono}
            onChangeText={handleInputChange(text => setTelefono(text.replace(/[^0-9]/g, '')), 'telefono')}
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        <View style={[styles.inputContainer, errors.email && styles.errorBorder]}>
          <Feather name="mail" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.placeholder}
            value={email}
            onChangeText={handleInputChange(setEmail, 'email')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={[styles.inputContainer, errors.direccion && styles.errorBorder]}>
          <Feather name="map-pin" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Dirección"
            placeholderTextColor={colors.placeholder}
            value={direccion}
            onChangeText={handleInputChange(setDireccion, 'direccion')}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSaveEmployee} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Guardar Empleado</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
    <CustomActionSheet
        visible={actionSheetVisible}
        onClose={() => setActionSheetVisible(false)}
        options={imagePickerOptions}
      />
    </>
  );
}
