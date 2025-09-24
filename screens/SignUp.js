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
    } else {
      setFullNameError('');
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('El formato del correo no es válido.');
    } else {
      setEmailError('');
    }
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!passwordRegex.test(password)) {
      setPasswordError('Debe tener 6+ caracteres, mayúscula, minúscula y número.');
    } else {
      setPasswordError('');
    }
  };

  const validateConfirmPassword = (confirmPass) => {
    if (password !== confirmPass) {
      setConfirmPasswordError('Las contraseñas no coinciden.');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleSignUp = async () => {
    // Run all validations before submitting
    validateFullName(fullName);
    validateEmail(email);
    validatePassword(password);
    validateConfirmPassword(confirmPassword);

    if (fullNameError || emailError || passwordError || confirmPasswordError || !fullName || !email || !password || !confirmPassword) {
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
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "El correo electrónico ya está en uso.";
      }
      setFullNameError(errorMessage); // Displaying general error
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.kbView}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Image source={require('../assets/logo-nuevas-energias-v2.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Crear una Cuenta</Text>
        <Text style={styles.description}>Completa tus datos para empezar.</Text>

        <View style={styles.inputWrapper}>
          <View style={[styles.inputContainer, fullNameError ? styles.inputError : {}]}>
            <Feather name="user" size={20} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Nombre Completo"
              placeholderTextColor={colors.placeholder}
              value={fullName}
              onChangeText={setFullName}
              onBlur={() => validateFullName(fullName)}
            />
          </View>
          {fullNameError ? <Text style={styles.errorText}>{fullNameError}</Text> : null}
        </View>

        <View style={styles.inputWrapper}>
          <View style={[styles.inputContainer, emailError ? styles.inputError : {}]}>
            <Feather name="mail" size={20} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="ejemplo@email.com"
              placeholderTextColor={colors.placeholder}
              value={email}
              onChangeText={setEmail}
              onBlur={() => validateEmail(email)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        <View style={styles.inputWrapper}>
          <View style={[styles.inputContainer, passwordError ? styles.inputError : {}]}>
            <Feather name="lock" size={20} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              placeholderTextColor={colors.placeholder}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                validatePassword(text);
                if (confirmPassword) validateConfirmPassword(confirmPassword);
              }}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={20} style={styles.icon} />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        </View>

        <View style={styles.inputWrapper}>
          <View style={[styles.inputContainer, confirmPasswordError ? styles.inputError : {}]}>
            <Feather name="lock" size={20} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Confirmar Contraseña"
              placeholderTextColor={colors.placeholder}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                validateConfirmPassword(text);
              }}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Feather name={showConfirmPassword ? "eye-off" : "eye"} size={20} style={styles.icon} />
            </TouchableOpacity>
          </View>
          {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
        </View>

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
    width: '100%',
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
    color: colors.primary,
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
});
