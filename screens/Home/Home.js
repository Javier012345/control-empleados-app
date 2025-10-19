import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import { collection, query, where, Timestamp, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../../src/config/firebaseConfig';
import { getStyles } from './Home.styles';
import { PieChart } from "react-native-chart-kit";

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

const CustomLegend = ({ data, total, styles }) => (
  <View style={styles.legendContainer}>
    {data.map((item, index) => {
      const percentage = total > 0 ? ((item.population / total) * 100).toFixed(1) : 0;
      return (
        <View key={index} style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: item.color }]} />
          <Text style={styles.legendText}>{item.name}</Text>
          <Text style={styles.legendValue}>{`${item.population} (${percentage}%)`}</Text>
        </View>
      );
    })}
  </View>
);

const formatTime = (date) => {
  const now = new Date();
  const diff = Math.abs(now - date) / 1000; // Diferencia en segundos

  if (diff < 60) return `Hace ${Math.floor(diff)} seg`;
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`;
  return date.toLocaleDateString();
};

export default function Home() {
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    newHires: 0,
    monthlySanctions: 0,
    todayAttendances: 0,
  });
  const [positionData, setPositionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { dark: isDarkMode, colors } = useTheme();
  const styles = getStyles(isDarkMode, colors);

  const fetchData = useCallback(() => {
    setLoading(true);
    const employeesCollection = collection(db, 'employees');
    const sanctionsCollection = collection(db, 'sanciones');
    const attendancesCollection = collection(db, 'asistencias');
    const activityCollection = collection(db, 'activity');

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const unsubscribers = [
      onSnapshot(employeesCollection, snapshot => {
        const positions = {};
        // Colores para cada cargo
        const positionColors = {
          'Gerente': '#F59E0B',
          'Secretaria': '#10B981',
          'Tecnico': '#3B82F6',
          'Obrero': '#8B5CF6',
          'Otro': '#6B7280'
        };

        snapshot.docs.forEach(doc => {
          const position = doc.data().position || 'Otro';
          positions[position] = (positions[position] || 0) + 1;
        });

        const chartData = Object.keys(positions).map(pos => ({
          name: pos,
          population: positions[pos],
          color: positionColors[pos] || positionColors['Otro'],
          legendFontColor: colors.text,
          legendFontSize: 14,
        }));

        setPositionData(chartData);
        setStats(prev => ({ ...prev, totalEmployees: snapshot.size }));
      }),
      onSnapshot(query(employeesCollection, where('createdAt', '>=', Timestamp.fromDate(startOfMonth))), snapshot => setStats(prev => ({ ...prev, newHires: snapshot.size }))),
      onSnapshot(query(sanctionsCollection, where('createdAt', '>=', Timestamp.fromDate(startOfMonth))), snapshot => setStats(prev => ({ ...prev, monthlySanctions: snapshot.size }))),
      onSnapshot(query(attendancesCollection, where('createdAt', '>=', Timestamp.fromDate(startOfDay))), snapshot => setStats(prev => ({ ...prev, todayAttendances: snapshot.size }))),
      // Suscripción en tiempo real a la actividad reciente
      onSnapshot(query(activityCollection, orderBy('time', 'desc'), limit(5)), snapshot => {
        const activities = snapshot.docs.map(doc => {
          const data = doc.data();
          // Convertir Timestamp de Firestore a Date de JS
          return { ...data, id: doc.id, time: data.time.toDate() };
        });
        setRecentActivity(activities);
      }),
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
        {recentActivity.length > 0 ? (
          recentActivity.map((activity, index) => (
            <ActivityItem 
              key={activity.id || index}
              icon="user-plus" 
              text={activity.text} 
              time={formatTime(activity.time)} 
              iconColor="#3B82F6" 
              bgColor={isDarkMode ? 'rgba(59, 130, 246, 0.2)' : '#DBEAFE'} 
              styles={styles} 
            />
          ))
        ) : (
          <Text style={styles.activityText}>No hay actividad reciente.</Text>
        )}
      </View>

      {positionData.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distribución de Empleados</Text>
          <View style={styles.chartContainer}>
            <PieChart
              data={positionData}
              width={Dimensions.get('window').width - 64} // Ancho de la pantalla menos el padding
              height={220}
              chartConfig={{
                color: (opacity = 1) => colors.text, // Usar el color de texto del tema
              }}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              center={[Dimensions.get('window').width / 6, 0]} // Centrar mejor el gráfico
              absolute
              hasLegend={false} // Ocultamos la leyenda por defecto
            />
            <CustomLegend data={positionData} total={stats.totalEmployees} styles={styles} />
          </View>
        </View>
      )}
    </ScrollView>
  );
}
