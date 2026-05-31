import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal, Modal, Text, TextInput, Button, IconButton } from 'react-native-paper';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { HorizontalBreedSelector } from './horizontal-breed-selector';
import { useBreeds } from '../hooks/use-breeds';
import type { BillDetailItem } from '../types/bill';
import type { BreedRow } from '../database/types';
import { updateBillItem } from '../repositories/bill-repository';

interface EditBillItemModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSave: () => void;
  item: BillDetailItem | null;
}

export function EditBillItemModal({ visible, onDismiss, onSave, item }: EditBillItemModalProps) {
  const { breeds } = useBreeds();
  const [selectedBreed, setSelectedBreed] = useState<BreedRow | null>(null);
  const [pieces, setPieces] = useState('');
  const [weight, setWeight] = useState('');
  const [rate, setRate] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item && visible) {
      setPieces(String(item.pieces || ''));
      setWeight(String(item.weight));
      setRate(String(item.ratePerKg));
      const breed = breeds.find((b) => b.id === item.breedId);
      setSelectedBreed(breed || null);
      setError('');
    }
  }, [item, visible, breeds]);

  const handleBreedSelect = useCallback((breed: BreedRow) => {
    setSelectedBreed(breed);
    setRate(String(breed.price_per_kg)); // Auto-update rate
  }, []);

  const handleSave = async () => {
    if (!item || !selectedBreed) return;

    setError('');
    const piecesNum = parseInt(pieces, 10);
    const finalPieces = isNaN(piecesNum) ? 0 : piecesNum;

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0) {
      setError('Weight must be greater than 0');
      return;
    }

    const rateNum = parseFloat(rate);
    if (isNaN(rateNum) || rateNum <= 0) {
      setError('Rate must be greater than 0');
      return;
    }

    const amount = weightNum * rateNum;

    try {
      setSaving(true);
      await updateBillItem({
        itemId: item.id,
        billId: item.billId,
        breedId: selectedBreed.id,
        pieces: finalPieces,
        weight: weightNum,
        amount: amount,
      });
      onSave(); // Parent component should re-fetch and close modal
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    } finally {
      setSaving(false);
    }
  };

  if (!item) return null;

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Edit Item</Text>
          <IconButton icon="close" size={20} onPress={onDismiss} />
        </View>

        <HorizontalBreedSelector
          breeds={breeds}
          selectedBreed={selectedBreed}
          onSelect={handleBreedSelect}
        />

        <View style={styles.piecesRow}>
          <TextInput
            label="Pieces"
            mode="outlined"
            value={pieces}
            onChangeText={setPieces}
            keyboardType="number-pad"
            style={styles.piecesInput}
          />
          <View style={styles.shortcutsContainer}>
            {[1, 2, 3, 4, 5].map((num) => (
              <Button
                key={num}
                mode={pieces === String(num) ? 'contained' : 'outlined'}
                onPress={() => setPieces(String(num))}
                style={styles.shortcutBtn}
                labelStyle={styles.shortcutLabel}
                compact
              >
                {num}
              </Button>
            ))}
          </View>
        </View>

        <View style={styles.weightRow}>
          <TextInput
            label="Weight (kg)"
            mode="outlined"
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            style={styles.input}
          />
        </View>

        <View style={styles.rateRow}>
          <TextInput
            label="Rate (₹/kg)"
            mode="outlined"
            value={rate}
            onChangeText={setRate}
            keyboardType="decimal-pad"
            style={styles.input}
          />
        </View>

        {error !== '' && <Text style={styles.errorText}>{error}</Text>}

        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving || !selectedBreed}
          style={styles.saveButton}
        >
          Save Changes
        </Button>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    margin: Spacing.xl,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  piecesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  piecesInput: {
    width: 90,
    backgroundColor: Colors.surface,
  },
  shortcutsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: Spacing.sm,
  },
  shortcutBtn: {
    minWidth: 45,
    marginHorizontal: 0,
  },
  shortcutLabel: {
    marginHorizontal: 0,
    fontSize: 18,
    fontWeight: '700',
  },
  weightRow: {
    marginTop: Spacing.md,
  },
  rateRow: {
    marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.surface,
  },
  errorText: {
    color: Colors.error,
    marginTop: Spacing.sm,
    fontSize: 14,
  },
  saveButton: {
    marginTop: Spacing.lg,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
