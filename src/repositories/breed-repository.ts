import { queryAll, queryFirst, execute } from '../database';
import { Tables } from '../database/constants';
import type { BreedRow } from '../database/types';

/**
 * Repository functions for the `breeds` table.
 * Uses the existing database helpers for all queries.
 */

/** Fetch all breeds, ordered by name ascending. */
export async function getAllBreeds(): Promise<BreedRow[]> {
  return queryAll<BreedRow>(
    `SELECT * FROM ${Tables.BREEDS} ORDER BY name ASC`,
  );
}

/** Fetch a single breed by ID. */
export async function getBreedById(id: number): Promise<BreedRow | null> {
  return queryFirst<BreedRow>(
    `SELECT * FROM ${Tables.BREEDS} WHERE id = ?`,
    [id],
  );
}

/** Create a new breed. Returns the inserted row ID. */
export async function createBreed(
  name: string,
  pricePerKg: number,
): Promise<number> {
  const now = new Date().toISOString();
  const result = await execute(
    `INSERT INTO ${Tables.BREEDS} (name, price_per_kg, created_at) VALUES (?, ?, ?)`,
    [name, pricePerKg, now],
  );
  return result.lastInsertRowId;
}

/** Update an existing breed's name and/or price. */
export async function updateBreed(
  id: number,
  name: string,
  pricePerKg: number,
): Promise<void> {
  await execute(
    `UPDATE ${Tables.BREEDS} SET name = ?, price_per_kg = ? WHERE id = ?`,
    [name, pricePerKg, id],
  );
}

/** Delete a breed by ID. */
export async function deleteBreed(id: number): Promise<void> {
  await execute(
    `DELETE FROM ${Tables.BREEDS} WHERE id = ?`,
    [id],
  );
}
