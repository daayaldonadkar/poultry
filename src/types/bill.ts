/**
 * Local types for the Create Bill screen.
 * These are UI-only types — not persisted to the database.
 */

/** A single line item in the bill being created */
export interface BillItem {
  /** Unique key for FlatList rendering */
  key: string;
  breedId: number;
  breedName: string;
  pieces: number;
  weight: number;
  ratePerKg: number;
  amount: number;
}

/** Summary totals for the bill */
export interface BillSummary {
  totalItems: number;
  totalWeight: number;
  grandTotal: number;
}

/** A bill item joined with breed info, for the detail screen */
export interface BillDetailItem {
  id: number;
  billId: number;
  breedId: number;
  breedName: string;
  ratePerKg: number;
  pieces: number;
  weight: number;
  amount: number;
}

/** A full bill with its line items, for the detail screen */
export interface BillWithItems {
  id: number;
  totalWeight: number;
  totalAmount: number;
  createdAt: string;
  items: BillDetailItem[];
}
