import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { NavigationContainer, DrawerActions, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { onAuthStateChanged, signOut } from 'firebase/auth';  
import { auth } from '../src/config/firebaseConfig';  
import { FontAwesome } from '@expo/vector-icons';
import { useAppContext } from '../src/context/AppContext'; // 1. Importar el hook del contexto
import Login from '../screens/Login';
import SignUp from '../screens/SignUp';
import Home from '../screens/Home';
import Empleados from '../screens/Empleados/Empleados'; // Ruta y nombre actualizados
import AgregarEmpleado from '../screens/Empleados/AgregarEmpleado'; // Ruta y nombre actualizados
import VerEmpleado from '../screens/Empleados/VerEmpleado';
import EditarEmpleado from '../screens/Empleados/EditarEmpleado';
import Notifications from '../screens/Notifications'; // Importar la nueva pantalla
import CustomAlert from '../src/components/CustomAlert';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Opciones comunes para la cabecera
const headerOptions = {
  headerTitleAlign: 'center',
};

// Función para generar opciones de cabecera consistentes
const getHeaderOptions = (title, navigation) => {
  const { theme } = useAppContext();
  const colors = theme === 'light' ? lightTheme.colors : darkTheme.colors;

  return {
    headerTitle: title,
    headerLeft: () => (
      <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} style={{ marginLeft: 15 }}>
        <FontAwesome name="bars" size={24} color={colors.text} />
      </TouchableOpacity>
    ),
    headerRight: () => <HeaderRightIcons navigation={navigation} />,
  };
};

// Componente para los iconos del header que usa el contexto
function HeaderRightIcons({ navigation }) {
  const { theme, toggleTheme } = useAppContext();
  const colors = theme === 'light' ? lightTheme.colors : darkTheme.colors;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
      <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 20 }}>
        <FontAwesome name={theme === 'light' ? 'moon-o' : 'sun-o'} size={24} color={colors.text} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={{ marginRight: 20 }}>
        <FontAwesome name="bell-o" size={24} color={colors.text} />
      </TouchableOpacity>

    </View>
  );
}

// Componente personalizado para el contenido del Drawer
function CustomDrawerContent(props) {
  const { theme } = useAppContext();
  const colors = theme === 'light' ? lightTheme.colors : darkTheme.colors;
  const [alertVisible, setAlertVisible] = useState(false);

  const handleLogout = () => {
    setAlertVisible(true);
  };

  const confirmLogout = async () => {
    setAlertVisible(false);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const cancelLogout = () => {
    setAlertVisible(false);
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={[styles.drawerHeader, { borderBottomColor: colors.border }]}>
        <Image 
          source={require('../assets/logo-nuevas-energias-v2.png')} 
          style={styles.drawerLogo}
          resizeMode="contain"
        />
      </View>

      {/* Renderiza los items normales del menú */}
      <View style={{ flex: 1 }}>
        <DrawerItemList {...props} />
      </View>

      {/* Botón de Cerrar Sesión en la parte inferior */}
      <TouchableOpacity style={[styles.logoutButton, { borderTopColor: colors.border }]} onPress={handleLogout}>
        <FontAwesome name="sign-out" size={22} color={colors.text} />
        <Text style={[styles.logoutButtonText, { color: colors.text }]}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <CustomAlert
        visible={alertVisible}
        title="Cerrar Sesión"
        message="¿Estás seguro de que quieres cerrar sesión?"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </DrawerContentScrollView>
  );
}

// Stack Navigator para la pantalla Home
function HomeStack({ navigation }) {
  const screenOptionsWithRightIcons = {
    ...headerOptions,
    headerRight: () => <HeaderRightIcons navigation={navigation} />,
  };

  return (
    <Stack.Navigator screenOptions={screenOptionsWithRightIcons}>
      <Stack.Screen 
        name="Dashboard" 
        component={Home}
        options={getHeaderOptions('Inicio', navigation)}
      />
      <Stack.Screen 
        name="Notifications"
        component={Notifications}
        options={{ headerTitle: 'Notificaciones' }}
      />
    </Stack.Navigator>
  );
}

// Stack Navigator para la sección de Empleados
function EmployeesStack({ navigation }) {
  const screenOptionsWithRightIcons = {
    ...headerOptions,
    headerRight: () => <HeaderRightIcons navigation={navigation} />,
  };

  return (
    <Stack.Navigator screenOptions={screenOptionsWithRightIcons} >
      <Stack.Screen 
        name="EmployeeList"
        component={Empleados}
        options={({ navigation }) => getHeaderOptions('Empleados', navigation)}
      />
      <Stack.Screen 
        name="VerEmpleado"
        component={VerEmpleado}
        options={{ headerTitle: 'Perfil del Empleado' }}
      />
      {/* Grupo de pantallas modales para una mejor UX al crear/editar */}
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
      <Stack.Screen 
        name="AgregarEmpleado"
        component={AgregarEmpleado}
        options={{ headerTitle: 'Agregar Empleado' }}
      />
      <Stack.Screen 
        name="EditarEmpleado"
        component={EditarEmpleado}
        options={{ headerTitle: 'Editar Empleado' }}
      />
      </Stack.Group>
    </Stack.Navigator>
  );
}

// Componente principal de navegación
function Navigation() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme, isSigningUp } = useAppContext();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (!isSigningUp) {
        setUser(user);
      }
      if (loading) {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [isSigningUp]); // Se ejecuta solo una vez al montar el componente

  if (loading) {
    return null; // O un componente de pantalla de carga (Splash Screen)
  }

  return (
    <NavigationContainer theme={theme === 'light' ? lightTheme : darkTheme}>
      <Stack.Navigator>
        {user ? (
          <Stack.Screen name="AppDrawer" options={{ headerShown: false }}>
            {() => (
              <Drawer.Navigator 
                initialRouteName="Inicio" 
                screenOptions={{ 
                  headerShown: false,
                  // Opcional: Estilos para el menú lateral
                  drawerActiveBackgroundColor: theme === 'light' ? '#dc354520' : '#e5737340',
                  drawerActiveTintColor: theme === 'light' ? '#dc3545' : '#e57373',
                }}
                drawerContent={(props) => <CustomDrawerContent {...props} />}
              >
                <Drawer.Screen name="Inicio" component={HomeStack} options={{ title: 'Inicio' }} />
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
            <Stack.Screen name="SignUp" component={SignUp} options={{ headerTransparent: true, headerTitle: '', headerBackTitleVisible: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F9FAFB',
    card: '#FFFFFF',
    text: '#1F2937',
    primary: '#D9232D',
    border: '#D1D5DB',
    placeholder: '#9CA3AF',
  },
};

const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#111827',
    card: '#1F2937',
    text: '#FFFFFF',
    primary: '#e57373',
    border: '#374151',
    placeholder: '#6B7280',
  },
};

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  drawerLogo: {
    width: 150,
    height: 150,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
  },
  logoutButtonText: {
    marginLeft: 15,
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default Navigation;
