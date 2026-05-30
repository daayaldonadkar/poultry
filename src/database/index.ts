/**
 * Database module — public API.
 *
 * Import from '@database' or '../database' to access
 * the database client, helpers, types, and initialization.
 */

// Connection management
export { getDatabase, closeDatabase } from './client';

// Initialization
export { initializeDatabase } from './initialize';

// Query helpers
export { queryAll, queryFirst, execute, executeTransaction } from './helpers';

// Constants
export { DATABASE_NAME, DATABASE_VERSION, Tables } from './constants';
export type { TableName } from './constants';

// Types
export type {
  BreedRow,
  BillRow,
  BillItemRow,
  InsertRow,
  UpdateRow,
} from './types';
