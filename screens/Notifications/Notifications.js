import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { getStyles } from './Notifications.styles';

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

export default Notifications;