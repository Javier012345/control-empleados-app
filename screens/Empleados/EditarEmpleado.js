import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../../src/config/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import CustomAlert from '../../src/components/CustomAlert';
import { cloudinaryConfig } from '../../src/config/cloudinaryConfig';
import { getStyles } from './EditarEmpleado.styles';

export default function EditarEmpleado({ route, navigation }) {
  const { employee } = route.params;
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [firstName, setFirstName] = useState(employee.firstName);
  const [lastName, setLastName] = useState(employee.lastName);
  const [dni, setDni] = useState(employee.dni);
  const [position, setPosition] = useState(employee.position);
  const [telefono, setTelefono] = useState(employee.telefono);
  const [email, setEmail] = useState(employee.email);
  const [direccion, setDireccion] = useState(employee.direccion);
  const [image, setImage] = useState(employee.imageUrl || null); // Usar imageUrl
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ visible: false, title: '', message: '', onConfirm: null, onCancel: null });

  const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleUpload = async (uri) => {
    // Si la imagen no ha cambiado (sigue siendo una URL de Cloudinary), no la subas de nuevo.
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
      setAlertInfo({ visible: true, title: 'Error', message: 'Hubo un problema al subir la nueva imagen.' });
      return null;
    }
  };

  const validateForm = () => {
    if (!firstName || !lastName || !dni || !position || !telefono || !email || !direccion || !image) return 'Todos los campos son obligatorios, incluyendo la foto.';
    if (!/^[a-zA-Z\s]+$/.test(firstName)) return 'El nombre solo debe contener letras y espacios.';
    if (!/^[a-zA-Z\s]+$/.test(lastName)) return 'El apellido solo debe contener letras y espacios.';
    if (!/^[0-9]+$/.test(dni)) return 'El DNI debe ser solo numérico.';
    if (!/^[0-9]+$/.test(telefono)) return 'El teléfono debe ser solo numérico.';
    if (!isValidEmail(email)) return 'El email no es válido.';
    return null;
  };

  const handleUpdateEmployee = () => {
    const errorMessage = validateForm();
    if (errorMessage) {
      setAlertInfo({ visible: true, title: 'Dato inválido', message: errorMessage });
      return;
    }

    setAlertInfo({
      visible: true,
      title: 'Confirmar Edición',
      message: '¿Estás seguro de que quieres guardar los cambios?',
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
        return; // Detener si la carga de la imagen falla
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
        imageUrl, // Actualizar la URL de la imagen
      });

      setAlertInfo({
        visible: true,
        title: 'Éxito',
        message: 'Empleado actualizado correctamente.',
        onConfirm: () => navigation.popToTop(),
      });

    } catch (error) {
      console.error("Error updating document: ", error);
      setAlertInfo({
        visible: true,
        title: 'Error',
        message: 'Hubo un problema al actualizar el empleado.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <CustomAlert
        visible={alertInfo.visible}
        title={alertInfo.title}
        message={alertInfo.message}
        onConfirm={() => {
          setAlertInfo({ visible: false });
          if (alertInfo.onConfirm) alertInfo.onConfirm();
        }}
        onCancel={alertInfo.onCancel ? () => setAlertInfo({ visible: false }) : null}
      />
      <View style={styles.formContainer}>
        <Text style={styles.title}>Editar Datos del Empleado</Text>

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          ) : (
            <>
              <Feather name="camera" size={24} color={colors.primary} />
              <Text style={styles.imagePickerText}>Añadir Foto</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Feather name="user" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            placeholderTextColor={colors.placeholder}
            value={firstName}
            onChangeText={text => setFirstName(text.replace(/[^a-zA-Z\s]/g, ''))}
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="user" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Apellido"
            placeholderTextColor={colors.placeholder}
            value={lastName}
            onChangeText={text => setLastName(text.replace(/[^a-zA-Z\s]/g, ''))}
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="credit-card" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="DNI"
            placeholderTextColor={colors.placeholder}
            value={dni}
            onChangeText={text => setDni(text.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            maxLength={12}
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="briefcase" size={20} style={styles.icon} />
          <Picker
            selectedValue={position}
            style={[styles.input, { paddingLeft: 0 }]}
            onValueChange={setPosition}
            dropdownIconColor={colors.text}
          >
            <Picker.Item label="Seleccionar cargo..." value="" color={colors.placeholder} />
            <Picker.Item label="Gerente" value="Gerente" />
            <Picker.Item label="Secretaria" value="Secretaria" />
            <Picker.Item label="Tecnico" value="Tecnico" />
            <Picker.Item label="Obrero" value="Obrero" />
          </Picker>
        </View>

        <View style={styles.inputContainer}>
          <Feather name="phone" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            placeholderTextColor={colors.placeholder}
            value={telefono}
            onChangeText={text => setTelefono(text.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
            maxLength={15}
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="mail" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="map-pin" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Dirección"
            placeholderTextColor={colors.placeholder}
            value={direccion}
            onChangeText={setDireccion}
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
  );
}
