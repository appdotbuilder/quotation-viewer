import { db } from '../db';
import { quotationsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type QuotationIdInput } from '../schema';

export async function deleteQuotation(input: QuotationIdInput): Promise<boolean> {
  try {
    // Delete quotation by ID
    const result = await db.delete(quotationsTable)
      .where(eq(quotationsTable.id, input.id))
      .returning({ id: quotationsTable.id })
      .execute();

    // Return true if any row was deleted, false if no quotation was found
    return result.length > 0;
  } catch (error) {
    console.error('Quotation deletion failed:', error);
    throw error;
  }
}