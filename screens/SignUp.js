import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../src/config/firebaseConfig';
import { useTheme } from '@react-navigation/native';

export default function SignUp({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [generalError, setGeneralError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const { dark: isDarkMode, colors } = useTheme();
  const styles = getStyles(isDarkMode, colors);

  const validateFullName = (name) => {
    if (!name.trim()) {
      setFullNameError('El nombre completo es obligatorio.');
      return false;
    } else {
      setFullNameError('');
      return true;
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('El correo es obligatorio.');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('El formato del correo no es válido.');
      return false;
    } else {
      setEmailError('');
      return true;
    }
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!password) {
      setPasswordError('La contraseña es obligatoria.');
      return false;
    } else if (!passwordRegex.test(password)) {
      setPasswordError('Debe tener 6+ caracteres, mayúscula, minúscula y número.');
      return false;
    } else {
      setPasswordError('');
      return true;
    }
  };

  const validateConfirmPassword = (confirmPass) => {
    if (!confirmPass) {
      setConfirmPasswordError('Debes confirmar la contraseña.');
      return false;
    } else if (password !== confirmPass) {
      setConfirmPasswordError('Las contraseñas no coinciden.');
      return false;
    } else {
      setConfirmPasswordError('');
      return true;
    }
  };

  const handleSignUp = async () => {
    const isFullNameValid = validateFullName(fullName);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!isFullNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const nameParts = fullName.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      await setDoc(doc(db, "users", user.uid), {
        firstName: firstName,
        lastName: lastName,
        email: email,
      });
      // Navigation to Home is handled by the auth state listener
    } catch (error) {
      let errorMessage = "Hubo un problema al registrar el usuario.";
      switch (error.code) {
        case 'auth/email-already-in-use':
          setEmailError("El correo electrónico ya está en uso.");
          break;
        default:
          setGeneralError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.kbView}>
  <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
    <Image source={require('../assets/logo-nuevas-energias-v2.png')} style={styles.logo} resizeMode="contain" />
    <Text style={styles.title}>Registro</Text>
    <Text style={styles.description}>Crea una cuenta para empezar a utilizar la aplicación.</Text>

    {/* Nombre completo */}
    <Text style={styles.label}>Nombre</Text>
    <View style={[styles.inputContainer, fullNameError ? styles.inputError : {}]}>
      <Feather name="user" size={20} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        placeholderTextColor={colors.placeholder}
        value={fullName}
        onChangeText={text => {
          setFullName(text);
          if (fullNameError) setFullNameError('');
        }}
      />
    </View>
    {fullNameError ? <Text style={styles.errorText}>{fullNameError}</Text> : null}

    {/* Email */}
    <Text style={styles.label}>Email</Text>
    <View style={[styles.inputContainer, emailError ? styles.inputError : {}]}>
      <Feather name="mail" size={20} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="ejemplo@email.com"
        placeholderTextColor={colors.placeholder}
        value={email}
        onChangeText={text => {
          setEmail(text);
          if (emailError) setEmailError('');
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
    </View>
    {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

    {/* Contraseña */}
    <Text style={styles.label}>Contraseña</Text>
    <View style={[styles.inputContainer, passwordError ? styles.inputError : {}]}>
      <Feather name="lock" size={20} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Ej: Ejemplo123"
        placeholderTextColor={colors.placeholder}
        value={password}
        onChangeText={text => {
          setPassword(text);
          if (passwordError) setPasswordError('');
        }}
        secureTextEntry={!showPassword}
      />
      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
        <Feather name={showPassword ? "eye-off" : "eye"} size={20} style={styles.icon} />
      </TouchableOpacity>
    </View>
    {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

    {/* Confirmar contraseña */}
    <Text style={styles.label}>Confirmar contraseña</Text>
    <View style={[styles.inputContainer, confirmPasswordError ? styles.inputError : {}]}>
      <Feather name="lock" size={20} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Ej: Ejemplo123"
        placeholderTextColor={colors.placeholder}
        value={confirmPassword}
        onChangeText={text => {
          setConfirmPassword(text);
          if (confirmPasswordError) setConfirmPasswordError('');
        }}
        secureTextEntry={!showConfirmPassword}
      />
      <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
        <Feather name={showConfirmPassword ? "eye-off" : "eye"} size={20} style={styles.icon} />
      </TouchableOpacity>
    </View>
    {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
    {generalError ? <Text style={styles.errorText}>{generalError}</Text> : null}

    <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text style={styles.buttonText}>Registrarse</Text>
      )}
    </TouchableOpacity>

    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
      <Text style={styles.signInText}>
        ¿Ya tienes una cuenta? <Text style={styles.signInLink}>Inicia Sesión</Text>
      </Text>
    </TouchableOpacity>
  </ScrollView>
</KeyboardAvoidingView>
  );
}

const getStyles = (isDarkMode, colors) => StyleSheet.create({
  kbView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.7,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    height: 50,
  },
  inputError: {
    borderColor: colors.primary,
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
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: colors.text,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  signInText: {
    marginTop: 24,
    color: colors.text,
    opacity: 0.7,
    fontSize: 14,
  },
  signInLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  label: {
  alignSelf: 'flex-start',
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 5,
  color: colors.text,
  marginLeft: 4,
},
});