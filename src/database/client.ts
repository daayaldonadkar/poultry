import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME } from './constants';

/**
 * Singleton database connection.
 *
 * Uses expo-sqlite's async API. The connection is lazily opened
 * on the first call to `getDatabase()` and reused thereafter.
 */

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Returns the singleton SQLite database connection.
 * Opens the database on first call.
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return db;
}

/**
 * Closes the database connection and resets the singleton.
 * Safe to call even if the database was never opened.
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}
