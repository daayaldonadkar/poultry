export const Colors = {
  primary: '#D32F2F',
  primaryDark: '#9A0007',
  primaryLight: '#FF6659',
  secondary: '#FFC107',
  secondaryDark: '#C79100',
  secondaryLight: '#FFF64F',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceVariant: '#FFF8E1',
  text: '#212121',
  textSecondary: '#757575',
  textOnPrimary: '#FFFFFF',
  error: '#D32F2F',
  success: '#388E3C',
  border: '#E0E0E0',
  disabled: '#BDBDBD',
} as const;

export type ColorName = keyof typeof Colors;
