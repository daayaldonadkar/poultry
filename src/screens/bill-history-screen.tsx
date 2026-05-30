import { useState, useCallback, useMemo } from 'react';
import { View, SectionList, StyleSheet } from 'react-native';
import { Text, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { getBills } from '../repositories/bill-repository';
import { BillHistoryCard } from '../components/bill-history-card';
import { EmptyState } from '../components/empty-state';
import { Colors } from '../constants/colors';
import type { BillRow } from '../database/types';

/**
 * Bill History screen — shows all saved bills, newest first.
 * Tapping a bill navigates to the detail screen.
 */
export default function BillHistoryScreen() {
  const router = useRouter();
  const [bills, setBills] = useState<BillRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBills = useCallback(async () => {
    try {
      setError('');
      const data = await getBills();
      setBills(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load bills';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBills();
    }, [loadBills])
  );

  const handlePressBill = useCallback(
    (bill: BillRow) => {
      router.push({ pathname: '/bill-detail', params: { id: String(bill.id) } });
    },
    [router],
  );

  const sections = useMemo(() => {
    const grouped = bills.reduce((acc, bill) => {
      const dateStr = new Date(bill.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(bill);
      return acc;
    }, {} as Record<string, BillRow[]>);

    return Object.entries(grouped).map(([title, data]) => {
      const totalPieces = data.reduce((sum, bill) => sum + (bill.total_pieces ?? 0), 0);
      const totalWeight = data.reduce((sum, bill) => sum + bill.total_weight, 0);
      const totalRevenue = data.reduce((sum, bill) => sum + bill.total_amount, 0);

      return {
        title,
        data,
        totalPieces,
        totalWeight,
        totalRevenue,
      };
    });
  }, [bills]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {bills.length === 0 ? (
        <EmptyState
          icon="receipt-text-outline"
          title="No bills found"
          subtitle="Bills you create will appear here"
        />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <BillHistoryCard bill={item} onPress={handlePressBill} />
          )}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionSummary}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Pieces</Text>
                  <Text style={styles.summaryValue}>{section.totalPieces}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Weight</Text>
                  <Text style={styles.summaryValue}>{section.totalWeight.toFixed(2)} kg</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Revenue</Text>
                  <Text style={styles.summaryRevenue}>₹{section.totalRevenue.toFixed(2)}</Text>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={true}
        />
      )}

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
      >
        {error}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  list: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  sectionHeader: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionSummary: {
    flexDirection: 'row',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  summaryRevenue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});
