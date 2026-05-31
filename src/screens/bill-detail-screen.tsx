import { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, ActivityIndicator, Divider, IconButton } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { getBillById } from '../repositories/bill-repository';
import { EditBillItemModal } from '../components/edit-bill-item-modal';
import { EmptyState } from '../components/empty-state';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import type { BillWithItems, BillDetailItem } from '../types/bill';

/** Format ISO date to readable string */
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Renders a single line item row */
function ItemRow({ item, index, onEdit }: { item: BillDetailItem; index: number; onEdit: (item: BillDetailItem) => void }) {
  return (
    <View style={itemStyles.container}>
      <View style={itemStyles.header}>
        <Text style={itemStyles.index}>#{index + 1}</Text>
        <Text style={itemStyles.breedName}>{item.breedName}</Text>
        <View style={{ flex: 1 }} />
        <IconButton
          icon="pencil"
          size={18}
          iconColor={Colors.textSecondary}
          onPress={() => onEdit(item)}
          style={itemStyles.editIcon}
        />
      </View>

      <View style={itemStyles.details}>
        <View style={itemStyles.detailCol}>
          <Text style={itemStyles.label}>Pieces</Text>
          <Text style={itemStyles.value}>{item.pieces} pcs</Text>
        </View>
        <View style={itemStyles.detailCol}>
          <Text style={itemStyles.label}>Weight</Text>
          <Text style={itemStyles.value}>{item.weight} kg</Text>
        </View>
        <View style={itemStyles.detailCol}>
          <Text style={itemStyles.label}>Rate</Text>
          <Text style={itemStyles.value}>₹{item.ratePerKg}/kg</Text>
        </View>
        <View style={itemStyles.detailCol}>
          <Text style={itemStyles.label}>Amount</Text>
          <Text style={itemStyles.amount}>₹{item.amount.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}

/**
 * Bill Detail screen — shows a single bill with all items and totals.
 * Receives `id` as a route param.
 */
export default function BillDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [bill, setBill] = useState<BillWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingItem, setEditingItem] = useState<BillDetailItem | null>(null);

  const loadBill = useCallback(async () => {
    try {
      if (!id) {
        setError('No bill ID provided');
        return;
      }
      const data = await getBillById(Number(id));
      if (!data) {
        setError('Bill not found');
        return;
      }
      setBill(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bill');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadBill();
  }, [loadBill]);

  const handleEditItem = useCallback((item: BillDetailItem) => {
    setEditingItem(item);
  }, []);

  const handleSaveEdit = useCallback(() => {
    setEditingItem(null);
    loadBill(); // Refresh bill totals and items
  }, [loadBill]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error || !bill) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title={error || 'Bill not found'}
      />
    );
  }

  return (
    <View style={styles.flex}>
      <FlatList
        data={bill.items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) => <ItemRow item={item} index={index} onEdit={handleEditItem} />}
      style={styles.container}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <View style={styles.headerSection}>
          <Text style={styles.billTitle}>Bill #{bill.id}</Text>
          <Text style={styles.date}>{formatDate(bill.createdAt)}</Text>
          <Text style={styles.itemCount}>
            {bill.items.length} item{bill.items.length !== 1 ? 's' : ''}
          </Text>
        </View>
      }
      ListFooterComponent={
        <>
          <Divider style={styles.divider} />
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Weight</Text>
              <Text style={styles.totalValue}>
                {bill.totalWeight.toFixed(2)} kg
              </Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalValue}>
                ₹{bill.totalAmount.toFixed(2)}
              </Text>
            </View>
          </View>
        </>
        }
      />

      <EditBillItemModal
        visible={!!editingItem}
        item={editingItem}
        onDismiss={() => setEditingItem(null)}
        onSave={handleSaveEdit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
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

  // Header
  headerSection: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  billTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  date: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  itemCount: {
    fontSize: 13,
    color: Colors.disabled,
    marginTop: 2,
  },

  // Totals
  divider: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },
  totalsSection: {
    padding: Spacing.md,
    backgroundColor: Colors.surfaceVariant,
    margin: Spacing.md,
    borderRadius: 10,
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
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
});

const itemStyles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  index: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  breedName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  editIcon: {
    margin: 0,
    width: 28,
    height: 28,
  },
  details: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  detailCol: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
});
