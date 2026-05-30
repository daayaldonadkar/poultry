/**
 * Database constants for the poultry billing app.
 */

/** SQLite database file name */
export const DATABASE_NAME = 'poultry_billing.db';

/** Current database schema version */
export const DATABASE_VERSION = 1;

/** Table name constants to avoid magic strings */
export const Tables = {
  BREEDS: 'breeds',
  BILLS: 'bills',
  BILL_ITEMS: 'bill_items',
} as const;

export type TableName = (typeof Tables)[keyof typeof Tables];
