import { Tables } from './constants';

/**
 * SQL CREATE TABLE statements for all tables.
 *
 * Uses IF NOT EXISTS so they are safe to run on every app launch.
 * Foreign keys reference parent tables for data integrity.
 */

export const CREATE_BREEDS_TABLE = `
  CREATE TABLE IF NOT EXISTS ${Tables.BREEDS} (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    price_per_kg REAL   NOT NULL,
    sort_order  INTEGER DEFAULT 0,
    created_at  TEXT    NOT NULL
  );
`;

export const CREATE_BILLS_TABLE = `
  CREATE TABLE IF NOT EXISTS ${Tables.BILLS} (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    total_weight REAL    NOT NULL,
    total_amount REAL    NOT NULL,
    created_at   TEXT    NOT NULL
  );
`;

export const CREATE_BILL_ITEMS_TABLE = `
  CREATE TABLE IF NOT EXISTS ${Tables.BILL_ITEMS} (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id  INTEGER NOT NULL,
    breed_id INTEGER NOT NULL,
    pieces   INTEGER NOT NULL,
    weight   REAL    NOT NULL,
    amount   REAL    NOT NULL,
    FOREIGN KEY (bill_id)  REFERENCES ${Tables.BILLS}(id),
    FOREIGN KEY (breed_id) REFERENCES ${Tables.BREEDS}(id)
  );
`;

/**
 * All table creation statements in dependency order.
 * Parent tables (breeds, bills) are created before child tables (bill_items).
 */
export const ALL_CREATE_STATEMENTS = [
  CREATE_BREEDS_TABLE,
  CREATE_BILLS_TABLE,
  CREATE_BILL_ITEMS_TABLE,
];
