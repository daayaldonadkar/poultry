import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import type { BreedRow } from '../database/types';
import {
  getAllBreeds,
  createBreed,
  updateBreed,
  deleteBreed,
  updateBreedSequence,
} from '../repositories/breed-repository';

interface UseBreedsReturn {
  breeds: BreedRow[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addBreed: (name: string, pricePerKg: number) => Promise<void>;
  editBreed: (id: number, name: string, pricePerKg: number) => Promise<void>;
  removeBreed: (id: number) => Promise<void>;
  moveBreed: (id: number, direction: 'up' | 'down') => Promise<void>;
}

/**
 * React hook for breed management.
 * Provides breed list state and CRUD operations.
 * Automatically loads breeds on mount.
 */
export function useBreeds(): UseBreedsReturn {
  const [breeds, setBreeds] = useState<BreedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await getAllBreeds();
      setBreeds(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load breeds';
      setError(message);
      console.error('useBreeds refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addBreed = useCallback(async (name: string, pricePerKg: number) => {
    try {
      setError(null);
      await createBreed(name, pricePerKg);
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add breed';
      setError(message);
      throw err;
    }
  }, [refresh]);

  const editBreed = useCallback(async (id: number, name: string, pricePerKg: number) => {
    try {
      setError(null);
      await updateBreed(id, name, pricePerKg);
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update breed';
      setError(message);
      throw err;
    }
  }, [refresh]);

  const removeBreed = useCallback(async (id: number) => {
    try {
      setError(null);
      await deleteBreed(id);
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete breed';
      setError(message);
      throw err;
    }
  }, [refresh]);

  const moveBreed = useCallback(async (id: number, direction: 'up' | 'down') => {
    try {
      setError(null);
      const index = breeds.findIndex(b => b.id === id);
      if (index === -1) return;
      if (direction === 'up' && index === 0) return;
      if (direction === 'down' && index === breeds.length - 1) return;

      const newBreeds = [...breeds];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      
      // Swap elements
      [newBreeds[index], newBreeds[swapIndex]] = [newBreeds[swapIndex], newBreeds[index]];

      // Optimistic update
      setBreeds(newBreeds);

      // Save to DB
      const orderedIds = newBreeds.map(b => b.id);
      await updateBreedSequence(orderedIds);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to move breed';
      setError(message);
      await refresh(); // Revert on failure
      throw err;
    }
  }, [breeds, refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return { breeds, loading, error, refresh, addBreed, editBreed, removeBreed, moveBreed };
}
