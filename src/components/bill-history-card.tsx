import { Pressable, View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import type { BillRow } from '../database/types';

interface BillHistoryCardProps {
  bill: BillRow;
  onPress: (bill: BillRow) => void;
}

/** Format ISO date string to a readable format */
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Card displaying a single bill in the history list.
 * Shows bill number, date, weight, and amount.
 */
export function BillHistoryCard({ bill, onPress }: BillHistoryCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={() => onPress(bill)}
    >
      <View style={styles.header}>
        <Text style={styles.billNumber}>Bill #{bill.id}</Text>
        <Text style={styles.date}>{formatDate(bill.created_at)}</Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Weight</Text>
          <Text style={styles.detailValue}>{bill.total_weight.toFixed(2)} kg</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Total</Text>
          <Text style={styles.amount}>₹{bill.total_amount.toFixed(2)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  pressed: {
    backgroundColor: Colors.surfaceVariant,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 4,
  },
  billNumber: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  date: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  details: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  amount: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.primary,
  },
});
