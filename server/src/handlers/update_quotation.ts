import { db } from '../db';
import { quotationsTable } from '../db/schema';
import { type UpdateQuotationInput, type Quotation } from '../schema';
import { eq } from 'drizzle-orm';

export async function updateQuotation(input: UpdateQuotationInput): Promise<Quotation | null> {
  try {
    // First check if the quotation exists
    const existingQuotation = await db.select()
      .from(quotationsTable)
      .where(eq(quotationsTable.id, input.id))
      .execute();

    if (existingQuotation.length === 0) {
      return null;
    }

    // Build update object with only provided fields, converting numeric fields to strings
    const updateData: any = {
      updated_at: new Date()
    };

    if (input.client_name !== undefined) {
      updateData.client_name = input.client_name;
    }

    if (input.reference_number !== undefined) {
      updateData.reference_number = input.reference_number;
    }

    if (input.status !== undefined) {
      updateData.status = input.status;
    }

    if (input.title !== undefined) {
      updateData.title = input.title;
    }

    if (input.description !== undefined) {
      updateData.description = input.description;
    }

    // Convert numeric fields to strings for database storage
    if (input.buy_price !== undefined) {
      updateData.buy_price = input.buy_price.toString();
    }

    if (input.sale_price !== undefined) {
      updateData.sale_price = input.sale_price.toString();
    }

    if (input.margin !== undefined) {
      updateData.margin = input.margin.toString();
    }

    if (input.profit !== undefined) {
      updateData.profit = input.profit.toString();
    }

    if (input.cost_basis !== undefined) {
      updateData.cost_basis = input.cost_basis.toString();
    }

    if (input.markup_percentage !== undefined) {
      updateData.markup_percentage = input.markup_percentage.toString();
    }

    if (input.internal_notes !== undefined) {
      updateData.internal_notes = input.internal_notes;
    }

    if (input.risk_level !== undefined) {
      updateData.risk_level = input.risk_level;
    }

    if (input.confidentiality_level !== undefined) {
      updateData.confidentiality_level = input.confidentiality_level;
    }

    if (input.expires_at !== undefined) {
      updateData.expires_at = input.expires_at;
    }

    // Update the quotation
    const result = await db.update(quotationsTable)
      .set(updateData)
      .where(eq(quotationsTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      return null;
    }

    // Convert numeric fields back to numbers before returning
    const quotation = result[0];
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
    console.error('Quotation update failed:', error);
    throw error;
  }
}