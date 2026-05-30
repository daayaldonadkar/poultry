import { useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Divider,
  Snackbar,
  ActivityIndicator,
} from 'react-native-paper';
import { useBreeds } from '../hooks/use-breeds';
import { HorizontalBreedSelector } from '../components/horizontal-breed-selector';
import { BillItemCard } from '../components/bill-item-card';
import { EmptyState } from '../components/empty-state';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { createBill } from '../repositories/bill-repository';
import type { BreedRow } from '../database/types';
import type { BillItem, BillSummary } from '../types/bill';

/**
 * Create Bill screen — UI only, no database persistence.
 *
 * Workflow:
 * 1. Select breed from dropdown
 * 2. Enter pieces and weight
 * 3. Tap "Add Item" → item appears in list
 * 4. Repeat for more items
 * 5. Tap "Save Bill" → placeholder alert
 */
export default function CreateBillScreen() {
  const { breeds, loading } = useBreeds();

  // --- Add Item form state ---
  const [selectedBreed, setSelectedBreed] = useState<BreedRow | null>(null);
  const [pieces, setPieces] = useState('');
  const [weight, setWeight] = useState('');
  const [formError, setFormError] = useState('');

  // --- Bill items state ---
  const [items, setItems] = useState<BillItem[]>([]);
  const [snackbar, setSnackbar] = useState('');
  const [saving, setSaving] = useState(false);

  // --- Calculations ---
  const summary: BillSummary = useMemo(() => {
    return items.reduce(
      (acc, item) => ({
        totalItems: acc.totalItems + 1,
        totalWeight: acc.totalWeight + item.weight,
        grandTotal: acc.grandTotal + item.amount,
      }),
      { totalItems: 0, totalWeight: 0, grandTotal: 0 },
    );
  }, [items]);

  // --- Validate & add item ---
  const handleAddItem = useCallback(() => {
    setFormError('');

    if (!selectedBreed) {
      setFormError('Please select a breed');
      return;
    }

    const piecesNum = parseInt(pieces, 10);
    if (!pieces || isNaN(piecesNum) || piecesNum <= 0) {
      setFormError('Pieces must be greater than 0');
      return;
    }

    const weightNum = parseFloat(weight);
    if (!weight || isNaN(weightNum) || weightNum <= 0) {
      setFormError('Weight must be greater than 0');
      return;
    }

    const amount = weightNum * selectedBreed.price_per_kg;

    const newItem: BillItem = {
      key: `${Date.now()}-${Math.random()}`,
      breedId: selectedBreed.id,
      breedName: selectedBreed.name,
      pieces: piecesNum,
      weight: weightNum,
      ratePerKg: selectedBreed.price_per_kg,
      amount,
    };

    setItems((prev) => [...prev, newItem]);

    // Reset form for next item
    setSelectedBreed(null);
    setPieces('');
    setWeight('');
    setSnackbar(`${selectedBreed.name} added — ₹${amount.toFixed(2)}`);
  }, [selectedBreed, pieces, weight]);

  // --- Remove item ---
  const handleRemoveItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  }, []);

  // --- Save bill to database ---
  const handleSaveBill = useCallback(async () => {
    if (items.length === 0) {
      setFormError('Add at least one item to the bill');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const billId = await createBill({
        items: items.map((item) => ({
          breedId: item.breedId,
          pieces: item.pieces,
          weight: item.weight,
          amount: item.amount,
        })),
        totalWeight: summary.totalWeight,
        totalAmount: summary.grandTotal,
      });

      // Clear form and items
      setSelectedBreed(null);
      setPieces('');
      setWeight('');
      setItems([]);

      Alert.alert(
        'Bill Saved',
        `Bill #${billId} saved successfully\n\nTotal: ₹${summary.grandTotal.toFixed(2)}`,
        [{ text: 'OK' }],
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save bill';
      setFormError(message);
      setSnackbar('Failed to save bill. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [items, summary]);

  // --- Loading state ---
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* ========== ADD ITEM SECTION ========== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Item</Text>

          <HorizontalBreedSelector
            breeds={breeds}
            selectedBreed={selectedBreed}
            onSelect={setSelectedBreed}
          />

          <View style={styles.row}>
            <View style={styles.halfField}>
              <TextInput
                label="Pieces"
                mode="outlined"
                value={pieces}
                onChangeText={setPieces}
                keyboardType="number-pad"
                style={styles.input}
              />
            </View>

            <View style={styles.halfField}>
              <TextInput
                label="Weight (kg)"
                mode="outlined"
                value={weight}
                onChangeText={setWeight}
                keyboardType="decimal-pad"
                style={styles.input}
              />
            </View>
          </View>

          {/* Rate preview */}
          {selectedBreed && (
            <View style={styles.ratePreview}>
              <Text style={styles.rateText}>
                Rate: ₹{selectedBreed.price_per_kg}/kg
              </Text>
              {weight && !isNaN(parseFloat(weight)) && parseFloat(weight) > 0 && (
                <Text style={styles.previewAmount}>
                  = ₹{(parseFloat(weight) * selectedBreed.price_per_kg).toFixed(2)}
                </Text>
              )}
            </View>
          )}

          {/* Error message */}
          {formError !== '' && (
            <Text style={styles.errorText}>{formError}</Text>
          )}

          <Button
            mode="contained"
            icon="plus"
            onPress={handleAddItem}
            style={styles.addButton}
            contentStyle={styles.addButtonContent}
            labelStyle={styles.addButtonLabel}
          >
            Add Item
          </Button>
        </View>

        <Divider style={styles.divider} />

        {/* ========== ITEMS LIST ========== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Bill Items {items.length > 0 ? `(${items.length})` : ''}
          </Text>

          {items.length === 0 ? (
            <View style={styles.emptyItems}>
              <Text style={styles.emptyText}>
                No items added yet. Select a breed and add items above.
              </Text>
            </View>
          ) : (
            items.map((item, index) => (
              <BillItemCard
                key={item.key}
                item={item}
                index={index}
                onRemove={handleRemoveItem}
              />
            ))
          )}
        </View>

        {/* ========== TOTALS SECTION ========== */}
        {items.length > 0 && (
          <>
            <Divider style={styles.divider} />

            <View style={styles.totalsSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Items</Text>
                <Text style={styles.totalValue}>{summary.totalItems}</Text>
              </View>

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total Weight</Text>
                <Text style={styles.totalValue}>
                  {summary.totalWeight.toFixed(2)} kg
                </Text>
              </View>

              <View style={[styles.totalRow, styles.grandTotalRow]}>
                <Text style={styles.grandTotalLabel}>Grand Total</Text>
                <Text style={styles.grandTotalValue}>
                  ₹{summary.grandTotal.toFixed(2)}
                </Text>
              </View>
            </View>
          </>
        )}

        {/* ========== SAVE BUTTON ========== */}
        <View style={styles.saveSection}>
          <Button
            mode="contained"
            icon="content-save"
            onPress={handleSaveBill}
            style={styles.saveButton}
            contentStyle={styles.saveButtonContent}
            labelStyle={styles.saveButtonLabel}
            disabled={items.length === 0 || saving}
            loading={saving}
          >
            {saving ? 'Saving...' : 'Save Bill'}
          </Button>
        </View>
      </ScrollView>

      {/* Snackbar for feedback */}
      <Snackbar
        visible={!!snackbar}
        onDismiss={() => setSnackbar('')}
        duration={2000}
      >
        {snackbar}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: Spacing.xxl,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },

  // Sections
  section: {
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },

  // Form
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  halfField: {
    flex: 1,
  },
  input: {
    backgroundColor: Colors.surface,
  },
  ratePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  rateText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  previewAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: Spacing.sm,
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
    marginTop: Spacing.sm,
  },
  addButton: {
    marginTop: Spacing.md,
    borderRadius: 8,
    backgroundColor: Colors.secondary,
  },
  addButtonContent: {
    height: 50,
  },
  addButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },

  // Items list
  emptyItems: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.disabled,
    textAlign: 'center',
  },

  // Divider
  divider: {
    marginHorizontal: Spacing.md,
  },

  // Totals
  totalsSection: {
    padding: Spacing.md,
    backgroundColor: Colors.surfaceVariant,
    marginHorizontal: Spacing.md,
    borderRadius: 10,
    marginTop: Spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  totalLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },

  // Save button
  saveSection: {
    padding: Spacing.md,
    paddingTop: Spacing.lg,
  },
  saveButton: {
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  saveButtonContent: {
    height: 56,
  },
  saveButtonLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
});
