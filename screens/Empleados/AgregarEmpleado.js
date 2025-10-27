import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../../src/config/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { cloudinaryConfig } from '../../src/config/cloudinaryConfig';

import CustomAlert from '../../src/components/CustomAlert';
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
  const [alertInfo, setAlertInfo] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

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
    if (!firstName || !lastName || !dni || !position || !telefono || !email || !direccion || !image) {
      setAlertInfo({ visible: true, title: "Campos requeridos", message: "Todos los campos son obligatorios, incluyendo la foto.", confirmButtonText: "Aceptar" });
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(firstName)) {
      setAlertInfo({ visible: true, title: "Dato inválido", message: "El nombre solo debe contener letras y espacios.", confirmButtonText: "Aceptar" });
      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(lastName)) {
      setAlertInfo({ visible: true, title: "Dato inválido", message: "El apellido solo debe contener letras y espacios." });
      return;
    }
    if (!/^[0-9]+$/.test(dni)) {
      setAlertInfo({ visible: true, title: "Dato inválido", message: "El DNI debe ser solo numérico.", confirmButtonText: "Aceptar" });
      return;
    }
    if (!/^[0-9]+$/.test(telefono)) {
      setAlertInfo({ visible: true, title: "Dato inválido", message: "El teléfono debe ser solo numérico.", confirmButtonText: "Aceptar" });
      return;
    }
    if (!isValidEmail(email)) {
      setAlertInfo({ visible: true, title: "Dato inválido", message: "El email no es válido.", confirmButtonText: "Aceptar" });
      return;
    }

    setLoading(true);
    let imageUrl = '';
    // Asegurarse de que cualquier alerta de error durante la subida de imagen también tenga el botón "Aceptar"
    // Esto es una mejora general para la consistencia de las alertas de error.
    const errorAlertProps = { confirmButtonText: "Aceptar" };

    if (image) {
      imageUrl = await handleUpload(image);
      if (!imageUrl) {
        setLoading(false);
        return; // Detener si la carga de la imagen falla
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
        confirmButtonText: "Aceptar", // También para la alerta de éxito
        onConfirm: () => navigation.goBack(),
      });

    } catch (error) {
      console.error("Error adding document: ", error);
      setAlertInfo({ visible: true, title: "Error", message: "Hubo un problema al registrar el empleado.", confirmButtonText: "Aceptar" });
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
        confirmButtonText={alertInfo.confirmButtonText} // Pasa el texto personalizado
        onConfirm={() => {
          setAlertInfo({ ...alertInfo, visible: false });
          if (alertInfo.onConfirm) alertInfo.onConfirm();
        }}
      />
      <View style={styles.formContainer}>
        <Text style={styles.title}>Registrar Nuevo Empleado</Text>

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

        <TouchableOpacity style={styles.button} onPress={handleSaveEmployee} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Guardar Empleado</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
