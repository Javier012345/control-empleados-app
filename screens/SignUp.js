import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { auth, db } from '../src/config/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useTheme } from '@react-navigation/native';

export default function SignUp({ navigation }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleEmailChange = (text) => {
  setEmail(text);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(text)) {
    setEmailError('El formato del correo electrónico no es válido.');
  } else {
    setEmailError('');
  }
};

  const handleConfirmPasswordChange = (text) => {
  setConfirmPassword(text);
  if (password && text !== password) {
    setConfirmPasswordError('Las contraseñas no coinciden.');
  } else {
    setConfirmPasswordError('');
  }
};

  const handlePasswordChange = (text) => {
  setPassword(text);
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
  if (!passwordRegex.test(text)) {
    setPasswordError('Debe tener al menos 6 caracteres, una mayúscula, una minúscula y un número.');
  } else {
    setPasswordError('');
  }
};

  const handleSignUp = async () => {
    setError('');
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
      setError(
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
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.scroll}>
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../assets/Nuevas Energias.jpeg')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Regístrate</Text>
      <Text style={styles.description}>Crea tu cuenta para acceder a todas las funcionalidades.</Text>

      {/* <Text style={styles.label}>Nombre</Text> */}
      <View style={styles.inputContainer}>
        <FontAwesome name="user" size={20} color={colors.text} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Ingrese su nombre"
          placeholderTextColor={colors.border}
          value={firstName}
          onChangeText={setFirstName}
        />
      </View>

      {/* <Text style={styles.label}>Apellido</Text> */}
      <View style={styles.inputContainer}>
        <FontAwesome name="user" size={20} color={colors.text} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Ingrese su apellido"
          placeholderTextColor={colors.border}
          value={lastName}
          onChangeText={setLastName}
        />
      </View>

      {/* <Text style={styles.label}>Correo</Text> */}
      <View style={styles.inputContainer}>
        <FontAwesome name="envelope" size={20} color={colors.text} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Ingrese su correo"
          placeholderTextColor={colors.border}
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      {/* <Text style={styles.label}>Contraseña</Text> */}
      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={20} color={colors.text} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Ingrese su contraseña"
          placeholderTextColor={colors.border}
          value={password}
          onChangeText={handlePasswordChange}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

      {/* <Text style={styles.label}>Confirmar Contraseña</Text> */}
      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={20} color={colors.text} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Confirme su contraseña"
          placeholderTextColor={colors.border}
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          secureTextEntry={!showConfirmPassword}
          
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <FontAwesome name={showConfirmPassword ? "eye-slash" : "eye"} size={20} color={colors.text} />
        </TouchableOpacity>
      </View>
      {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Registrarse</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.signUpText}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 140,
    height: 140,
    borderRadius: 70, // Hace la imagen circular
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.text,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 30,
    maxWidth: '85%',
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.border,
    height: 50,
    marginBottom: 15,
    width: '100%',
  },
  icon: {
    marginRight: 10,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  signUpText: {
    marginTop: 20,
    color: colors.primary,
  },
});
