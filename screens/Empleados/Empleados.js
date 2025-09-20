import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { db, auth } from '../../src/config/firebaseConfig'; // Importar 'auth'
import { collection, onSnapshot, query, orderBy, doc, deleteDoc } from 'firebase/firestore';

const EmployeeItem = ({ item, navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleDelete = () => {
    // Función que realiza el borrado
    const performDelete = async () => {
      try {
        await deleteDoc(doc(db, "employees", item.id));
        Alert.alert("Éxito", `El empleado ${item.firstName} ${item.lastName} ha sido eliminado.`);
      } catch (error) {
        console.error("Error al eliminar el empleado: ", error);
        Alert.alert("Error", "No se pudo eliminar el empleado. Inténtalo de nuevo.");
      } finally {
        setMenuVisible(false);
      }
    };

    // Lógica de confirmación diferente para web y nativo
    if (Platform.OS === 'web') {
      if (window.confirm(`¿Estás seguro de que quieres eliminar a ${item.firstName} ${item.lastName}?`)) {
        performDelete();
      } else {
        setMenuVisible(false); // Si cancela, solo cierra el menú
      }
    } else {
      // La alerta nativa para iOS/Android
      Alert.alert(
        "Eliminar Empleado",
        `¿Estás seguro de que quieres eliminar a ${item.firstName} ${item.lastName}?`,
        [
          { text: "Cancelar", style: "cancel", onPress: () => setMenuVisible(false) },
          { text: "Eliminar", style: "destructive", onPress: performDelete },
        ]
      );
    }
  };

  const statusStyle = item.status === 'Activo' ? styles.statusActive : styles.statusInactive;

  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{`${item.firstName} ${item.lastName}`}</Text>
          <Text style={styles.position}>{item.position}</Text>
        </View>
        <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)} style={styles.moreButton}>
          <FontAwesome name="ellipsis-h" size={20} color="#6c757d" />
        </TouchableOpacity>
      </View>

      <View style={styles.itemBody}>
        <Text style={styles.detailText}><Text style={styles.detailLabel}>DNI:</Text> {item.dni}</Text>
        <Text style={styles.detailText}><Text style={styles.detailLabel}>Estado:</Text> <Text style={statusStyle}>{item.status}</Text></Text>
      </View>

      {menuVisible && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => { navigation.navigate('VerEmpleado', { employeeId: item.id }); setMenuVisible(false); }}>
            <FontAwesome name="eye" size={16} color="#007bff" />
            <Text style={[styles.actionButtonText, { color: '#007bff' }]}>Ver Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => { navigation.navigate('EditarEmpleado', { employee: item }); setMenuVisible(false); }}>
            <FontAwesome name="pencil" size={16} color="#ffc107" />
            <Text style={[styles.actionButtonText, { color: '#ffc107' }]}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleDelete}>
            <FontAwesome name="trash" size={16} color="#dc3545" />
            <Text style={[styles.actionButtonText, { color: '#dc3545' }]}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default function Empleados({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const q = query(collection(db, "employees"), orderBy("createdAt", "desc"));
  
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const employeesData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const initials = `${data.firstName?.[0] || ''}${data.lastName?.[0] || ''}`.toUpperCase();
          employeesData.push({ 
            id: doc.id, 
            ...data,
            avatar: `https://placehold.co/100x100/FFC107/1F2937?text=${initials}`
          });
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
    employee.dni.includes(searchQuery)
  );

  if (loading) {
    return <View style={styles.centerContainer}><ActivityIndicator size="large" color="#dc3545" /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredEmployees}
        renderItem={({ item }) => <EmployeeItem item={item} navigation={navigation} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyListText}>No se encontraron empleados.</Text>}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.searchContainer}>
              <FontAwesome name="search" size={18} color="#9e9e9e" style={styles.searchIcon} />
              <TextInput
                placeholder="Buscar por nombre o DNI..."
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity style={styles.registerButton} onPress={() => navigation.navigate('AgregarEmpleado')}>
              <FontAwesome name="plus" size={16} color="#fff" />
              <Text style={styles.registerButtonText}>Registrar Empleado</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20, // Espacio al final de la lista
  },
  itemContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
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
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#212529',
  },
  position: {
    fontSize: 14,
    color: '#6c757d',
  },
  moreButton: {
    padding: 8,
  },
  itemBody: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4,
  },
  detailLabel: {
    fontWeight: 'bold',
  },
  statusActive: {
    color: '#28a745',
    fontWeight: 'bold',
  },
  statusInactive: {
    color: '#ffc107',
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    marginTop: 12,
    paddingTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    paddingTop: 20, // Espacio arriba de la barra de búsqueda
    paddingBottom: 10, // Espacio debajo del botón
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#6c757d',
  },
});