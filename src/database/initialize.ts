import { getDatabase } from './client';
import { ALL_CREATE_STATEMENTS } from './schema';
import { DATABASE_NAME, DATABASE_VERSION } from './constants';

/**
 * Initializes the database by creating all tables if they do not exist.
 *
 * This function is idempotent — safe to call on every app launch.
 * It enables WAL mode and foreign keys for better performance
 * and data integrity.
 *
 * Should be called once when the app starts (e.g., in the root layout).
 */
export async function initializeDatabase(): Promise<void> {
  try {
    const db = await getDatabase();

    // Enable WAL mode for better concurrent read/write performance
    await db.execAsync('PRAGMA journal_mode = WAL;');

    // Enable foreign key enforcement
    await db.execAsync('PRAGMA foreign_keys = ON;');

    // Create all tables in dependency order
    for (const statement of ALL_CREATE_STATEMENTS) {
      await db.execAsync(statement);
    }

    console.log(
      `✅ Database "${DATABASE_NAME}" initialized successfully (v${DATABASE_VERSION})`,
    );
    console.log(
      `   Tables created: breeds, bills, bill_items`,
    );
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}
