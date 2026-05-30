import { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { ActivityIndicator, Snackbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
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

  useEffect(() => {
    loadBills();
  }, [loadBills]);

  const handlePressBill = useCallback(
    (bill: BillRow) => {
      router.push({ pathname: '/bill-detail', params: { id: String(bill.id) } });
    },
    [router],
  );

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
        <FlatList
          data={bills}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <BillHistoryCard bill={item} onPress={handlePressBill} />
          )}
          contentContainerStyle={styles.list}
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
});
