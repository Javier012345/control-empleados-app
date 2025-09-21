import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { db } from '../../src/config/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

export default function EditarEmpleado({ route, navigation }) {
  const { employee } = route.params;
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const [firstName, setFirstName] = useState(employee.firstName);
  const [lastName, setLastName] = useState(employee.lastName);
  const [dni, setDni] = useState(employee.dni);
  const [position, setPosition] = useState(employee.position);
  const [loading, setLoading] = useState(false);

  const handleUpdateEmployee = async () => {
    if (!firstName || !lastName || !dni || !position) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }

    setLoading(true);
    const employeeRef = doc(db, "employees", employee.id);

    try {
      await updateDoc(employeeRef, {
        firstName: firstName,
        lastName: lastName,
        dni: dni,
        position: position,
      });

      Alert.alert("Éxito", "Empleado actualizado correctamente.");
      navigation.goBack();

    } catch (error) {
      console.error("Error updating document: ", error);
      Alert.alert("Error", "Hubo un problema al actualizar el empleado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.formContainer}>
        <Text style={styles.title}>Editar Datos</Text>

        <Text style={styles.label}>Nombre</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="user" size={20} color={colors.border} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Ingrese el nombre"
            placeholderTextColor={colors.border}
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        <Text style={styles.label}>Apellido</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="user" size={20} color={colors.border} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Ingrese el apellido"
            placeholderTextColor={colors.border}
            value={lastName}
            onChangeText={setLastName}
          />
        </View>

        <Text style={styles.label}>DNI</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="id-card" size={18} color={colors.border} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Ingrese el DNI"
            placeholderTextColor={colors.border}
            value={dni}
            onChangeText={setDni}
            keyboardType="numeric"
          />
        </View>

        <Text style={styles.label}>Cargo</Text>
        <View style={styles.inputContainer}>
          <FontAwesome name="briefcase" size={20} color={colors.border} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Ingrese el cargo"
            placeholderTextColor={colors.border}
            value={position}
            onChangeText={setPosition}
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

const getStyles = (colors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContainer: { flexGrow: 1, justifyContent: 'center' },
  formContainer: { padding: 20, },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    textAlign: 'center', 
    color: colors.text 
  },
  label: { 
    fontSize: 16, 
    fontWeight: '600', 
    marginTop: 15, 
    marginBottom: 5, 
    color: colors.text 
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: colors.card, 
    borderRadius: 8, 
    paddingHorizontal: 10, 
    borderWidth: 1, 
    borderColor: colors.border, 
    height: 50 
  },
  icon: { marginRight: 10 },
  input: { flex: 1, height: '100%', fontSize: 16, color: colors.text },
  button: { 
    backgroundColor: colors.primary, 
    paddingVertical: 15, 
    borderRadius: 8, 
    marginTop: 30, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
});