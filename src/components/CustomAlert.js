import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

const CustomAlert = ({ visible, title, message, onConfirm, onCancel }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalText}>{message}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={[styles.textStyle, styles.cancelButtonText]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={onConfirm}
            >
              <Text style={styles.textStyle}>Aceptar</Text>
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
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  cancelButtonText: {
    color: colors.primary,
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    minWidth: 100,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default CustomAlert;
