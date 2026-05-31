import { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import {
  FAB,
  Snackbar,
  ActivityIndicator,
  Dialog,
  Portal,
  Text,
  Button,
} from 'react-native-paper';
import { useBreeds } from '../hooks/use-breeds';
import { BreedListItem } from '../components/breed-list-item';
import { BreedFormDialog } from '../components/breed-form-dialog';
import { EmptyState } from '../components/empty-state';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import type { BreedRow } from '../database/types';

/**
 * Breeds screen — full breed management UI.
 *
 * Features:
 * - Scrollable list of breeds
 * - FAB to add a new breed
 * - Tap to edit a breed
 * - Swipe/button to delete with confirmation
 * - Empty state when no breeds exist
 * - Error snackbar for user-friendly error messages
 */
export default function BreedsScreen() {
  const { breeds, loading, error, addBreed, editBreed, removeBreed, moveBreed } = useBreeds();

  // Form dialog state
  const [formVisible, setFormVisible] = useState(false);
  const [selectedBreed, setSelectedBreed] = useState<BreedRow | null>(null);

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<BreedRow | null>(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState('');

  // --- Handlers ---

  const handleAdd = useCallback(() => {
    setSelectedBreed(null);
    setFormVisible(true);
  }, []);

  const handleEdit = useCallback((breed: BreedRow) => {
    setSelectedBreed(breed);
    setFormVisible(true);
  }, []);

  const handleFormSubmit = useCallback(
    async (name: string, pricePerKg: number) => {
      try {
        if (selectedBreed) {
          await editBreed(selectedBreed.id, name, pricePerKg);
          setSnackbar('Breed updated successfully');
        } else {
          await addBreed(name, pricePerKg);
          setSnackbar('Breed added successfully');
        }
      } catch {
        setSnackbar('Something went wrong. Please try again.');
      }
    },
    [selectedBreed, addBreed, editBreed],
  );

  const handleDeleteRequest = useCallback((breed: BreedRow) => {
    setDeleteTarget(breed);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await removeBreed(deleteTarget.id);
      setSnackbar(`"${deleteTarget.name}" deleted`);
    } catch {
      setSnackbar('Failed to delete breed. Please try again.');
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteTarget, removeBreed]);

  // --- Render ---

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {breeds.length === 0 ? (
        <EmptyState
          icon="egg-outline"
          title="No breeds added yet"
          subtitle="Tap the + button to add your first breed"
        />
      ) : (
        <FlatList
          data={breeds}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) => (
            <BreedListItem
              breed={item}
              onPress={handleEdit}
              onDelete={handleDeleteRequest}
              onMoveUp={(b) => moveBreed(b.id, 'up')}
              onMoveDown={(b) => moveBreed(b.id, 'down')}
              isFirst={index === 0}
              isLast={index === breeds.length - 1}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Add breed FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAdd}
        color={Colors.textOnPrimary}
      />

      {/* Add/Edit dialog */}
      <BreedFormDialog
        visible={formVisible}
        breed={selectedBreed}
        onDismiss={() => setFormVisible(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Delete confirmation dialog */}
      <Portal>
        <Dialog
          visible={deleteTarget !== null}
          onDismiss={() => setDeleteTarget(null)}
        >
          <Dialog.Title>Delete Breed</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to delete "{deleteTarget?.name}"? This action
              cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              textColor={Colors.error}
              onPress={handleDeleteConfirm}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Error / success snackbar */}
      <Snackbar
        visible={!!snackbar}
        onDismiss={() => setSnackbar('')}
        duration={3000}
        action={{ label: 'OK', onPress: () => setSnackbar('') }}
      >
        {snackbar}
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
    paddingBottom: 80, // space for FAB
  },
  fab: {
    position: 'absolute',
    right: Spacing.md,
    bottom: Spacing.md,
    backgroundColor: Colors.primary,
  },
});
