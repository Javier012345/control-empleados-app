import { StyleSheet } from 'react-native';

export const getStyles = (isDarkMode, colors) => StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  logo: {
    width: 250,
    height: 250,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    opacity: 0.7,
    marginBottom: 24,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    height: 50,
  },
  inputError: {
    borderColor: colors.primary,
  },
  icon: {
    color: colors.text,
    opacity: 0.6,
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 16,
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: colors.text,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  generalErrorText: {
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },
  signUpText: {
    marginTop: 24,
    color: colors.text,
    opacity: 0.7,
    fontSize: 14,
  },
  signUpLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  label: {
  alignSelf: 'flex-start',
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 5,
  marginTop: 15,
  color: colors.text,
  marginLeft: 4,
  },
});