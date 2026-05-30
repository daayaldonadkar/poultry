import { getDatabase } from './client';

/**
 * Reusable query execution helpers.
 *
 * These wrap expo-sqlite's async methods with proper TypeScript
 * generics so callers get typed results without importing the
 * database client directly.
 */

/**
 * Execute a read query that returns multiple rows.
 *
 * @param sql    - SQL SELECT statement
 * @param params - Bind parameters
 * @returns Array of typed row objects
 */
export async function queryAll<T>(
  sql: string,
  params: (string | number | null)[] = [],
): Promise<T[]> {
  const db = await getDatabase();
  return db.getAllAsync<T>(sql, params);
}

/**
 * Execute a read query that returns a single row or null.
 *
 * @param sql    - SQL SELECT statement
 * @param params - Bind parameters
 * @returns A single typed row object, or null if not found
 */
export async function queryFirst<T>(
  sql: string,
  params: (string | number | null)[] = [],
): Promise<T | null> {
  const db = await getDatabase();
  return db.getFirstAsync<T>(sql, params);
}

/**
 * Execute a write statement (INSERT, UPDATE, DELETE).
 *
 * @param sql    - SQL mutation statement
 * @param params - Bind parameters
 * @returns Result with `lastInsertRowId` and `changes` count
 */
export async function execute(
  sql: string,
  params: (string | number | null)[] = [],
): Promise<{ lastInsertRowId: number; changes: number }> {
  const db = await getDatabase();
  const result = await db.runAsync(sql, params);
  return {
    lastInsertRowId: result.lastInsertRowId,
    changes: result.changes,
  };
}

/**
 * Execute multiple statements in a single transaction.
 * Automatically rolls back on error.
 *
 * @param fn - Async function receiving the database instance
 */
export async function executeTransaction<T>(
  fn: (db: Awaited<ReturnType<typeof getDatabase>>) => Promise<T>,
): Promise<T> {
  const db = await getDatabase();
  return db.withTransactionAsync(async () => {
    return fn(db);
  }) as Promise<T>;
}
