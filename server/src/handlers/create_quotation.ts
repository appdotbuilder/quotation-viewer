import { db } from '../db';
import { quotationsTable } from '../db/schema';
import { type CreateQuotationInput, type Quotation } from '../schema';

export const createQuotation = async (input: CreateQuotationInput): Promise<Quotation> => {
  try {
    // Insert quotation record with proper numeric conversions
    const result = await db.insert(quotationsTable)
      .values({
        client_name: input.client_name,
        reference_number: input.reference_number,
        status: input.status, // Uses Zod default 'draft'
        title: input.title,
        description: input.description || null,
        // Convert numeric fields to strings for database storage
        buy_price: input.buy_price.toString(),
        sale_price: input.sale_price.toString(),
        margin: input.margin.toString(),
        profit: input.profit.toString(),
        cost_basis: input.cost_basis.toString(),
        markup_percentage: input.markup_percentage.toString(),
        internal_notes: input.internal_notes || null,
        risk_level: input.risk_level, // Uses Zod default 'medium'
        confidentiality_level: input.confidentiality_level, // Uses Zod default 'restricted'
        expires_at: input.expires_at || null,
      })
      .returning()
      .execute();

    // Convert numeric fields back to numbers before returning
    const quotation = result[0];
    return {
      ...quotation,
      buy_price: parseFloat(quotation.buy_price),
      sale_price: parseFloat(quotation.sale_price),
      margin: parseFloat(quotation.margin),
      profit: parseFloat(quotation.profit),
      cost_basis: parseFloat(quotation.cost_basis),
      markup_percentage: parseFloat(quotation.markup_percentage),
    };
  } catch (error) {
    console.error('Quotation creation failed:', error);
    throw error;
  }
};