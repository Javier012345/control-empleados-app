import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../src/config/firebaseConfig';
import { getStyles } from './VerEmpleado.styles';

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