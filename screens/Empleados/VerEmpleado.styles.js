import { StyleSheet } from 'react-native';

export const getStyles = (isDarkMode, colors) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: colors.background 
  },
  scrollContent: {
    paddingBottom: 80, // Espacio para el FAB
  },
  header: { 
    alignItems: 'center', 
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: colors.card, 
  },
  avatar: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    marginBottom: 16,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: colors.card, // Borde del mismo color que el fondo del header
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold',
  },
  name: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: colors.text 
  },
  position: { 
    fontSize: 16, 
    color: colors.text, 
    opacity: 0.7, 
    marginTop: 4 
  },
  detailsContainer: { 
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  detailItem: { 
    flexDirection: 'row', 
    alignItems: 'center',
    paddingVertical: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border 
  },
  icon: {
    color: colors.primary,
    marginRight: 16,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: { 
    fontSize: 12, 
    color: colors.text, 
    opacity: 0.6, 
    marginBottom: 2 
  },
  detailValue: { 
    fontSize: 16, 
    color: colors.text, 
    fontWeight: '500' 
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusActive: {
    backgroundColor: isDarkMode ? 'rgba(22, 163, 74, 0.2)' : '#D1FAE5',
  },
  statusInactive: {
    backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextActive: {
    color: isDarkMode ? '#6EE7B7' : '#047857',
  },
  statusTextInactive: {
    color: isDarkMode ? '#FCD34D' : '#B45309',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 70,
    width: 70,
    height: 70,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});