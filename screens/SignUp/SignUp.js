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

// Componente para mostrar cada requisito de validación de forma más visual
const ValidationItem = ({ isValid, text, colors }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
    <Feather 
      name={isValid ? "check-circle" : "x-circle"} 
      size={16} 
      color={isValid ? '#28a745' : colors.primary} // Verde para éxito, rojo (primary) para error
      style={{ marginRight: 8 }} 
    />
    <Text style={{ color: isValid ? '#28a745' : colors.text, fontSize: 14, opacity: isValid ? 1 : 0.8 }}>{text}</Text>
  </View>
);

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
  const [fullNameTouched, setFullNameTouched] = useState(false);
  const [lastNameTouched, setLastNameTouched] = useState(false);

  const [fullNameValidations, setFullNameValidations] = useState({
    length: false,
    format: false,
  });
  const [lastNameValidations, setLastNameValidations] = useState({
    length: false,
    format: false,
  });

  const { dark: isDarkMode, colors } = useTheme();
  const styles = getStyles(isDarkMode, colors);


  // Solo permitir letras y espacios en el nombre
  const handleFullNameChange = (text) => {
    if (!fullNameTouched) setFullNameTouched(true);
    const formatRegex = /^[a-zA-Z\sñÑ\u00C0-\u017F]*$/;
    const trimmedText = text.trim();

    setFullName(text);

    setFullNameValidations({
      length: trimmedText.length >= 4 && trimmedText.length <= 25,
      format: formatRegex.test(text),
    });
  };

  const handleLastNameChange = (text) => {
    if (!lastNameTouched) setLastNameTouched(true);
    const formatRegex = /^[a-zA-Z\sñÑ\u00C0-\u017F]*$/;
    const trimmedText = text.trim();

    setLastName(text);

    setLastNameValidations({
      length: trimmedText.length >= 4 && trimmedText.length <= 25,
      format: formatRegex.test(text),
    });
  };


  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
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
      setAlert({ visible: true, title: "Error", message: "Todos los campos son requeridos.", hideButtons: true, onConfirm: () => setAlert({ visible: false }) });
      return;
    }

    if (!fullNameValidations.length || !fullNameValidations.format) {
      setAlert({ visible: true, title: "Error", message: "El nombre no cumple los requisitos.", hideButtons: true, onConfirm: () => setAlert({ visible: false }) });
      return;
    }

    if (!lastNameValidations.length || !lastNameValidations.format) {
      setAlert({ visible: true, title: "Error", message: "El apellido no cumple los requisitos.", hideButtons: true, onConfirm: () => setAlert({ visible: false }) });
      return;
    }

    if (!emailValid) {
      setAlert({ visible: true, title: "Error", message: "El formato del email es incorrecto.", hideButtons: true, onConfirm: () => setAlert({ visible: false }) });
      return;
    }

    if (!passwordValidations.length || !passwordValidations.upper || !passwordValidations.number || !passwordValidations.lower) {
      setAlert({ visible: true, title: "Error", message: "La contraseña no cumple los requisitos.", hideButtons: true, onConfirm: () => setAlert({ visible: false }) });
      return;
    }

    if (!confirmPasswordMatch) {
      setAlert({ visible: true, title: "Error", message: "Las contraseñas no coinciden.", hideButtons: true, onConfirm: () => setAlert({ visible: false }) });
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

      // Cerramos la sesión para que el usuario deba iniciarla manualmente
      await signOut(auth);

      setAlert({
        visible: true,
        title: "Registro exitoso",
        message: "Tu cuenta ha sido creada.",
        hideButtons: true,
        onConfirm: () => {}, // Función vacía para evitar comportamiento por defecto
      });

      setTimeout(() => {
        setAlert({ visible: false, title: '', message: '' });
        navigation.navigate('Login');
      }, 5000);

    } catch (error) {
      let errorMessage = "Hubo un problema al registrar el usuario.";
      switch (error.code) {
        case 'auth/email-already-in-use':
          setAlert({ visible: true, title: "Error", message: "El correo electrónico ya está en uso.", hideButtons: true, onConfirm: () => setAlert({ visible: false }) });
          break;
        default:
          setAlert({ visible: true, title: "Error", message: errorMessage, hideButtons: true, onConfirm: () => setAlert({ visible: false }) });
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
        hideButtons={alert.hideButtons || false}
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
        maxLength={25}
      />
    </View>
    {fullNameTouched && (
      <View style={{ width: '100%', paddingHorizontal: 4, marginTop: 8 }}>
        <ValidationItem isValid={fullNameValidations.length} text="Entre 4 y 25 caracteres" colors={colors} />
        <ValidationItem isValid={fullNameValidations.format} text="Solo letras y espacios" colors={colors} />
      </View>
    )}

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
        maxLength={25}
      />
    </View>
    {lastNameTouched && (
      <View style={{ width: '100%', paddingHorizontal: 4, marginTop: 8 }}>
        <ValidationItem isValid={lastNameValidations.length} text="Entre 4 y 25 caracteres" colors={colors} />
        <ValidationItem isValid={lastNameValidations.format} text="Solo letras y espacios" colors={colors} />
      </View>
    )}

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
    {/* Aviso de formato de email inválido con el nuevo estilo */}
    {emailValid === false && <ValidationItem isValid={false} text="Formato de email inválido" colors={colors} />}

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
      <View style={{ width: '100%', paddingHorizontal: 4, marginTop: 8 }}>
        <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 4 }}>La contraseña debe incluir:</Text>
        <ValidationItem isValid={passwordValidations.length} text="Al menos 6 caracteres" colors={colors} />
        <ValidationItem isValid={passwordValidations.upper} text="Una letra mayúscula (A-Z)" colors={colors} />
        <ValidationItem isValid={passwordValidations.lower} text="Una letra minúscula (a-z)" colors={colors} />
        <ValidationItem isValid={passwordValidations.number} text="Un número (0-9)" colors={colors} />
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
    {/* Aviso de que las contraseñas no coinciden, solo se muestra el error */}
    {confirmPasswordMatch === false && <ValidationItem isValid={false} text="Las contraseñas no coinciden" colors={colors} />}

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
