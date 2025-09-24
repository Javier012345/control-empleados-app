# Control de Empleados App

Esta es una aplicación móvil multiplataforma (iOS, Android y Web) para la gestión de empleados, construida con React Native y Expo. La aplicación permite a los administradores gestionar la información de los empleados y proporciona un panel de control con estadísticas clave.

## Características

- **Autenticación de Usuarios:** Sistema de inicio de sesión y registro de usuarios utilizando Firebase Authentication.
- **Gestión de Empleados:** Funcionalidad CRUD completa (Crear, Leer, Actualizar, Eliminar) para los perfiles de los empleados.
- **Panel de Control (Dashboard):** Muestra estadísticas en tiempo real sobre el número total de empleados, nuevas contrataciones, etc., utilizando Firebase Firestore.
- **Navegación Completa:** Navegación lateral (Drawer) y por stacks para una experiencia de usuario fluida.
- **Tema Claro y Oscuro:** Soporte para cambiar entre modos de visualización claro y oscuro.
- **Diseño Responsivo:** La interfaz de usuario está diseñada para adaptarse a diferentes tamaños de pantalla, funcionando en dispositivos móviles y web.

## Tecnologías Utilizadas

- **React Native:** Framework para construir aplicaciones nativas usando React.
- **Expo:** Plataforma y herramientas para facilitar el desarrollo y la compilación de aplicaciones React Native.
- **Firebase:**
  - **Authentication:** Para gestionar el acceso de los usuarios.
  - **Firestore:** Como base de datos NoSQL en tiempo real para almacenar la información de los empleados.
- **React Navigation:** Para la gestión de rutas y la navegación dentro de la aplicación.

## Cómo Empezar

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### Prerrequisitos

- Node.js (versión 18 o superior recomendada)
- npm o yarn
- Expo CLI (`npm install -g expo-cli`)

### Instalación

1. **Clona el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd control-empleados-app
   ```

2. **Instala las dependencias:**
   ```bash
   npm install
   # O si usas yarn
   yarn install
   ```


### Ejecutar la Aplicación

Una vez instaladas las dependencias y configurado Firebase, puedes ejecutar la aplicación con los siguientes comandos:

- **Para iniciar el servidor de desarrollo de Expo:**
  ```bash
  npm start
  ```
- **Para ejecutar en Android:**
  ```bash
  npm run android
  ```
- **Para ejecutar en iOS:**
  ```bash
  npm run ios
  ```
- **Para ejecutar en la Web:**
  ```bash
  npm run web
  ```

## Estructura de Carpetas

```
.
├── assets/              # Imágenes, fuentes y otros recursos estáticos
├── navigation/          # Configuración de React Navigation (stacks, drawer)
├── screens/             # Componentes de pantalla principal
│   ├── Empleados/       # Pantallas relacionadas con la gestión de empleados
│   └── ...
├── src/
│   ├── config/          # Configuración de Firebase
│   └── context/         # Contexto de React (tema, rol de usuario)
└── App.js               # Archivo de entrada principal de la aplicación
```
