import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

const Notifications = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantalla de Notificaciones</Text>
      <Text style={{ color: colors.text }}>Aquí se mostrarán las futuras notificaciones.</Text>
    </View>
  );
};

const getStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
});

export default Notifications;