import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator, Modal, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useTheme } from '@react-navigation/native';
import { db } from '../../src/config/firebaseConfig';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import CustomAlert from '../../src/components/CustomAlert'; // Importar CustomAlert

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
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16, // Espacio superior para la lista
  },
  itemContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.2 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    backgroundColor: colors.border, // Color de fondo para la imagen real
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  position: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  itemBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'flex-start',
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
  },
  detailLabel: {
    fontWeight: '500', // Un peso ligeramente más ligero que el valor
    color: colors.text,
    opacity: 0.6, // Reducir la opacidad para crear jerarquía
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12, // Un poco más de padding horizontal
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
    fontWeight: '600', // Un poco más de peso para que resalte en el badge
  },
  statusTextActive: {
    color: isDarkMode ? '#6EE7B7' : '#047857', // Tonos de verde más integrados
  },
  statusTextInactive: {
    color: isDarkMode ? '#FCD34D' : '#B45309', // Tonos de ámbar/amarillo más integrados
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 30, // Safe area for home indicator
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionIcon: {
    marginRight: 16,
    color: colors.text,
    opacity: 0.7,
  },
  actionButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 0,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  registerButton: {
    flexDirection: 'row', // Añadido para alinear ícono y texto
    alignItems: 'center', // Añadido para centrar verticalmente
    padding: 12,
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    minWidth: 110, // Ancho mínimo para que no se vea apretado
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: colors.text,
    opacity: 0.7,
  },
});
