import { View, StyleSheet, Pressable } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import type { BreedRow } from '../database/types';

interface BreedListItemProps {
  breed: BreedRow;
  onPress: (breed: BreedRow) => void;
  onDelete: (breed: BreedRow) => void;
}

/**
 * A single breed row in the list.
 * Shows breed name, price per kg, and a delete button.
 * Tapping the row opens the edit modal.
 */
export function BreedListItem({ breed, onPress, onDelete }: BreedListItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => onPress(breed)}
    >
      <View style={styles.info}>
        <Text style={styles.name}>{breed.name}</Text>
        <Text style={styles.price}>₹{breed.price_per_kg}/kg</Text>
      </View>
      <IconButton
        icon="delete-outline"
        iconColor={Colors.error}
        size={22}
        onPress={() => onDelete(breed)}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pressed: {
    backgroundColor: Colors.surfaceVariant,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  price: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
