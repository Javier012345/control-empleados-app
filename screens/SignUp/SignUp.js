import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../src/config/firebaseConfig';
import { useTheme } from '@react-navigation/native';
import CustomAlert from '../../src/components/CustomAlert';
import { useAppContext } from '../../src/context/AppContext';
import { getStyles } from './SignUp.styles';

export default function SignUp({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ visible: false, title: '', message: '' });
  
  const { setIsSigningUp } = useAppContext();
  // Eliminamos los errores de nombre, solo validamos input
  const [emailValid, setEmailValid] = useState(null); // null: no escrito, false: mal, true: bien
  const [passwordValidations, setPasswordValidations] = useState({
    length: false,
    upper: false,
    number: false,
    lower: false,
  });
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordMatch, setConfirmPasswordMatch] = useState(null); // null: no escrito, false: mal, true: bien

  const { dark: isDarkMode, colors } = useTheme();
  const styles = getStyles(isDarkMode, colors);


  // Solo permitir letras y espacios en el nombre
  const handleFullNameChange = (text) => {
    setFullName(text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, ''));
  };

  const handleLastNameChange = (text) => {
    setLastName(text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, ''));
  };


  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const handleEmailChange = (text) => {
    setEmail(text);
    if (text.length === 0) {
      setEmailValid(null);
    } else {
      setEmailValid(emailRegex.test(text));
    }
  };


  const handlePasswordChange = (text) => {
    setPassword(text);
    if (!passwordTouched && text.length > 0) setPasswordTouched(true);
    if (text.length === 0) setPasswordTouched(false);
    setPasswordValidations({
      length: text.length >= 6,
      upper: /[A-Z]/.test(text),
      number: /[0-9]/.test(text),
      lower: /[a-z]/.test(text),
    });
    // Validar confirmación en tiempo real
    setConfirmPasswordMatch(text && confirmPassword ? text === confirmPassword : null);
  };


  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    setConfirmPasswordMatch(password && text ? password === text : null);
  };

  const handleSignUp = async () => {
    if (!fullName || !lastName || !email || !password || !confirmPassword) {
      setAlert({ visible: true, title: "Error", message: "Todos los campos son requeridos." });
      return;
    }

    if (!emailValid) {
      setAlert({ visible: true, title: "Error", message: "El formato del email es incorrecto." });
      return;
    }

    if (!passwordValidations.length || !passwordValidations.upper || !passwordValidations.number || !passwordValidations.lower) {
      setAlert({ visible: true, title: "Error", message: "La contraseña no cumple los requisitos." });
      return;
    }

    if (!confirmPasswordMatch) {
      setAlert({ visible: true, title: "Error", message: "Las contraseñas no coinciden." });
      return;
    }

    setLoading(true);
    setIsSigningUp(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        firstName: fullName,
        lastName: lastName,
        email: email,
        createdAt: serverTimestamp(), // Guardar la fecha de registro
      });

      await signOut(auth);
      setAlert({
        visible: true,
        title: "Registro exitoso",
        message: "Tu cuenta ha sido creada. Ahora puedes iniciar sesión.",
        onConfirm: () => {
          setAlert({ visible: false, title: '', message: '' });
          navigation.navigate('Login');
        }
      });

    } catch (error) {
      let errorMessage = "Hubo un problema al registrar el usuario.";
      switch (error.code) {
        case 'auth/email-already-in-use':
          setAlert({ visible: true, title: "Error", message: "El correo electrónico ya está en uso." });
          break;
        default:
          setAlert({ visible: true, title: "Error", message: errorMessage });
      }
    } finally {
      setLoading(false);
      setIsSigningUp(false);
    }
  };

  return (
    <>
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        onConfirm={alert.onConfirm || (() => setAlert({ visible: false, title: '', message: '' }))}
      />
<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.kbView}>
  <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
    <Image source={require('../../assets/logo-nuevas-energias-v2.png')} style={styles.logo} resizeMode="contain" />
    <Text style={styles.title}>Registro</Text>
    <Text style={styles.description}>Crea una cuenta para empezar a utilizar la aplicación.</Text>

    {/* Nombre completo */}
    <Text style={styles.label}>Nombre </Text>
    <View style={styles.inputContainer}>
      <Feather name="user" size={20} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        placeholderTextColor={colors.placeholder}
        value={fullName}
        onChangeText={handleFullNameChange}
        autoCapitalize="words"
      />
    </View>

    {/* Apellido */}
    <Text style={styles.label}>Apellido </Text>
    <View style={styles.inputContainer}>
      <Feather name="user" size={20} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Apellido"
        placeholderTextColor={colors.placeholder}
        value={lastName}
        onChangeText={handleLastNameChange}
        autoCapitalize="words"
      />
    </View>

    {/* Email */}
    <Text style={styles.label}>Email </Text>
    <View style={styles.inputContainer}>
      <Feather name="mail" size={20} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="ejemplo@gmail.com"
        placeholderTextColor={colors.placeholder}
        value={email}
        onChangeText={handleEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
      />
    </View>
    {email.length > 0 && (
      <Text style={{
        color: emailValid ? 'green' : '#666',
        fontSize: 12,
        marginLeft: 4,
        textAlign: 'left',
        alignSelf: 'flex-start',
      }}>
        {emailValid === null ? 'Formato válido' : emailValid ? 'Formato válido' : 'Formato inválido'}
      </Text>
    )}

    {/* Contraseña */}
    <Text style={styles.label}>Contraseña </Text>
    <View style={styles.inputContainer}>
      <Feather name="lock" size={20} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Ejemplo123"
        placeholderTextColor={colors.placeholder}
        value={password}
        onChangeText={handlePasswordChange}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
      />
      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
        <Feather name={showPassword ? "eye-off" : "eye"} size={20} style={styles.icon} />
      </TouchableOpacity>
    </View>
    {/* Validaciones de contraseña */}
    {passwordTouched && (
      <View style={{ marginLeft: 4, marginTop: 2, alignSelf: 'flex-start' }}>
        <Text style={{
          color: colors.text,
          fontSize: 12,
          fontWeight: 'bold',
          marginBottom: 2,
        }}>La contraseña debe incluir:</Text>
        <Text style={{
          color: passwordValidations.length ? 'green' : '#666',
          fontSize: 12,
          textAlign: 'left',
          alignSelf: 'flex-start',
        }}>+6 caracteres</Text>
        <Text style={{
          color: passwordValidations.upper ? 'green' : '#666',
          fontSize: 12,
          textAlign: 'left',
          alignSelf: 'flex-start',
        }}>Al menos una Mayúscula</Text>
        <Text style={{
          color: passwordValidations.lower ? 'green' : '#666',
          fontSize: 12,
          textAlign: 'left',
          alignSelf: 'flex-start',
        }}>Al menos una Minúscula</Text>
        <Text style={{
          color: passwordValidations.number ? 'green' : '#666',
          fontSize: 12,
          textAlign: 'left',
          alignSelf: 'flex-start',
        }}>Al menos un Número</Text>
      </View>
    )}

    {/* Confirmar contraseña */}
    <Text style={styles.label}>Confirmar contraseña </Text>
    <View style={styles.inputContainer}>
      <Feather name="lock" size={20} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder="Ejemplo123"
        placeholderTextColor={colors.placeholder}
        value={confirmPassword}
        onChangeText={handleConfirmPasswordChange}
        secureTextEntry={!showConfirmPassword}
        autoCapitalize="none"
      />
      <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
        <Feather name={showConfirmPassword ? "eye-off" : "eye"} size={20} style={styles.icon} />
      </TouchableOpacity>
    </View>
    {confirmPassword.length > 0 && (
      <Text style={{
        color: confirmPasswordMatch ? 'green' : '#666',
        fontSize: 12,
        marginLeft: 4,
        textAlign: 'left',
        alignSelf: 'flex-start',
      }}>
        {confirmPasswordMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
      </Text>
    )}

    <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <Text style={styles.buttonText}>Registrarse</Text>
      )}
    </TouchableOpacity>
  </ScrollView>
</KeyboardAvoidingView>
    </>
  );
}
