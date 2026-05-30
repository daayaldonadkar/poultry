import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Text, Button, Icon } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import type { BreedRow } from '../database/types';

interface HorizontalBreedSelectorProps {
  breeds: BreedRow[];
  selectedBreed: BreedRow | null;
  onSelect: (breed: BreedRow) => void;
}

/**
 * Horizontally scrollable breed selector.
 * Optimized for fast, one-tap selection in a busy shop environment.
 */
export function HorizontalBreedSelector({
  breeds,
  selectedBreed,
  onSelect,
}: HorizontalBreedSelectorProps) {
  const router = useRouter();

  if (breeds.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No breeds available</Text>
        <Button
          mode="text"
          onPress={() => router.push('/breeds')}
          compact
        >
          Add Breeds
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Breed</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {breeds.map((breed) => {
          const isSelected = selectedBreed?.id === breed.id;

          return (
            <Pressable
              key={breed.id}
              style={({ pressed }) => [
                styles.chip,
                isSelected ? styles.chipSelected : styles.chipUnselected,
                pressed && !isSelected && styles.chipPressed,
              ]}
              onPress={() => onSelect(breed)}
            >
              <View style={styles.chipHeader}>
                <Text
                  style={[
                    styles.breedName,
                    isSelected && styles.textSelected,
                  ]}
                >
                  {breed.name}
                </Text>
                {isSelected && (
                  <Icon
                    source="check-circle"
                    size={16}
                    color={Colors.primaryDark}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.price,
                  isSelected && styles.textSelected,
                ]}
              >
                ₹{breed.price_per_kg}/kg
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: '500',
  },
  scrollContent: {
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceVariant,
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  chip: {
    minWidth: 120,
    minHeight: 64, // Large touch target
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
  },
  chipUnselected: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  chipPressed: {
    backgroundColor: Colors.surfaceVariant,
  },
  chipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  breedName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  price: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  textSelected: {
    color: Colors.primaryDark, // High contrast text against light background
  },
});
