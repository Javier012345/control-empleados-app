import { StyleSheet } from 'react-native';

export const getStyles = (isDarkMode, colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    opacity: 0.8,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  placeholder: {
    color: colors.placeholder,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emailInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emailIcon: {
    color: colors.text,
    opacity: 0.6,
    marginRight: 12,
  },
  emailLabel: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.6,
  },
  emailText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  pickerContainer: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  picker: {
    height: 50,
    width: '100%',
    color: colors.text,
    // En iOS, el picker necesita un contenedor para tener bordes.
    // En Android, el color del texto se establece aquí.
  },
  pickerItem: {
    // Estilos para los items del picker (principalmente para iOS)
    color: colors.text,
    backgroundColor: colors.card,
  },
  pickerItemPlaceholder: {
    color: colors.placeholder,
    backgroundColor: colors.card,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.card,
  },
  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: colors.primary,
    borderRadius: 15,
    padding: 6,
    borderWidth: 2,
    borderColor: colors.card,
  },
  alertContainer: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 20,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  alertMessage: {
    fontSize: 14,
    color: colors.text,
    marginTop: 10,
  },
});