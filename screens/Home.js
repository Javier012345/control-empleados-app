import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { collection, query, where, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../src/config/firebaseConfig';

const StatCard = ({ icon, title, value, color, styles }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Feather name={icon} size={22} color={color} />
    </View>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
);

const ActivityItem = ({ icon, text, time, iconColor, bgColor, styles }) => (
  <View style={styles.activityItem}>
    <View style={[styles.activityIconContainer, { backgroundColor: bgColor }]}>
      <Feather name={icon} size={20} color={iconColor} />
    </View>
    <Text style={styles.activityText} numberOfLines={2}>{text}</Text>
    <Text style={styles.activityTime}>{time}</Text>
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
  
  const { dark: isDarkMode, colors } = useTheme();
  const styles = getStyles(isDarkMode, colors);

  const fetchData = useCallback(() => {
    setLoading(true);
    const employeesCollection = collection(db, 'employees');
    const sanctionsCollection = collection(db, 'sanciones');
    const attendancesCollection = collection(db, 'asistencias');

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const unsubscribers = [
      onSnapshot(employeesCollection, snapshot => setStats(prev => ({ ...prev, totalEmployees: snapshot.size }))),
      onSnapshot(query(employeesCollection, where('createdAt', '>=', Timestamp.fromDate(startOfMonth))), snapshot => setStats(prev => ({ ...prev, newHires: snapshot.size }))),
      onSnapshot(query(sanctionsCollection, where('createdAt', '>=', Timestamp.fromDate(startOfMonth))), snapshot => setStats(prev => ({ ...prev, monthlySanctions: snapshot.size }))),
      onSnapshot(query(attendancesCollection, where('createdAt', '>=', Timestamp.fromDate(startOfDay))), snapshot => setStats(prev => ({ ...prev, todayAttendances: snapshot.size }))),
    ];

    setLoading(false);
    setRefreshing(false);

    return () => unsubscribers.forEach(unsub => unsub());
  }, []);

  useFocusEffect(fetchData);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  if (loading && !refreshing) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
    >
      <View style={styles.grid}>
        <StatCard icon="users" title="Total Empleados" value={stats.totalEmployees} color={colors.primary} styles={styles} />
        <StatCard icon="user-check" title="Asistencia Hoy" value={`${stats.todayAttendances} / ${stats.totalEmployees}`} color="#16A34A" styles={styles} />
        <StatCard icon="shield" title="Sanciones Mes" value={stats.monthlySanctions} color="#F59E0B" styles={styles} />
        <StatCard icon="user-plus" title="Nuevas Contrataciones" value={stats.newHires} color="#3B82F6" styles={styles} />
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actividad Reciente</Text>
        <ActivityItem icon="log-in" text="Ana Torres marcó su asistencia a las 09:02 AM." time="Hace 5 min" iconColor="#16A34A" bgColor={isDarkMode ? 'rgba(22, 163, 74, 0.2)' : '#D1FAE5'} styles={styles} />
        <ActivityItem icon="alert-triangle" text="Se reportó un incidente para Carlos Vega." time="Hace 1 hora" iconColor="#F59E0B" bgColor={isDarkMode ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7'} styles={styles} />
        <ActivityItem icon="user-plus" text="Nuevo empleado Laura Méndez ha sido añadido." time="Hace 3 horas" iconColor="#3B82F6" bgColor={isDarkMode ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE'} styles={styles} />
      </View>
    </ScrollView>
  );
}

const getStyles = (isDarkMode, colors) => StyleSheet.create({
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
    justifyContent: 'space-between',
    padding: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.text,
  },
  section: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.text,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    opacity: 0.9,
  },
  activityTime: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.6,
    marginLeft: 8,
  },
});
