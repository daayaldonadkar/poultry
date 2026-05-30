import { getDatabase } from '../database/client';
import { queryAll, queryFirst } from '../database/helpers';
import { Tables } from '../database/constants';
import type { BillRow } from '../database/types';
import type { BillDetailItem, BillWithItems } from '../types/bill';

/**
 * Input shape for a single bill item when creating a bill.
 */
export interface CreateBillItemInput {
  breedId: number;
  pieces: number;
  weight: number;
  amount: number;
}

/**
 * Input shape for creating a bill.
 */
export interface CreateBillInput {
  items: CreateBillItemInput[];
  totalWeight: number;
  totalAmount: number;
}

/**
 * Creates a bill with all its line items in a single transaction.
 *
 * Flow:
 * 1. Insert bill row → get bill ID
 * 2. Insert all bill_items with that bill ID
 * 3. Commit transaction
 *
 * On any failure, the entire transaction is rolled back.
 *
 * @returns The created bill's ID
 */
export async function createBill(input: CreateBillInput): Promise<number> {
  const { items, totalWeight, totalAmount } = input;

  if (items.length === 0) {
    throw new Error('Cannot create a bill with no items');
  }

  const db = await getDatabase();
  let billId: number = 0;

  await db.withTransactionAsync(async () => {
    const now = new Date().toISOString();

    // 1. Insert bill row
    const billResult = await db.runAsync(
      `INSERT INTO ${Tables.BILLS} (total_weight, total_amount, created_at) VALUES (?, ?, ?)`,
      [totalWeight, totalAmount, now],
    );

    billId = billResult.lastInsertRowId;

    if (!billId) {
      throw new Error('Failed to create bill: no ID returned');
    }

    // 2. Insert all bill items
    for (const item of items) {
      await db.runAsync(
        `INSERT INTO ${Tables.BILL_ITEMS} (bill_id, breed_id, pieces, weight, amount) VALUES (?, ?, ?, ?, ?)`,
        [billId, item.breedId, item.pieces, item.weight, item.amount],
      );
    }
  });

  if (!billId) {
    throw new Error('Bill creation failed: transaction did not produce a bill ID');
  }

  console.log(`✅ Bill #${billId} saved with ${items.length} item(s), total ₹${totalAmount.toFixed(2)}`);

  return billId;
}

/**
 * Fetch all bills, sorted by newest first.
 */
export async function getBills(): Promise<BillRow[]> {
  return queryAll<BillRow>(
    `SELECT b.*, COALESCE(SUM(bi.pieces), 0) AS total_pieces
     FROM ${Tables.BILLS} b
     LEFT JOIN ${Tables.BILL_ITEMS} bi ON b.id = bi.bill_id
     GROUP BY b.id
     ORDER BY b.created_at DESC`
  );
}

/**
 * Fetch a single bill with all its items and breed information.
 *
 * Joins bill_items with breeds to include breed name and rate.
 * Returns null if the bill doesn't exist.
 */
export async function getBillById(id: number): Promise<BillWithItems | null> {
  // 1. Get the bill
  const bill = await queryFirst<BillRow>(
    `SELECT * FROM ${Tables.BILLS} WHERE id = ?`,
    [id],
  );

  if (!bill) return null;

  // 2. Get items with breed info via JOIN
  const rawItems = await queryAll<{
    id: number;
    bill_id: number;
    breed_id: number;
    breed_name: string;
    rate_per_kg: number;
    pieces: number;
    weight: number;
    amount: number;
  }>(
    `SELECT
       bi.id,
       bi.bill_id,
       bi.breed_id,
       b.name AS breed_name,
       b.price_per_kg AS rate_per_kg,
       bi.pieces,
       bi.weight,
       bi.amount
     FROM ${Tables.BILL_ITEMS} bi
     LEFT JOIN ${Tables.BREEDS} b ON bi.breed_id = b.id
     WHERE bi.bill_id = ?
     ORDER BY bi.id ASC`,
    [id],
  );

  // 3. Map to typed interface
  const items: BillDetailItem[] = rawItems.map((row) => ({
    id: row.id,
    billId: row.bill_id,
    breedId: row.breed_id,
    breedName: row.breed_name ?? 'Unknown Breed',
    ratePerKg: row.rate_per_kg ?? 0,
    pieces: row.pieces,
    weight: row.weight,
    amount: row.amount,
  }));

  return {
    id: bill.id,
    totalWeight: bill.total_weight,
    totalAmount: bill.total_amount,
    createdAt: bill.created_at,
    items,
  };
}
