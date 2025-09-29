import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { db } from '../../src/config/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function AgregarEmpleado({ navigation }) {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dni, setDni] = useState('');
  const [position, setPosition] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddEmployee = async () => {
    if (!firstName || !lastName || !dni || !position || !telefono || !email || !direccion) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "employees"), {
        firstName: firstName,
        lastName: lastName,
        dni: dni,
        position: position,
        telefono: telefono,
        email: email,
        direccion: direccion,
        status: 'Activo', // Estado por defecto
        createdAt: serverTimestamp(),
      });

      Alert.alert("Éxito", "Empleado registrado correctamente.");
      navigation.goBack();

    } catch (error) {
      console.error("Error adding document: ", error);
      Alert.alert("Error", "Hubo un problema al registrar el empleado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.formContainer}>
        <Text style={styles.title}>Registrar Nuevo Empleado</Text>

        <View style={styles.inputContainer}>
          <Feather name="user" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            placeholderTextColor={colors.placeholder}
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="user" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Apellido"
            placeholderTextColor={colors.placeholder}
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="credit-card" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="DNI"
            placeholderTextColor={colors.placeholder}
            value={dni}
            onChangeText={setDni}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="briefcase" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Cargo"
            placeholderTextColor={colors.placeholder}
            value={position}
            onChangeText={setPosition}
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="phone" size={20} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            placeholderTextColor={colors.placeholder}
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
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

        <TouchableOpacity style={styles.button} onPress={handleAddEmployee} disabled={loading}>
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

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  formContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
    color: colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background, // Slightly different background for inputs
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    height: 50,
    marginBottom: 16,
  },
  icon: {
    color: colors.text,
    opacity: 0.6,
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
