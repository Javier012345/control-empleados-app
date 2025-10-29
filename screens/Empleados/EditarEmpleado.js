import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Image, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../../src/config/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { useAppContext } from '../../src/context/AppContext';
import CustomAlert from '../../src/components/CustomAlert';
import CustomActionSheet from '../../screens/Usuarios/CustomActionSheet';
import { cloudinaryConfig } from '../../src/config/cloudinaryConfig';
import { getStyles } from './EditarEmpleado.styles';

export default function EditarEmpleado({ route, navigation }) {
  const { employee } = route.params;
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { addActivity } = useAppContext();

  const [firstName, setFirstName] = useState(employee.firstName);
  const [lastName, setLastName] = useState(employee.lastName);
  const [dni, setDni] = useState(employee.dni);
  const [position, setPosition] = useState(employee.position);
  const [telefono, setTelefono] = useState(employee.telefono);
  const [email, setEmail] = useState(employee.email);
  const [direccion, setDireccion] = useState(employee.direccion);
  const [image, setImage] = useState(employee.imageUrl || null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [alertInfo, setAlertInfo] = useState({ visible: false, title: '', message: '', onConfirm: null, onCancel: null });
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [imagePickerAction, setImagePickerAction] = useState(null);

  useEffect(() => { if (imagePickerAction) { pickImage(imagePickerAction); setImagePickerAction(null); } }, [imagePickerAction]);

  // This ref stores the latest form state to avoid stale closures in the event listener.
  const formStateRef = React.useRef({ firstName, lastName, dni, position, telefono, email, direccion, image, employee });
  formStateRef.current = { firstName, lastName, dni, position, telefono, email, direccion, image, employee };

  useEffect(() => {
    const onBeforeRemove = (e) => {
      // Get the latest state directly from the ref.
      const { firstName, lastName, dni, position, telefono, email, direccion, image, employee } = formStateRef.current;
      
      const hasUnsavedChanges = (
        firstName.trim() !== (employee.firstName || '').trim() ||
        lastName.trim() !== (employee.lastName || '').trim() ||
        dni.trim() !== (employee.dni || '').trim() ||
        position !== (employee.position || '') ||
        telefono.trim() !== (employee.telefono || '').trim() ||
        email.trim() !== (employee.email || '').trim() ||
        direccion.trim() !== (employee.direccion || '').trim() ||
        image !== (employee.imageUrl || null)
      );

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
    const hasUnsavedChanges = (
        firstName.trim() !== (employee.firstName || '').trim() ||
        lastName.trim() !== (employee.lastName || '').trim() ||
        dni.trim() !== (employee.dni || '').trim() ||
        position !== (employee.position || '') ||
        telefono.trim() !== (employee.telefono || '').trim() ||
        email.trim() !== (employee.email || '').trim() ||
        direccion.trim() !== (employee.direccion || '').trim() ||
        image !== (employee.imageUrl || null)
    );
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
    if (uri.startsWith('http')) {
      return uri;
    }

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
      setAlertInfo({ visible: true, title: 'Error', message: 'Hubo un problema al subir la nueva imagen.', confirmButtonText: 'Aceptar' });
      return null;
    }
  };

  const handleInputChange = (setter, fieldName) => (text) => {
    setter(text);
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleUpdateEmployee = async () => {
    const newErrors = {};

    // Validaciones
    if (!firstName.trim() || firstName.trim().length < 2 || firstName.trim().length > 30) newErrors.firstName = true;
    if (!lastName.trim() || lastName.trim().length < 2 || lastName.trim().length > 30) newErrors.lastName = true;
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
    setAlertInfo({
      visible: true,
      title: 'Confirmar Edición',
      message: '¿Estás seguro de que quieres guardar los cambios?',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      onConfirm: () => {
        setAlertInfo({ visible: false });
        executeUpdate();
      },
      onCancel: () => setAlertInfo({ visible: false }),
    });
  };

  const executeUpdate = async () => {
    setLoading(true);
    let imageUrl = image;

    if (image && image !== employee.imageUrl) {
      imageUrl = await handleUpload(image);
      if (!imageUrl) {
        setLoading(false);
        return;
      }
    }

    const employeeRef = doc(db, "employees", employee.id);

    try {
      await updateDoc(employeeRef, {
        firstName,
        lastName,
        dni,
        position,
        telefono,
        email,
        direccion,
        imageUrl,
      });

      setAlertInfo({
        visible: true,
        title: 'Éxito',
        message: 'Empleado actualizado correctamente.',
        confirmButtonText: 'Aceptar',
        onConfirm: () => navigation.popToTop(),
      });

      addActivity({ type: 'update_employee', text: `Empleado ${firstName} ${lastName} ha sido actualizado.`, time: new Date() });

    } catch (error) {
      console.error("Error updating document: ", error);
      setAlertInfo({
        visible: true,
        title: 'Error',
        message: 'Hubo un problema al actualizar el empleado.',
        confirmButtonText: 'Aceptar',
      });
    } finally {
      setLoading(false);
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
          const callback = alertInfo.onConfirm;
          setAlertInfo({ visible: false });
          if (callback) callback();
        }}
        onCancel={() => {
          const callback = alertInfo.onCancel;
          setAlertInfo({ visible: false });
          if (callback) callback();
        }}
      />
      <View style={styles.formContainer}>
        <Text style={styles.title}>Editar Datos del Empleado</Text>

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
            onChangeText={handleInputChange(text => setFirstName(text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')), 'firstName')}
          />
        </View>

        <View style={[styles.inputContainer, errors.lastName && styles.errorBorder]}>
          <Feather name="user" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Apellido"
            placeholderTextColor={colors.placeholder}
            value={lastName}
            onChangeText={handleInputChange(text => setLastName(text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '')), 'lastName')}
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

        <TouchableOpacity style={styles.button} onPress={handleUpdateEmployee} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Actualizar Empleado</Text>
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
