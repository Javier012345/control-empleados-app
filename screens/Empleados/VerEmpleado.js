import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../src/config/firebaseConfig';

const EmployeeAvatar = ({ employee, styles }) => {
  if (employee?.imageUrl) {
    return <Image source={{ uri: employee.imageUrl }} style={styles.avatar} />;
  }
  const initials = `${employee?.firstName?.[0] || ''}${employee?.lastName?.[0] || ''}`.toUpperCase();
  return (
    <View style={[styles.avatar, styles.avatarPlaceholder]}>
      <Text style={styles.avatarText}>{initials}</Text>
    </View>
  );
};

export default function VerEmpleado({ route, navigation }) {
  const { employeeId } = route.params;
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const { dark: isDarkMode, colors } = useTheme();
  const styles = getStyles(isDarkMode, colors);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const docRef = doc(db, "employees", employeeId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setEmployee({ 
            id: docSnap.id, 
            ...data,
          });
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching employee: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeId]);

  if (loading) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!employee) {
    return <View style={styles.centerContainer}><Text style={{ color: colors.text }}>No se pudo cargar la información del empleado.</Text></View>;
  }

  const statusBadgeStyle = [styles.statusBadge, employee.status === 'Activo' ? styles.statusActive : styles.statusInactive];
  const statusTextStyle = [styles.statusText, employee.status === 'Activo' ? styles.statusTextActive : styles.statusTextInactive];

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <EmployeeAvatar employee={employee} styles={styles} />
          <Text style={styles.name}>{`${employee.firstName} ${employee.lastName}`}</Text>
          <Text style={styles.position}>{employee.position}</Text>
          <View style={[statusBadgeStyle, { marginTop: 12 }]}>
            <Text style={statusTextStyle}>{employee.status}</Text>
          </View>
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Información de Contacto</Text>
          <View style={styles.card}>
            <View style={styles.detailItem}>
              <Feather name="credit-card" size={20} style={styles.icon} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>DNI</Text>
                <Text style={styles.detailValue}>{employee.dni}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Feather name="phone" size={20} style={styles.icon} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Teléfono</Text>
                <Text style={styles.detailValue}>{employee.telefono}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Feather name="mail" size={20} style={styles.icon} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Email</Text>
                <Text style={styles.detailValue}>{employee.email}</Text>
              </View>
            </View>
            <View style={[styles.detailItem, { borderBottomWidth: 0 }]}>
              <Feather name="map-pin" size={20} style={styles.icon} />
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Dirección</Text>
                <Text style={styles.detailValue}>{employee.direccion}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      {/* Botón de Acción Flotante (FAB) para editar */}
      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('EditarEmpleado', { employee })}>
        <Feather name="edit-2" size={24} color="#fff" />
      </TouchableOpacity>
    </>
  );
}

const getStyles = (isDarkMode, colors) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: colors.background 
  },
  scrollContent: {
    paddingBottom: 80, // Espacio para el FAB
  },
  header: { 
    alignItems: 'center', 
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: colors.card, 
  },
  avatar: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    marginBottom: 16,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: colors.card, // Borde del mismo color que el fondo del header
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold',
  },
  name: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: colors.text 
  },
  position: { 
    fontSize: 16, 
    color: colors.text, 
    opacity: 0.7, 
    marginTop: 4 
  },
  detailsContainer: { 
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  detailItem: { 
    flexDirection: 'row', 
    alignItems: 'center',
    paddingVertical: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border 
  },
  icon: {
    color: colors.primary,
    marginRight: 16,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: { 
    fontSize: 12, 
    color: colors.text, 
    opacity: 0.6, 
    marginBottom: 2 
  },
  detailValue: { 
    fontSize: 16, 
    color: colors.text, 
    fontWeight: '500' 
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusActive: {
    backgroundColor: isDarkMode ? 'rgba(22, 163, 74, 0.2)' : '#D1FAE5',
  },
  statusInactive: {
    backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextActive: {
    color: isDarkMode ? '#6EE7B7' : '#047857',
  },
  statusTextInactive: {
    color: isDarkMode ? '#FCD34D' : '#B45309',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 70,
    width: 70,
    height: 70,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});