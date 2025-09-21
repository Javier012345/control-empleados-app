import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { collection, query, where, Timestamp, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../src/config/firebaseConfig';

// Componente reutilizable para las tarjetas de estadísticas
const StatCard = ({ icon, title, value, color, styles }) => (
  <View style={[styles.card, { borderLeftColor: color, backgroundColor: styles.card.backgroundColor }]}>
    <FontAwesome name={icon} size={32} color={color} style={styles.cardIcon} />
    <View>
      <Text style={[styles.cardValue, { color: styles.cardValue.color }]}>{value}</Text>
      <Text style={[styles.cardTitle, { color: styles.cardTitle.color }]}>{title}</Text>
    </View>
  </View>
);

export default function Home() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    newHires: 0,
    monthlySanctions: 0,
    todayAttendances: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { colors } = useTheme();
  // Creamos los estilos dinámicamente basados en el tema
  const styles = getStyles(colors);

  const fetchDataAndSetupListeners = useCallback(() => {
    const employeesCollection = collection(db, 'employees');
    const sanctionsCollection = collection(db, 'sanciones');
    const attendancesCollection = collection(db, 'asistencias');

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const handleError = (error) => {
      console.error("Error con el listener de Firestore: ", error);
      setLoading(false);
    };

    // Listeners
    const unsubEmployees = onSnapshot(employeesCollection, 
      (snapshot) => setStats(prev => ({ ...prev, totalEmployees: snapshot.size })), handleError);

    const newHiresQuery = query(employeesCollection, where('createdAt', '>=', Timestamp.fromDate(startOfMonth)));
    const unsubNewHires = onSnapshot(newHiresQuery, 
      (snapshot) => setStats(prev => ({ ...prev, newHires: snapshot.size })), handleError);

    const monthlySanctionsQuery = query(sanctionsCollection, where('createdAt', '>=', Timestamp.fromDate(startOfMonth)));
    const unsubSanctions = onSnapshot(monthlySanctionsQuery, 
      (snapshot) => setStats(prev => ({ ...prev, monthlySanctions: snapshot.size })), handleError);

    const todayAttendancesQuery = query(attendancesCollection, where('createdAt', '>=', startOfDay), where('createdAt', '<=', endOfDay));
    const unsubAttendances = onSnapshot(todayAttendancesQuery, 
      (snapshot) => setStats(prev => ({ ...prev, todayAttendances: snapshot.size })), handleError);

    // Ocultamos el loading después de que todos los listeners se hayan establecido
    // y los datos iniciales (probablemente de caché) se hayan cargado.
    // Para asegurar que vemos algo, esperamos un momento.
    // Una mejor aproximación es usar Promise.all con getDocs si el FOUC (flash of unstyled content) es un problema.
    // Por ahora, esto soluciona la pantalla en blanco.
    if (loading) {
      setLoading(false);
    }
    if (refreshing) {
      setRefreshing(false);
    }

    return () => {
      unsubEmployees();
      unsubNewHires();
      unsubSanctions();
      unsubAttendances();
    };
  }, [loading, refreshing]);

  // useFocusEffect para recargar los listeners si volvemos a la pantalla.
  // Esto es más robusto que useEffect solo.
  useFocusEffect(fetchDataAndSetupListeners);

  // La función de refresco manual seguirá funcionando como antes, pero ahora es menos necesaria
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // La lógica de fetchDataAndSetupListeners se encargará de poner refreshing a false.
  }, []);

  if (loading) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  // Ya no necesitamos la función fetchDashboardData ni el useFocusEffect
  /*
  const fetchDashboardData = async () => {
    try {
      // --- 1. Total de Empleados ---
      const employeesCollection = collection(db, 'employees');
      const employeesSnapshot = await getDocs(employeesCollection);
      const totalEmployees = employeesSnapshot.size;

    } catch (error) {
      console.error("Error fetching dashboard data: ", error);
      // Aquí podrías mostrar una alerta al usuario
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // useFocusEffect se ejecuta cada vez que la pantalla entra en foco
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchDashboardData();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData();
  }, []);

  if (loading && !refreshing) { ... }
  */

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
      }
    >
      <View style={styles.grid}>
        <StatCard icon="users" title="Total de Empleados" value={stats.totalEmployees} color="#17a2b8" styles={styles} />
        <StatCard icon="user-plus" title="Nuevas Contrataciones" value={stats.newHires} color="#28a745" styles={styles} />
        <StatCard icon="exclamation-triangle" title="Sanciones del Mes" value={stats.monthlySanctions} color="#ffc107" styles={styles} />
        <StatCard icon="check-square-o" title="Asistencias de Hoy" value={stats.todayAttendances} color="#007bff" styles={styles} />
      </View>
      
      {/* Aquí puedes agregar más componentes para tu dashboard */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actividad Reciente</Text>
        {/* Por ejemplo, una lista de las últimas contrataciones o incidentes */}
        <Text style={styles.placeholderText}>Próximamente...</Text>
      </View>
    </ScrollView>
  );
}

// Función que genera los estilos
const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 10,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 8,
    padding: 15,
    width: '46%', // Para que quepan dos por fila con un pequeño espacio
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 2,
  },
  cardIcon: {
    marginRight: 15,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  cardTitle: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  section: {
    backgroundColor: colors.card,
    marginHorizontal: 10,
    borderRadius: 8,
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.text,
  },
  placeholderText: {
    textAlign: 'center',
    color: colors.text,
    paddingVertical: 20,
  }
});
