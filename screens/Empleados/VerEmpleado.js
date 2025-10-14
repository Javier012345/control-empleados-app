import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../src/config/firebaseConfig';

export default function VerEmpleado({ route }) {
  const { employeeId } = route.params;
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();
  const styles = getStyles(colors);

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const docRef = doc(db, "employees", employeeId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const initials = `${data.firstName?.[0] || ''}${data.lastName?.[0] || ''}`.toUpperCase();
          const avatarUrl = data.imageUrl || `https://placehold.co/150x150/FFC107/1F2937?text=${initials}`;
          setEmployee({ 
            id: docSnap.id, 
            ...data,
            avatar: avatarUrl
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

  const statusStyle = employee.status === 'Activo' ? styles.statusActive : styles.statusInactive;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: employee.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{`${employee.firstName} ${employee.lastName}`}</Text>
        <Text style={styles.position}>{employee.position}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>DNI</Text>
          <Text style={styles.detailValue}>{employee.dni}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Teléfono</Text>
          <Text style={styles.detailValue}>{employee.telefono}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Email</Text>
          <Text style={styles.detailValue}>{employee.email}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Dirección</Text>
          <Text style={styles.detailValue}>{employee.direccion}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Estado</Text>
          <Text style={[styles.detailValue, statusStyle]}>{employee.status}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Fecha de Registro</Text>
          <Text style={styles.detailValue}>{employee.createdAt?.toDate().toLocaleDateString() || 'No disponible'}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors) => StyleSheet.create({
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
  header: { 
    alignItems: 'center', 
    padding: 20, 
    backgroundColor: colors.card, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border 
  },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 15 },
  name: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: colors.text 
  },
  position: { 
    fontSize: 18, 
    color: colors.text, 
    opacity: 0.7, 
    marginTop: 4 
  },
  detailsContainer: { padding: 20 },
  detailItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border 
  },
  detailLabel: { fontSize: 16, color: colors.text, opacity: 0.8, fontWeight: 'bold' },
  detailValue: { fontSize: 16, color: colors.text },
  statusActive: { color: '#28a745', fontWeight: 'bold' },
  statusInactive: { color: '#ffc107', fontWeight: 'bold' },
});