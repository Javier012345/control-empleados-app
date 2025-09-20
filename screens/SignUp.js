import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { auth, db } from '../src/config/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function SignUp({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Error",
        "La contraseña debe tener al menos 6 caracteres, incluyendo una letra mayúscula, una minúscula y un número."
      );
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Guardar información adicional del usuario en Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName: firstName,
        lastName: lastName,
        email: email,
      });

      // La navegación a Home se gestionará automáticamente por el listener de estado de autenticación en navigation.js
    } catch (error) {
      let errorMessage = "Hubo un problema al registrar el usuario.";
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "El correo electrónico ya está en uso.";
          break;
        case 'auth/invalid-email':
          errorMessage = "El formato del correo electrónico no es válido.";
          break;
        case 'auth/weak-password':
          errorMessage = "La contraseña es demasiado débil.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Error de conexión, por favor intenta más tarde.";
          break;
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/icon.png')} style={styles.logo} />
      <Text style={styles.title}>Regístrate</Text>

      <Text style={styles.label}>Nombre</Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="user" size={20} color="#ccc" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Ingrese su nombre"
          value={firstName}
          onChangeText={setFirstName}
        />
      </View>

      <Text style={styles.label}>Apellido</Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="user" size={20} color="#ccc" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Ingrese su apellido"
          value={lastName}
          onChangeText={setLastName}
        />
      </View>

      <Text style={styles.label}>Correo</Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="envelope" size={20} color="#ccc" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Ingrese su correo"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <Text style={styles.label}>Contraseña</Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={20} color="#ccc" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Ingrese su contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Confirmar Contraseña</Text>
      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={20} color="#ccc" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Confirme su contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <FontAwesome name={showConfirmPassword ? "eye-slash" : "eye"} size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Registrarse</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.signUpText}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
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
    marginBottom: 15,
    width: '100%',
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
    backgroundColor: '#922b21',
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signUpText: {
    marginTop: 20,
    color: '#007bff',
  },
});
