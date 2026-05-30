import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Colors } from '../src/constants/colors';
import { Spacing } from '../src/constants/spacing';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>Poultry Billing</Text>
      <Text style={styles.subtitle}>Manage your poultry business</Text>

      <View style={styles.menu}>
        <Button
          mode="contained"
          icon="egg-outline"
          onPress={() => router.push('/breeds')}
          style={styles.menuButton}
          contentStyle={styles.menuButtonContent}
          labelStyle={styles.menuButtonLabel}
        >
          Breed Management
        </Button>
        <Button
          mode="contained"
          icon="receipt"
          onPress={() => router.push('/create-bill')}
          style={styles.menuButton}
          contentStyle={styles.menuButtonContent}
          labelStyle={styles.menuButtonLabel}
        >
          Create Bill
        </Button>
        <Button
          mode="contained"
          icon="history"
          onPress={() => router.push('/bill-history')}
          style={styles.menuButton}
          contentStyle={styles.menuButtonContent}
          labelStyle={styles.menuButtonLabel}
        >
          Bill History
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: Spacing.xxl,
  },
  menu: {
    width: '100%',
    maxWidth: 300,
  },
  menuButton: {
    marginBottom: Spacing.md,
    borderRadius: 8,
  },
  menuButtonContent: {
    height: 52,
  },
  menuButtonLabel: {
    fontSize: 16,
  },
});
