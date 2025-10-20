import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator, Modal, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useTheme } from '@react-navigation/native';
import { db } from '../../src/config/firebaseConfig';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { useAppContext } from '../../src/context/AppContext';
import CustomAlert from '../../src/components/CustomAlert'; // Importar CustomAlert
import { getStyles } from './Empleados.styles';

const EmployeeItem = ({ item, navigation, styles, colors, showDeleteAlert }) => {
  const [menuVisible, setMenuVisible] = useState(false);

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
  const statusTextStyle = [styles.statusText, item.status === 'Activo' ? styles.statusTextActive : styles.statusTextInactive];

  return (
    // Usamos Pressable para un mejor feedback táctil y para que toda la tarjeta sea navegable
    <Pressable 
      style={({ pressed }) => [styles.itemContainer, { opacity: pressed ? 0.8 : 1 }]}
      onPress={() => navigation.navigate('VerEmpleado', { employeeId: item.id })}
    >
      <View style={styles.itemHeader}>
        <EmployeeAvatar employee={item} />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{`${item.firstName} ${item.lastName}`}</Text>
          <Text style={styles.position}>{item.position}</Text>
        </View>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.moreButton}>
          <Feather name="more-horizontal" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Restauramos el cuerpo de la tarjeta con los detalles del empleado */}
      <View style={styles.itemBody}>
        <Text style={styles.detailText}><Text style={styles.detailLabel}>DNI:</Text> {item.dni}</Text>
        <Text style={[styles.detailText, {marginTop: 4}]}><Text style={styles.detailLabel}>Teléfono:</Text> {item.telefono}</Text>
        <Text style={[styles.detailText, {marginTop: 4}]}><Text style={styles.detailLabel}>Email:</Text> {item.email}</Text>
        <View style={[statusStyle, {alignSelf: 'flex-start', marginTop: 8}]}>
          <Text style={statusTextStyle}>{item.status}</Text>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)} />
        <View style={styles.actionsContainer}>
          {/* La opción "Ver Perfil" se elimina del menú, ya que la tarjeta es ahora el botón principal para ello */}
          <TouchableOpacity style={styles.actionButton} onPress={() => { setMenuVisible(false); navigation.navigate('EditarEmpleado', { employee: item }); }}>
            <Feather name="edit-2" size={20} style={styles.actionIcon} />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { borderBottomWidth: 0 }]} 
            onPress={() => { 
              setMenuVisible(false); 
              showDeleteAlert(item); // Usar la función pasada por props para mostrar el CustomAlert
            }}
          >
            <Feather name="trash-2" size={20} style={[styles.actionIcon, { color: colors.primary }]} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </Pressable>
  );
};

export default function Empleados() {
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertInfo, setAlertInfo] = useState({ visible: false, title: '', message: '', onConfirm: null, onCancel: null });
  const navigation = useNavigation();
  const { dark: isDarkMode, colors } = useTheme();
  const styles = getStyles(isDarkMode, colors);
  const { addActivity } = useAppContext();

  // Función para mostrar el CustomAlert de eliminación
  const showDeleteAlert = (employee) => {
    setAlertInfo({
      visible: true,
      title: "Eliminar Empleado",
      message: `¿Estás seguro de que quieres eliminar a ${employee.firstName} ${employee.lastName}?`,
      onCancel: () => setAlertInfo({ visible: false }),
      onConfirm: () => {
        setAlertInfo({ visible: false });
        performDelete(employee);
      },
    });
  };

  // Función que ejecuta la eliminación
  const performDelete = async (employee) => {
    try {
      await deleteDoc(doc(db, "employees", employee.id));
      // Opcional: mostrar una alerta de éxito
      addActivity({ type: 'delete_employee', text: `Empleado ${employee.firstName} ${employee.lastName} fue eliminado.`, time: new Date() });
    } catch (error) {
      console.error("Error al eliminar el empleado: ", error);
      setAlertInfo({ visible: true, title: "Error", message: "No se pudo eliminar el empleado." });
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

  const filteredEmployees = employees.filter(employee =>
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
            placeholder="Buscar por nombre o DNI..."
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

      <FlatList
        data={filteredEmployees}
        renderItem={({ item }) => <EmployeeItem item={item} navigation={navigation} styles={styles} colors={colors} showDeleteAlert={showDeleteAlert} />}
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
