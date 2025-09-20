import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { NavigationContainer, DrawerActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { onAuthStateChanged, signOut } from 'firebase/auth';  
import { auth } from '../src/config/firebaseConfig';  
import { FontAwesome } from '@expo/vector-icons'; // Ya está importado
import Login from '../screens/Login';
import SignUp from '../screens/SignUp';
import Home from '../screens/Home';
import Empleados from '../screens/Empleados/Empleados'; // Ruta y nombre actualizados
import AgregarEmpleado from '../screens/Empleados/AgregarEmpleado'; // Ruta y nombre actualizados
import VerEmpleado from '../screens/Empleados/VerEmpleado';
import EditarEmpleado from '../screens/Empleados/EditarEmpleado';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Opciones comunes para la cabecera
const headerOptions = {
  headerTitleAlign: 'center',
};

// Función para generar opciones de cabecera consistentes
const getHeaderOptions = (title, navigation) => ({
  headerTitle: title,
  headerLeft: () => (
    <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} style={{ marginLeft: 15 }}>
      <FontAwesome name="bars" size={24} color="#444" />
    </TouchableOpacity>
  ),
  headerRight: () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
      <TouchableOpacity onPress={() => alert('Modo Oscuro')} style={{ marginRight: 20 }}><FontAwesome name="moon-o" size={24} color="#444" /></TouchableOpacity>
      <TouchableOpacity onPress={() => alert('Notificaciones')} style={{ marginRight: 20 }}><FontAwesome name="bell-o" size={24} color="#444" /></TouchableOpacity>
      <TouchableOpacity onPress={() => alert('Modo Admin')}><FontAwesome name="user-secret" size={24} color="#444" /></TouchableOpacity>
    </View>
  ),
});

// Componente personalizado para el contenido del Drawer
function CustomDrawerContent(props) {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      {/* Renderiza los items normales del menú */}
      <View style={{ flex: 1 }}>
        <DrawerItemList {...props} />
      </View>

      {/* Botón de Cerrar Sesión en la parte inferior */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
        <FontAwesome name="sign-out" size={22} color="#444" />
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

// Stack Navigator para la pantalla Home
function HomeStack({ navigation }) {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen 
        name="Dashboard" 
        component={Home}
        options={getHeaderOptions('Dashboard', navigation)}
      />
    </Stack.Navigator>
  );
}

// Stack Navigator para la sección de Empleados
function EmployeesStack({ navigation }) {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen 
        name="EmployeeList"
        component={Empleados}
        options={getHeaderOptions('Empleados', navigation)}
      />
      <Stack.Screen 
        name="AgregarEmpleado"
        component={AgregarEmpleado}
        options={{ headerTitle: 'Agregar Empleado', headerBackTitle: 'Volver' }}
      />
      <Stack.Screen 
        name="VerEmpleado"
        component={VerEmpleado}
        options={{ headerTitle: 'Perfil del Empleado', headerBackTitle: 'Volver' }}
      />
      <Stack.Screen 
        name="EditarEmpleado"
        component={EditarEmpleado}
        options={{ headerTitle: 'Editar Empleado', headerBackTitle: 'Volver' }}
      />
    </Stack.Navigator>
  );
}

// Componente principal de navegación
function Navigation() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setUser(user);
      if (loading) {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []); // Se ejecuta solo una vez al montar el componente

  if (loading) {
    return null; // O un componente de pantalla de carga (Splash Screen)
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <Stack.Screen name="AppDrawer" options={{ headerShown: false }}>
            {() => (
              <Drawer.Navigator 
                initialRouteName="Inicio" 
                screenOptions={{ 
                  headerShown: false,
                  // Opcional: Estilos para el menú lateral
                  drawerActiveBackgroundColor: '#dc354520',
                  drawerActiveTintColor: '#dc3545',
                }}
                drawerContent={(props) => <CustomDrawerContent {...props} />}
              >
                <Drawer.Screen name="Inicio" component={HomeStack} options={{ title: 'Dashboard' }} />
                <Drawer.Screen name="Empleados" component={EmployeesStack} />
                <Drawer.Screen name="Sanciones" component={HomeStack} /> 
                <Drawer.Screen name="Horarios" component={HomeStack} />
                <Drawer.Screen name="Asistencias" component={HomeStack} />
                <Drawer.Screen name="Recibos" component={HomeStack} />
                <Drawer.Screen name="Incidentes" component={HomeStack} />
              </Drawer.Navigator>
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
            <Stack.Screen name="SignUp" component={SignUp} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  logoutButtonText: {
    marginLeft: 15,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#444',
  },
});

export default Navigation;
