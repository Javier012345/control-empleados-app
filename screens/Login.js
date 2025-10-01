import React, { useState } from 'react';
import { Alert } from 'react-native';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { useTheme } from '@react-navigation/native';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Eliminamos los errores visuales

  const { dark: isDarkMode, colors } = useTheme();
  const styles = getStyles(isDarkMode, colors);

  // No validamos ni mostramos errores en pantalla

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Navigation to Home is handled by the auth state listener
    } catch (error) {
      Alert.alert('Error', 'Las credenciales son incorrectas.');
    } finally {
      setLoading(false);
    }
  };

  // ...existing code...
return (
  <View style={styles.container}>
    <Image source={require('../assets/logo-nuevas-energias-v2.png')} style={styles.logo} resizeMode="contain" />
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
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
    </View>

    {/* Etiqueta Contraseña */}
    <Text style={styles.label}>Contraseña</Text>
  <View style={styles.inputContainer}>
      <Feather name="lock" size={20} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Ej: Ejemplo123"
        placeholderTextColor={colors.placeholder}
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
      />
      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
        <Feather name={showPassword ? "eye-off" : "eye"} size={20} style={styles.icon} />
      </TouchableOpacity>
    </View>


    <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      )}
    </TouchableOpacity>

    <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
      <Text style={styles.signUpText}>
        ¿No tienes una cuenta? <Text style={styles.signUpLink}>Regístrate</Text>
      </Text>
    </TouchableOpacity>
  </View>
);
};


const getStyles = (isDarkMode, colors) => StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 10,
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
  generalErrorText: {
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },
  signUpText: {
    marginTop: 24,
    color: colors.text,
    opacity: 0.7,
    fontSize: 14,
  },
  signUpLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  label: {
  alignSelf: 'flex-start',
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 5,
  marginTop: 15,
  color: colors.text,
  marginLeft: 4,
  },
});
