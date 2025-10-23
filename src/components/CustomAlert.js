import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

const CustomAlert = ({ visible, title, message, onConfirm, onCancel, confirmButtonText, cancelButtonText }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  // Usamos onConfirm si existe, si no, usamos onClose. Esto hace el componente más flexible.
  const handleConfirm = onConfirm || onClose;

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={handleConfirm} // Permite cerrar con el botón "atrás" de Android
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalText}>{message}</Text>
          <View style={styles.buttonContainer}>
            {onCancel && (
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { marginRight: 10 }]}
                onPress={onCancel}
              >
                <Text style={[styles.textStyle, styles.cancelButtonText]}>{cancelButtonText || 'Cancelar'}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              // El botón de confirmar ya no necesita estilos especiales para alinearse.
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleConfirm}
            >
              <Text style={styles.textStyle}>{confirmButtonText || (onCancel ? 'Aceptar' : 'Cerrar')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (colors) => StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: colors.text,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Centra los botones
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.primary,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20, // Más padding horizontal para que no se vea apretado
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CustomAlert;
