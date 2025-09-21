import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../src/config/firebaseConfig';
import { useTheme } from '@react-navigation/native';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { colors } = useTheme();
  const styles = getStyles(colors);
  
  const handleLogin = async () => {
    setError(''); // Limpiar errores previos
    if (!email || !password) {
      setError("Por favor, ingrese correo y contraseña.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // La navegación a Home se gestionará automáticamente por el listener de estado de autenticación en navigation.js
    } catch (error) {
      let errorMessage = "Hubo un problema al iniciar sesión.";
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "El formato del correo electrónico no es válido.";
          break;
        case 'auth/wrong-password':
          errorMessage = "La contraseña es incorrecta.";
          break;
        case 'auth/user-not-found':
          errorMessage = "No se encontró un usuario con este correo.";
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
    <View style={styles.container}>
      <Image source={require('../assets/Nuevas Energias.jpeg')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Iniciar sesión</Text>
      <Text style={styles.description}>Bienvenido. Ingresa tus credenciales para continuar.</Text>

      {/* <Text style={styles.label}>Correo</Text> */}
      <View style={styles.inputContainer}>
        <FontAwesome name="envelope" size={20} color={colors.text} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Ingrese su correo"
          placeholderTextColor={colors.border}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* <Text style={styles.label}>Contraseña</Text> */}
      <View style={styles.inputContainer}>
        <FontAwesome name="lock" size={20} color={colors.text} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Ingrese su contraseña"
          placeholderTextColor={colors.border}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <FontAwesome name={showPassword ? "eye-slash" : "eye"} size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Ingresar</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signUpText}>¿No tienes cuenta aún? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.background,
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
    fontWeight: 'bold',
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
