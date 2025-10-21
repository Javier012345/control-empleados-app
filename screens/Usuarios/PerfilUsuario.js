import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../src/config/firebaseConfig';
import { getStyles } from './PerfilUsuario.styles';
import CustomAlert from '../../src/components/CustomAlert';

const InfoRow = ({ icon, label, value, styles, isSelectable = false, isLast = false }) => (
  <View style={[styles.infoItem, isLast && { borderBottomWidth: 0 }]}>
    <Feather name={icon} size={20} style={styles.icon} />
    <View style={styles.infoTextContainer}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} selectable={isSelectable}>
        {value || 'No disponible'}
      </Text>
    </View>
  </View>
);

const UserAvatar = ({ user, styles }) => {
  if (user?.imageUrl) {
    return (
      <Image 
        source={{ uri: user.imageUrl }} 
        style={styles.avatar} 
      />
    );
  } else {
    const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();
    return (
      <View style={[styles.avatar, styles.avatarPlaceholder]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
    );
  }
};

const formatDate = (dateStringOrTimestamp) => {
  if (!dateStringOrTimestamp) return 'No disponible';
  
  // Comprobar si es un timestamp de Firestore o una cadena de fecha
  const date = dateStringOrTimestamp.toDate ? dateStringOrTimestamp.toDate() : new Date(dateStringOrTimestamp);
  
  if (isNaN(date)) return 'Fecha inválida';

  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date);
};

export default function PerfilUsuario({ navigation, route }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { dark: isDarkMode, colors } = useTheme();
  const styles = getStyles(isDarkMode, colors);
  const [alertVisible, setAlertVisible] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            // Combinamos datos de Firestore y de Auth
            const firestoreData = docSnap.data();
            const authData = auth.currentUser;
            
            const userData = { id: docSnap.id, ...firestoreData, ...authData.metadata, uid: authData.uid, email: authData.email };
            setUser(userData);

            // Pasar los datos del usuario a los parámetros de la ruta para que el botón de editar los tenga
            navigation.setParams({ user: userData });

          } else {
            console.log("No se encontraron datos del usuario!");
          }
        } catch (error) {
          console.error("Error al obtener datos del usuario: ", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
    // El listener se activa cuando la pantalla vuelve a tener foco
    const unsubscribe = navigation.addListener('focus', fetchUserData);
    return unsubscribe;
  }, [navigation, route.params?.updated]); // Se re-ejecuta si volvemos con el parámetro 'updated'

  const handleLogout = () => setAlertVisible(true);

  const confirmLogout = async () => {
    setAlertVisible(false);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loading) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!user) {
    return <View style={styles.centerContainer}><Text style={{ color: colors.text }}>No se pudo cargar la información del usuario.</Text></View>;
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <UserAvatar user={user} styles={styles} />
          <Text style={styles.name}>{`${user.firstName} ${user.lastName}`}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.sectionTitle}>Información General</Text>
          <View style={styles.card}>
            <InfoRow icon="briefcase" label="Cargo" value={user.position || 'Administrador'} styles={styles} />
            <InfoRow icon="phone" label="Teléfono" value={user.phone} styles={styles} />
            <InfoRow icon="shield" label="Rol" value={user.role || 'Usuario'} styles={styles} />
            <InfoRow icon="user-check" label="ID de Usuario" value={user.uid} styles={styles} isSelectable isLast />
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Detalles de la Cuenta</Text>
          <View style={styles.card}>
            <InfoRow icon="log-in" label="Último inicio de sesión" value={formatDate(user.lastSignInTime)} styles={styles} />
            <InfoRow icon="calendar" label="Miembro desde" value={formatDate(user.creationTime)} styles={styles} isLast />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={20} color={colors.primary} />
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        title="Cerrar Sesión"
        message="¿Estás seguro de que quieres cerrar sesión?"
        onConfirm={confirmLogout}
        onCancel={() => setAlertVisible(false)}
      />
    </>
  );
}