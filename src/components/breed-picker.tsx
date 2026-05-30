import { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Text, Menu } from 'react-native-paper';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import type { BreedRow } from '../database/types';

interface BreedPickerProps {
  breeds: BreedRow[];
  selectedBreed: BreedRow | null;
  onSelect: (breed: BreedRow) => void;
}

/**
 * Dropdown breed picker using react-native-paper Menu.
 * Large touch target for fast shop-floor use.
 */
export function BreedPicker({ breeds, selectedBreed, onSelect }: BreedPickerProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Breed</Text>
      <Menu
        visible={visible}
        onDismiss={() => setVisible(false)}
        anchor={
          <Pressable
            style={({ pressed }) => [styles.selector, pressed && styles.pressed]}
            onPress={() => setVisible(true)}
          >
            <Text
              style={[
                styles.selectorText,
                !selectedBreed && styles.placeholder,
              ]}
            >
              {selectedBreed ? `${selectedBreed.name} — ₹${selectedBreed.price_per_kg}/kg` : 'Select breed...'}
            </Text>
            <Text style={styles.arrow}>▼</Text>
          </Pressable>
        }
        contentStyle={styles.menuContent}
      >
        <ScrollView style={styles.menuScroll}>
          {breeds.map((breed) => (
            <Menu.Item
              key={breed.id}
              title={`${breed.name} — ₹${breed.price_per_kg}/kg`}
              onPress={() => {
                onSelect(breed);
                setVisible(false);
              }}
              titleStyle={styles.menuItemTitle}
              style={styles.menuItem}
            />
          ))}
          {breeds.length === 0 && (
            <Menu.Item
              title="No breeds available"
              disabled
              titleStyle={styles.noBreeds}
            />
          )}
        </ScrollView>
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    backgroundColor: Colors.surface,
  },
  pressed: {
    backgroundColor: Colors.surfaceVariant,
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  placeholder: {
    color: Colors.disabled,
  },
  arrow: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  menuContent: {
    backgroundColor: Colors.surface,
  },
  menuScroll: {
    maxHeight: 250,
  },
  menuItem: {
    minHeight: 48,
  },
  menuItemTitle: {
    fontSize: 15,
  },
  noBreeds: {
    color: Colors.disabled,
    fontStyle: 'italic',
  },
});
