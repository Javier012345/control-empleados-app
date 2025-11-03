import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../src/config/firebaseConfig';
import { useTheme } from '@react-navigation/native';
import CustomAlert from '../../src/components/CustomAlert';
import { getStyles } from './Login.styles';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [alert, setAlert] = useState({ visible: false, title: '', message: '' });
  
  const { dark: isDarkMode, colors } = useTheme();
  const styles = getStyles(isDarkMode, colors);

  const validateEmail = (text) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (text && !emailRegex.test(text)) {
      setEmailError('Formato de email inválido');
    } else {
      setEmailError('');
    }
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    validateEmail(text);
  };

  const validatePassword = (text) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{6,}$/;
    if (text && !passwordRegex.test(text)) {
      setPasswordError('Debe tener 6+ caracteres');
    } else {
      setPasswordError('');
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    validatePassword(text);
  };

  const handleLogin = async () => {
    if (emailError || passwordError || !email || !password) {
      setAlert({ visible: true, title: 'Atención', message: 'Por favor, completa ambos campos correctamente.' });
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigation to Home is handled by the auth state listener
    } catch (error) {
      setAlert({ visible: true, title: 'Error', message: 'Las credenciales son incorrectas.' });
    } finally {
      setLoading(false);
    }
  };

  // ...existing code...
return (
    <>
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        onConfirm={() => setAlert({ visible: false, title: '', message: '' })}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Image source={require('../../assets/logo-nuevas-energias-v2.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>Iniciar Sesión</Text>
          <Text style={styles.description}>Ingresa tus credenciales para acceder a tu cuenta.</Text>

          {/* Etiqueta Email */}
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <Feather name="mail" size={20} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="ejemplo@email.com"
              placeholderTextColor={colors.placeholder}
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          
          {/* Etiqueta Contraseña */}
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.inputContainer}>
            <Feather name="lock" size={20} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Ej: Ejemplo123"
              placeholderTextColor={colors.placeholder}
              value={password}
              onChangeText={handlePasswordChange}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={20} style={styles.icon} />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}


          <TouchableOpacity style={[styles.button, (!!emailError || !!passwordError) && styles.buttonDisabled]} onPress={handleLogin} disabled={loading || !!emailError || !!passwordError}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.signUpText}>
              ¿No tenés una cuenta? <Text style={styles.signUpLink}>Regístrate</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};
