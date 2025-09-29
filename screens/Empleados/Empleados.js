import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useTheme } from '@react-navigation/native';
import { db } from '../../src/config/firebaseConfig';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';

const EmployeeItem = ({ item, navigation, styles, isDarkMode, colors }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleDelete = () => {
    const performDelete = async () => {
      try {
        await deleteDoc(doc(db, "employees", item.id));
        Alert.alert("Éxito", `El empleado ${item.firstName} ${item.lastName} ha sido eliminado.`);
      } catch (error) {
        console.error("Error al eliminar el empleado: ", error);
        Alert.alert("Error", "No se pudo eliminar el empleado.");
      }
    };

    Alert.alert(
      "Eliminar Empleado",
      `¿Estás seguro de que quieres eliminar a ${item.firstName} ${item.lastName}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: performDelete },
      ]
    );
  };

  const statusStyle = [styles.statusBadge, item.status === 'Activo' ? styles.statusActive : styles.statusInactive];
  const statusTextStyle = [styles.statusText, item.status === 'Activo' ? styles.statusTextActive : styles.statusTextInactive];

  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{`${item.firstName} ${item.lastName}`}</Text>
          <Text style={styles.position}>{item.position}</Text>
        </View>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.moreButton}>
          <Feather name="more-horizontal" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      <View style={styles.itemBody}>
        <Text style={styles.detailText}><Text style={styles.detailLabel}>DNI:</Text> {item.dni}</Text>
        <Text style={[styles.detailText, {marginTop: 4}]}><Text style={styles.detailLabel}>Teléfono:</Text> {item.telefono}</Text>
        <Text style={[styles.detailText, {marginTop: 4}]}><Text style={styles.detailLabel}>Email:</Text> {item.email}</Text>
        <Text style={[styles.detailText, {marginTop: 4}]}><Text style={styles.detailLabel}>Dirección:</Text> {item.direccion}</Text>
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
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setMenuVisible(false)} />
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => { setMenuVisible(false); navigation.navigate('VerEmpleado', { employeeId: item.id }); }}>
            <Feather name="eye" size={20} style={styles.actionIcon} />
            <Text style={styles.actionButtonText}>Ver Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => { setMenuVisible(false); navigation.navigate('EditarEmpleado', { employee: item }); }}>
            <Feather name="edit-2" size={20} style={styles.actionIcon} />
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { borderBottomWidth: 0 }]} onPress={() => { setMenuVisible(false); handleDelete(); }}>
            <Feather name="trash-2" size={20} style={[styles.actionIcon, { color: colors.primary }]} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default function Empleados() {
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { dark: isDarkMode, colors } = useTheme();
  const styles = getStyles(isDarkMode, colors);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const q = query(collection(db, "employees"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const employeesData = snapshot.docs.map(doc => {
          const data = doc.data();
          const initials = `${data.firstName?.[0] || ''}${data.lastName?.[0] || ''}`.toUpperCase();
          return { 
            id: doc.id, 
            ...data,
            avatar: `https://placehold.co/100x100/D9232D/FFFFFF?text=${initials}`
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
      <FlatList
        data={filteredEmployees}
        renderItem={({ item }) => <EmployeeItem item={item} navigation={navigation} styles={styles} isDarkMode={isDarkMode} colors={colors} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyListText}>No se encontraron empleados.</Text>}
        ListHeaderComponent={
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
              <Text style={styles.registerButtonText}>Registrar Empleado</Text>
            </TouchableOpacity>
          </View>
        }
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
    paddingBottom: 20,
  },
  itemContainer: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
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
    fontWeight: '600',
    color: colors.text,
    opacity: 0.7,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
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
    fontWeight: '500',
  },
  statusTextActive: {
    color: isDarkMode ? '#4ADE80' : '#065F46',
  },
  statusTextInactive: {
    color: isDarkMode ? '#FBBF24' : '#92400E',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
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
