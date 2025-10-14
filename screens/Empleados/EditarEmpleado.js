import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { db } from '../../src/config/firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import CustomAlert from '../../src/components/CustomAlert';

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
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '', onConfirm: null, onCancel: null });

  const handleUpdateEmployee = async () => {
    if (!firstName || !lastName || !dni || !position || !telefono || !email || !direccion) {
      setAlertConfig({
        title: 'Error',
        message: 'Todos los campos son obligatorios.',
        onConfirm: () => setAlertVisible(false),
        onCancel: () => setAlertVisible(false),
      });
      setAlertVisible(true);
      return;
    }

    setAlertConfig({
      title: 'Confirmar Edición',
      message: '¿Estás seguro de que quieres guardar los cambios?',
      onConfirm: () => {
        setAlertVisible(false);
        executeUpdate();
      },
      onCancel: () => setAlertVisible(false),
    });
    setAlertVisible(true);
  };

  const executeUpdate = async () => {
    setLoading(true);
    const employeeRef = doc(db, "employees", employee.id);

    try {
      await updateDoc(employeeRef, {
        firstName: firstName,
        lastName: lastName,
        dni: dni,
        position: position,
        telefono: telefono,
        email: email,
        direccion: direccion,
      });

      setAlertConfig({
        title: 'Éxito',
        message: 'Empleado actualizado correctamente.',
        onConfirm: () => {
          setAlertVisible(false);
          navigation.popToTop();
        },
        onCancel: () => {
          setAlertVisible(false);
          navigation.popToTop();
        },
      });
      setAlertVisible(true);

    } catch (error) {
      console.error("Error updating document: ", error);
      setAlertConfig({
        title: 'Error',
        message: 'Hubo un problema al actualizar el empleado.',
        onConfirm: () => setAlertVisible(false),
        onCancel: () => setAlertVisible(false),
      });
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        onConfirm={alertConfig.onConfirm}
        onCancel={alertConfig.onCancel}
      />
      <View style={styles.formContainer}>
        <Text style={styles.title}>Editar Datos del Empleado</Text>

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
    backgroundColor: colors.background,
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