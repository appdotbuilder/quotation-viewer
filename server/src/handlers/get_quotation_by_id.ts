import { db } from '../db';
import { quotationsTable } from '../db/schema';
import { type QuotationIdInput, type Quotation } from '../schema';
import { eq } from 'drizzle-orm';

export const getQuotationById = async (input: QuotationIdInput): Promise<Quotation | null> => {
  try {
    // Query quotation by ID
    const results = await db.select()
      .from(quotationsTable)
      .where(eq(quotationsTable.id, input.id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    const quotation = results[0];

    // Convert numeric fields back to numbers before returning
    return {
      ...quotation,
      buy_price: parseFloat(quotation.buy_price),
      sale_price: parseFloat(quotation.sale_price),
      margin: parseFloat(quotation.margin),
      profit: parseFloat(quotation.profit),
      cost_basis: parseFloat(quotation.cost_basis),
      markup_percentage: parseFloat(quotation.markup_percentage)
    };
  } catch (error) {
    console.error('Failed to get quotation by ID:', error);
    throw error;
  }
};