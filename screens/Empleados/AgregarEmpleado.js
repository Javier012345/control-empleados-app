import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { db } from '../../src/config/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function AgregarEmpleado({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dni, setDni] = useState('');
  const [position, setPosition] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddEmployee = async () => {
    if (!firstName || !lastName || !dni || !position) {
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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Datos del Empleado</Text>

        <Text style={styles.label}>Nombre</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="user" size={20} color="#ccc" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Ingrese el nombre"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        <Text style={styles.label}>Apellido</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="user" size={20} color="#ccc" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Ingrese el apellido"
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        <Text style={styles.label}>DNI</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="id-card" size={18} color="#ccc" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Ingrese el DNI"
            value={dni}
            onChangeText={setDni}
            keyboardType="numeric"
          />
        </View>

        <Text style={styles.label}>Cargo</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="briefcase" size={20} color="#ccc" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Ingrese el cargo"
            value={position}
            onChangeText={setPosition}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#343a40',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 5,
    color: '#495057',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
    height: 50,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});