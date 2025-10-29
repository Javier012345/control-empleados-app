import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

const CustomAlert = ({ visible, title, message, onConfirm, onCancel, confirmButtonText = 'Aceptar', cancelButtonText = 'Cancelar', hideButtons = false }) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    alertContainer: {
      width: '85%',
      maxWidth: 320,
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 24,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 12,
      textAlign: 'center',
    },
    message: {
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 22,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      width: '100%',
    },
    button: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 5,
    },
    confirmButton: {
      backgroundColor: colors.primary,
    },
    cancelButton: {
      backgroundColor: colors.border,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    confirmButtonText: {
      color: '#FFFFFF',
    },
    cancelButtonText: {
      color: colors.text,
    },
  });

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel || onConfirm}
    >
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onCancel || onConfirm}>
        <View style={styles.alertContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          {/* Lógica corregida: Solo muestra los botones si hideButtons es false */}
          {!hideButtons && (
            <View style={styles.buttonContainer}>
              {onCancel && (
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>{cancelButtonText}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={onConfirm}>
                <Text style={[styles.buttonText, styles.confirmButtonText]}>{confirmButtonText}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default CustomAlert;