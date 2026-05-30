import { View, StyleSheet } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import type { BillItem } from '../types/bill';

interface BillItemCardProps {
  item: BillItem;
  index: number;
  onRemove: (key: string) => void;
}

/**
 * Displays a single bill line item as a card.
 * Shows breed, pieces, weight, rate, and calculated amount.
 * Has a remove button in the top-right corner.
 */
export function BillItemCard({ item, index, onRemove }: BillItemCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.index}>#{index + 1}</Text>
        <Text style={styles.breedName}>{item.breedName}</Text>
        <IconButton
          icon="close-circle-outline"
          iconColor={Colors.error}
          size={22}
          onPress={() => onRemove(item.key)}
          style={styles.removeButton}
        />
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Pieces</Text>
          <Text style={styles.detailValue}>{item.pieces} pcs</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Weight</Text>
          <Text style={styles.detailValue}>{item.weight} kg</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Rate</Text>
          <Text style={styles.detailValue}>₹{item.ratePerKg}/kg</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Amount</Text>
          <Text style={styles.amount}>₹{item.amount.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceVariant,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    paddingVertical: 2,
  },
  index: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginRight: Spacing.sm,
  },
  breedName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  removeButton: {
    margin: 0,
  },
  details: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
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
