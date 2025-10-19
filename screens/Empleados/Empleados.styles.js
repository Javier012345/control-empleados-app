import { StyleSheet } from 'react-native';

export const getStyles = (isDarkMode, colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16, // Espacio superior para la lista
  },
  itemContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDarkMode ? 0.2 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    backgroundColor: colors.border, // Color de fondo para la imagen real
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  position: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    marginTop: 2,
  },
  moreButton: {
    padding: 8,
  },
  itemBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'flex-start',
  },
  detailText: {
    fontSize: 14,
    color: colors.text,
  },
  detailLabel: {
    fontWeight: '500', // Un peso ligeramente más ligero que el valor
    color: colors.text,
    opacity: 0.6, // Reducir la opacidad para crear jerarquía
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12, // Un poco más de padding horizontal
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
    fontWeight: '600', // Un poco más de peso para que resalte en el badge
  },
  statusTextActive: {
    color: isDarkMode ? '#6EE7B7' : '#047857', // Tonos de verde más integrados
  },
  statusTextInactive: {
    color: isDarkMode ? '#FCD34D' : '#B45309', // Tonos de ámbar/amarillo más integrados
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    paddingBottom: 30, // Safe area for home indicator
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionIcon: {
    marginRight: 16,
    color: colors.text,
    opacity: 0.7,
  },
  actionButtonText: {
    fontSize: 16,
    color: colors.text,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 0,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: colors.text,
    marginLeft: 8,
  },
  registerButton: {
    flexDirection: 'row', // Añadido para alinear ícono y texto
    alignItems: 'center', // Añadido para centrar verticalmente
    padding: 12,
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    minWidth: 110, // Ancho mínimo para que no se vea apretado
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: colors.text,
    opacity: 0.7,
  },
});