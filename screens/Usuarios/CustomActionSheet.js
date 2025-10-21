import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

const CustomActionSheet = ({ visible, onClose, options }) => {
  const { colors } = useTheme();

  if (!visible) return null;

  const styles = getStyles(colors);

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        {/* Envolvemos el contenedor en un TouchableWithoutFeedback para detener la propagación del evento de toque */}
        <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
          <View style={styles.container}>
            {options.map((option, index) => {
              if (option.isTitle) {
                return (
                  <View key={index} style={styles.titleContainer}>
                    <Text style={styles.titleText}>{option.label}</Text>
                  </View>
                );
              }
              if (option.isCancel) {
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.option, styles.cancelOption]}
                    onPress={option.onPress}
                  >
                    <Text style={[styles.optionText, styles.cancelText]}>{option.label}</Text>
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.option, index === options.length - 1 && styles.lastOption]}
                  onPress={option.onPress}
                >
                  <Feather name={option.icon} size={20} style={styles.icon} />
                  <Text style={styles.optionText}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

const getStyles = (colors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.card,
    margin: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  titleContainer: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  titleText: {
    fontSize: 14,
    color: colors.placeholder,
    fontWeight: '500',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  icon: {
    color: colors.text,
    marginRight: 15,
  },
  optionText: {
    fontSize: 18,
    color: colors.text,
  },
  cancelOption: {
    marginTop: 8,
    borderTopWidth: 6,
    borderTopColor: colors.background,
    justifyContent: 'center',
  },
  cancelText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
});

export default CustomActionSheet;