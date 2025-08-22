import { db } from '../db';
import { quotationsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type QuotationIdInput, type SensitiveQuotation } from '../schema';

export async function getSensitiveQuotationData(input: QuotationIdInput): Promise<SensitiveQuotation | null> {
  try {
    // Query only the sensitive fields we need for the modal
    const result = await db.select({
      id: quotationsTable.id,
      buy_price: quotationsTable.buy_price,
      sale_price: quotationsTable.sale_price,
      margin: quotationsTable.margin,
      profit: quotationsTable.profit,
      cost_basis: quotationsTable.cost_basis,
      markup_percentage: quotationsTable.markup_percentage,
      internal_notes: quotationsTable.internal_notes,
      risk_level: quotationsTable.risk_level,
      confidentiality_level: quotationsTable.confidentiality_level,
    })
    .from(quotationsTable)
    .where(eq(quotationsTable.id, input.id))
    .execute();

    // Return null if quotation not found
    if (result.length === 0) {
      return null;
    }

    const quotation = result[0];
    
    // Convert numeric fields back to numbers for the API response
    return {
      id: quotation.id,
      buy_price: parseFloat(quotation.buy_price),
      sale_price: parseFloat(quotation.sale_price),
      margin: parseFloat(quotation.margin),
      profit: parseFloat(quotation.profit),
      cost_basis: parseFloat(quotation.cost_basis),
      markup_percentage: parseFloat(quotation.markup_percentage),
      internal_notes: quotation.internal_notes,
      risk_level: quotation.risk_level,
      confidentiality_level: quotation.confidentiality_level,
    };
  } catch (error) {
    console.error('Failed to get sensitive quotation data:', error);
    throw error;
  }
}