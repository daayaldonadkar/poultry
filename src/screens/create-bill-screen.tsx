import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
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
import { BillHistoryCard } from '../components/bill-history-card';
import { EmptyState } from '../components/empty-state';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { createBill, getBills } from '../repositories/bill-repository';
import type { BreedRow, BillRow } from '../database/types';
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
  const router = useRouter();
  const { breeds, loading } = useBreeds();

  // --- Add Item form state ---
  const [selectedBreed, setSelectedBreed] = useState<BreedRow | null>(null);
  const [pieces, setPieces] = useState('');
  const [weight, setWeight] = useState('');
  const [formError, setFormError] = useState('');

  // Auto-select the first breed when breeds load
  useEffect(() => {
    if (breeds.length > 0 && !selectedBreed) {
      setSelectedBreed(breeds[0]);
    }
  }, [breeds, selectedBreed]);

  // --- Bill items state ---
  const [items, setItems] = useState<BillItem[]>([]);
  const [snackbar, setSnackbar] = useState('');
  const [saving, setSaving] = useState(false);
  const [recentBills, setRecentBills] = useState<BillRow[]>([]);

  // --- Load Recent Bills ---
  const loadRecentBills = useCallback(async () => {
    try {
      const data = await getBills();
      if (data.length === 0) {
        setRecentBills([]);
        return;
      }

      // Group by the date of the most recent bill
      const mostRecentDateStr = new Date(data[0].created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      const billsForDate = data.filter(bill => {
        const billDateStr = new Date(bill.created_at).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });
        return billDateStr === mostRecentDateStr;
      });

      setRecentBills(billsForDate);
    } catch (err) {
      console.error('Failed to load recent bills:', err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecentBills();
    }, [loadRecentBills])
  );

  // --- Calculations ---
  const summary: BillSummary = useMemo(() => {
    let activeItemWeight = 0;
    let activeItemAmount = 0;
    let activeItemsCount = 0;

    const weightNum = parseFloat(weight);
    if (selectedBreed && !isNaN(weightNum) && weightNum > 0) {
      activeItemWeight = weightNum;
      activeItemAmount = weightNum * selectedBreed.price_per_kg;
      activeItemsCount = 1;
    }

    return items.reduce(
      (acc, item) => ({
        totalItems: acc.totalItems + 1,
        totalWeight: acc.totalWeight + item.weight,
        grandTotal: acc.grandTotal + item.amount,
      }),
      { totalItems: activeItemsCount, totalWeight: activeItemWeight, grandTotal: activeItemAmount },
    );
  }, [items, selectedBreed, weight]);

  // --- Validate & add item ---
  const handleAddItem = useCallback(() => {
    setFormError('');

    if (!selectedBreed) {
      setFormError('Please select a breed');
      return;
    }

    const piecesNum = parseInt(pieces, 10);
    const finalPieces = isNaN(piecesNum) ? 0 : piecesNum;

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
      pieces: finalPieces,
      weight: weightNum,
      ratePerKg: selectedBreed.price_per_kg,
      amount,
    };

    setItems((prev) => [...prev, newItem]);

    // Reset form for next item
    setSelectedBreed(breeds.length > 0 ? breeds[0] : null);
    setPieces('');
    setWeight('');
    setSnackbar(`${selectedBreed.name} added — ₹${amount.toFixed(2)}`);
  }, [selectedBreed, pieces, weight, breeds]);

  // --- Remove item ---
  const handleRemoveItem = useCallback((key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  }, []);

  // --- Save bill to database ---
  const handleSaveBill = useCallback(async () => {
    let itemsToSave = [...items];

    // Include the current form inputs if they are valid
    const weightNum = parseFloat(weight);
    if (selectedBreed && !isNaN(weightNum) && weightNum > 0) {
      const piecesNum = parseInt(pieces, 10);
      itemsToSave.push({
        key: `auto-${Date.now()}`,
        breedId: selectedBreed.id,
        breedName: selectedBreed.name,
        pieces: isNaN(piecesNum) ? 0 : piecesNum,
        weight: weightNum,
        ratePerKg: selectedBreed.price_per_kg,
        amount: weightNum * selectedBreed.price_per_kg,
      });
    }

    if (itemsToSave.length === 0) {
      setFormError('Select a breed and enter weight to save the bill');
      return;
    }

    setSaving(true);
    setFormError('');

    try {
      const billId = await createBill({
        items: itemsToSave.map((item) => ({
          breedId: item.breedId,
          pieces: item.pieces,
          weight: item.weight,
          amount: item.amount,
        })),
        totalWeight: summary.totalWeight,
        totalAmount: summary.grandTotal,
      });

      // Clear form and items
      setSelectedBreed(breeds.length > 0 ? breeds[0] : null);
      setPieces('');
      setWeight('');
      setItems([]);

      await loadRecentBills();

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
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Bill Details</Text>
            <Button
              mode="text"
              icon="plus"
              onPress={handleAddItem}
              compact
            >
              Add Another
            </Button>
          </View>

          <HorizontalBreedSelector
            breeds={breeds}
            selectedBreed={selectedBreed}
            onSelect={setSelectedBreed}
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

          {/* Rate preview */}
          {selectedBreed && (
            <View style={styles.ratePreview}>
              <Text style={styles.rateText}>
                Rate: {selectedBreed.name} ₹{selectedBreed.price_per_kg}/kg
              </Text>
              {weight && !isNaN(parseFloat(weight)) && parseFloat(weight) > 0 && (
                <Text style={styles.previewAmount}>
                  = ₹{(parseFloat(weight) * selectedBreed.price_per_kg).toFixed(2)}
                </Text>
              )}
            </View>
          )}

          {formError !== '' && (
            <Text style={styles.errorText}>{formError}</Text>
          )}
        </View>

        {/* ========== COMPACT TOTALS ========== */}
        <View style={styles.compactTotals}>
          <Text style={styles.compactTotalsText}>
            Weight: {summary.totalWeight.toFixed(2)} kg
          </Text>
          <Text style={styles.compactGrandTotal}>
            Total: ₹{summary.grandTotal.toFixed(2)}
          </Text>
        </View>

        {/* ========== PREVIOUS ITEMS LIST ========== */}
        {items.length > 0 && (
          <View style={styles.section}>
            <Divider style={[styles.divider, { marginBottom: Spacing.md }]} />
            <Text style={styles.sectionTitle}>
              Previous Items ({items.length})
            </Text>

            {items.map((item, index) => (
              <BillItemCard
                key={item.key}
                item={item}
                index={index}
                onRemove={handleRemoveItem}
              />
            ))}
          </View>
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
            disabled={summary.totalItems === 0 || saving}
            loading={saving}
          >
            {saving ? 'Saving...' : 'Save Bill'}
          </Button>
        </View>

        {/* ========== RECENT BILLS ========== */}
        {recentBills.length > 0 && (
          <View style={styles.section}>
            <Divider style={[styles.divider, { marginBottom: Spacing.md }]} />
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recent Bills ({recentBills.length})</Text>
              <Button mode="text" onPress={() => router.push('/bill-history')} compact>
                View All
              </Button>
            </View>
            {recentBills.map(bill => (
              <BillHistoryCard
                key={bill.id}
                bill={bill}
                onPress={() => router.push({ pathname: '/bill-detail', params: { id: String(bill.id) } })}
              />
            ))}
          </View>
        )}
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },

  // Form
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

  compactTotals: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  compactTotalsText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  compactGrandTotal: {
    fontSize: 18,
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
