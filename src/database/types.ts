/**
 * TypeScript type definitions for database table rows.
 */

/** Row shape for the `breeds` table */
export interface BreedRow {
  id: number;
  name: string;
  price_per_kg: number;
  created_at: string;
}

/** Row shape for the `bills` table */
export interface BillRow {
  id: number;
  total_weight: number;
  total_amount: number;
  created_at: string;
  total_pieces?: number;
}

/** Row shape for the `bill_items` table */
export interface BillItemRow {
  id: number;
  bill_id: number;
  breed_id: number;
  pieces: number;
  weight: number;
  amount: number;
}

/**
 * Generic type for INSERT operations — omits auto-generated `id`.
 * `created_at` is optional since it can be defaulted at insert time.
 */
export type InsertRow<T> = Omit<T, 'id'>;

/** Generic type for UPDATE operations — all fields optional except id */
export type UpdateRow<T> = Partial<Omit<T, 'id'>> & { id: number };
