import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator, Modal, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useTheme } from '@react-navigation/native';
import { db } from '../../src/config/firebaseConfig';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { useAppContext } from '../../src/context/AppContext';
import CustomAlert from '../../src/components/CustomAlert'; // Importar CustomAlert
import { getStyles } from './Empleados.styles';

const EmployeeItem = ({ item, navigation, styles, colors, showDeactivateAlert, showReactivateAlert }) => {
  const EmployeeAvatar = ({ employee }) => {
    if (employee.imageUrl) {
      return <Image source={{ uri: employee.imageUrl }} style={styles.avatar} />;
    }
    const initials = `${employee.firstName?.[0] || ''}${employee.lastName?.[0] || ''}`.toUpperCase();
    return (
      <View style={[styles.avatar, styles.avatarPlaceholder]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
    );
  };

  const statusStyle = [styles.statusBadge, item.status === 'Activo' ? styles.statusActive : styles.statusInactive];

  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <EmployeeAvatar employee={item} />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{`${item.firstName} ${item.lastName}`}</Text>
          <Text style={styles.position}>{item.position}</Text>
        </View>
      </View>

      <View style={styles.itemBody}>
        <View style={styles.detailsRow}>
          <Text style={styles.detailText}><Text style={styles.detailLabel}>DNI:</Text> {item.dni}</Text>
          <View style={statusStyle}>
            <Text style={[styles.statusText, item.status === 'Activo' ? styles.statusTextActive : styles.statusTextInactive]}>{item.status}</Text>
          </View>
        </View>
      </View>

      <View style={styles.itemFooter}>
        <TouchableOpacity style={styles.footerAction} onPress={() => navigation.navigate('VerEmpleado', { employeeId: item.id })}>
          <Feather name="eye" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerAction} onPress={() => navigation.navigate('EditarEmpleado', { employee: item })}>
          <Feather name="edit-2" size={20} color={colors.text} />
        </TouchableOpacity>
        {item.status === 'Activo' ? (
          <TouchableOpacity style={styles.footerAction} onPress={() => showDeactivateAlert(item)}>
            <Feather name="trash-2" size={20} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.footerAction} onPress={() => showReactivateAlert(item)}>
            <Feather name="power" size={20} color="#28a745" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default function Empleados() {
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Activo'); // 'Activo', 'Inactivo', 'Todos'
  const [alertInfo, setAlertInfo] = useState({ visible: false, title: '', message: '', onConfirm: null, onCancel: null });
  const navigation = useNavigation();
  const { dark: isDarkMode, colors } = useTheme();
  const styles = getStyles(isDarkMode, colors);
  const { addActivity } = useAppContext();

  // Función para mostrar el CustomAlert de desactivación
  const showDeactivateAlert = (employee) => {
    setAlertInfo({
      visible: true,
      title: "Desactivar Empleado",
      message: `¿Estás seguro de que quieres cambiar el estado de ${employee.firstName} ${employee.lastName} a "Inactivo"?`,
      onCancel: () => setAlertInfo({ visible: false }),
      onConfirm: () => {
        setAlertInfo({ visible: false });
        performDeactivation(employee);
      },
    });
  };

  // Función para mostrar el CustomAlert de reactivación
  const showReactivateAlert = (employee) => {
    setAlertInfo({
      visible: true,
      title: "Reactivar Empleado",
      message: `¿Estás seguro de que quieres cambiar el estado de ${employee.firstName} ${employee.lastName} a "Activo"?`,
      onCancel: () => setAlertInfo({ visible: false }),
      onConfirm: () => {
        setAlertInfo({ visible: false });
        performReactivation(employee);
      },
    });
  };

  // Función que ejecuta la desactivación
  const performDeactivation = async (employee) => {
    try {
      const employeeRef = doc(db, "employees", employee.id);
      await updateDoc(employeeRef, { status: 'Inactivo' });
      addActivity({ type: 'deactivate_employee', text: `El empleado ${employee.firstName} ${employee.lastName} fue desactivado.`, time: new Date() });
    } catch (error) {
      console.error("Error al desactivar el empleado: ", error);
      setAlertInfo({ visible: true, title: "Error", message: "No se pudo desactivar el empleado." });
    }
  };

  // Función que ejecuta la reactivación
  const performReactivation = async (employee) => {
    try {
      const employeeRef = doc(db, "employees", employee.id);
      await updateDoc(employeeRef, { status: 'Activo' });
      addActivity({ type: 'reactivate_employee', text: `El empleado ${employee.firstName} ${employee.lastName} fue reactivado.`, time: new Date() });
    } catch (error) {
      console.error("Error al reactivar el empleado: ", error);
      setAlertInfo({ visible: true, title: "Error", message: "No se pudo reactivar el empleado." });
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const q = query(collection(db, "employees"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const employeesData = snapshot.docs.map(doc => {
          const data = doc.data();
          return { 
            id: doc.id, 
            ...data,
            // El avatar se manejará en el componente EmployeeAvatar
          };
        });
        setEmployees(employeesData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching employees: ", error);
        setLoading(false);
      });
      return () => unsubscribe();
    }, [])
  );

  const filteredEmployees = employees
    .filter(employee => {
      if (statusFilter === 'Todos') return true;
      return employee.status === statusFilter;
    })
    .filter(employee =>
      `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.dni?.includes(searchQuery)
  );

  if (loading) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      {/* Header fijo con búsqueda y botón de registro */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={colors.placeholder} />
          <TextInput
            placeholder="Nombre o DNI..."
            placeholderTextColor={colors.placeholder}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('AgregarEmpleado')}>
          <Feather name="plus" size={20} color="#fff" />
          <Text style={styles.registerButtonText}>Registrar</Text>
        </TouchableOpacity>
      </View>

      {/* Contenedor de Filtros */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, statusFilter === 'Activo' && styles.filterButtonActive]}
          onPress={() => setStatusFilter('Activo')}>
          <Text style={[styles.filterButtonText, statusFilter === 'Activo' && styles.filterButtonTextActive]}>Activos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, statusFilter === 'Inactivo' && styles.filterButtonActive]}
          onPress={() => setStatusFilter('Inactivo')}>
          <Text style={[styles.filterButtonText, statusFilter === 'Inactivo' && styles.filterButtonTextActive]}>Inactivos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, statusFilter === 'Todos' && styles.filterButtonActive]}
          onPress={() => setStatusFilter('Todos')}>
          <Text style={[styles.filterButtonText, statusFilter === 'Todos' && styles.filterButtonTextActive]}>Todos</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredEmployees}
        renderItem={({ item }) => 
          <EmployeeItem 
            item={item} 
            navigation={navigation} 
            styles={styles} 
            colors={colors} 
            showDeactivateAlert={showDeactivateAlert}
            showReactivateAlert={showReactivateAlert}
          />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyListText}>No se encontraron empleados.</Text>}
      />

      <CustomAlert
        visible={alertInfo.visible}
        title={alertInfo.title}
        message={alertInfo.message}
        onConfirm={alertInfo.onConfirm}
        onCancel={alertInfo.onCancel}
      />
    </View>
  );
}
