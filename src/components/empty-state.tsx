import { View, StyleSheet } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';

interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
}

/**
 * Reusable empty state component.
 * Shows a centered icon, title, and optional subtitle.
 */
export function EmptyState({ icon = 'inbox-outline', title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Icon source={icon} size={64} color={Colors.disabled} />
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.disabled,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});
