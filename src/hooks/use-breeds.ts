import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import type { BreedRow } from '../database/types';
import {
  getAllBreeds,
  createBreed,
  updateBreed,
  deleteBreed,
} from '../repositories/breed-repository';

interface UseBreedsReturn {
  breeds: BreedRow[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addBreed: (name: string, pricePerKg: number) => Promise<void>;
  editBreed: (id: number, name: string, pricePerKg: number) => Promise<void>;
  removeBreed: (id: number) => Promise<void>;
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

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return { breeds, loading, error, refresh, addBreed, editBreed, removeBreed };
}
