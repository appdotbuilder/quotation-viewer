import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { quotationsTable } from '../db/schema';
import { type CreateQuotationInput, type QuotationIdInput } from '../schema';
import { deleteQuotation } from '../handlers/delete_quotation';
import { eq } from 'drizzle-orm';

// Test data for creating quotations
const testQuotationInput: CreateQuotationInput = {
  client_name: 'Test Client Corp',
  reference_number: 'REF-001',
  status: 'draft',
  title: 'Test Quotation',
  description: 'A quotation for testing purposes',
  buy_price: 1000.50,
  sale_price: 1200.60,
  margin: 200.10,
  profit: 200.10,
  cost_basis: 1000.50,
  markup_percentage: 20.01,
  internal_notes: 'Internal test notes',
  risk_level: 'medium',
  confidentiality_level: 'restricted',
  expires_at: new Date('2024-12-31'),
};

describe('deleteQuotation', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing quotation and return true', async () => {
    // First, create a quotation to delete
    const insertResult = await db.insert(quotationsTable)
      .values({
        client_name: testQuotationInput.client_name,
        reference_number: testQuotationInput.reference_number,
        status: testQuotationInput.status,
        title: testQuotationInput.title,
        description: testQuotationInput.description,
        buy_price: testQuotationInput.buy_price.toString(),
        sale_price: testQuotationInput.sale_price.toString(),
        margin: testQuotationInput.margin.toString(),
        profit: testQuotationInput.profit.toString(),
        cost_basis: testQuotationInput.cost_basis.toString(),
        markup_percentage: testQuotationInput.markup_percentage.toString(),
        internal_notes: testQuotationInput.internal_notes,
        risk_level: testQuotationInput.risk_level,
        confidentiality_level: testQuotationInput.confidentiality_level,
        expires_at: testQuotationInput.expires_at,
      })
      .returning({ id: quotationsTable.id })
      .execute();

    const quotationId = insertResult[0].id;
    const deleteInput: QuotationIdInput = { id: quotationId };

    // Delete the quotation
    const result = await deleteQuotation(deleteInput);

    // Should return true indicating successful deletion
    expect(result).toBe(true);
  });

  it('should remove quotation from database', async () => {
    // First, create a quotation to delete
    const insertResult = await db.insert(quotationsTable)
      .values({
        client_name: testQuotationInput.client_name,
        reference_number: testQuotationInput.reference_number,
        status: testQuotationInput.status,
        title: testQuotationInput.title,
        description: testQuotationInput.description,
        buy_price: testQuotationInput.buy_price.toString(),
        sale_price: testQuotationInput.sale_price.toString(),
        margin: testQuotationInput.margin.toString(),
        profit: testQuotationInput.profit.toString(),
        cost_basis: testQuotationInput.cost_basis.toString(),
        markup_percentage: testQuotationInput.markup_percentage.toString(),
        internal_notes: testQuotationInput.internal_notes,
        risk_level: testQuotationInput.risk_level,
        confidentiality_level: testQuotationInput.confidentiality_level,
        expires_at: testQuotationInput.expires_at,
      })
      .returning({ id: quotationsTable.id })
      .execute();

    const quotationId = insertResult[0].id;
    const deleteInput: QuotationIdInput = { id: quotationId };

    // Delete the quotation
    await deleteQuotation(deleteInput);

    // Verify quotation is removed from database
    const quotations = await db.select()
      .from(quotationsTable)
      .where(eq(quotationsTable.id, quotationId))
      .execute();

    expect(quotations).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent quotation', async () => {
    const nonExistentId = 99999;
    const deleteInput: QuotationIdInput = { id: nonExistentId };

    // Try to delete non-existent quotation
    const result = await deleteQuotation(deleteInput);

    // Should return false indicating no deletion occurred
    expect(result).toBe(false);
  });

  it('should not affect other quotations when deleting one', async () => {
    // Create two quotations
    const quotation1 = await db.insert(quotationsTable)
      .values({
        client_name: 'Client 1',
        reference_number: 'REF-001',
        status: 'draft',
        title: 'Quotation 1',
        description: 'First quotation',
        buy_price: '1000.00',
        sale_price: '1200.00',
        margin: '200.00',
        profit: '200.00',
        cost_basis: '1000.00',
        markup_percentage: '20.00',
        internal_notes: 'Notes 1',
        risk_level: 'low',
        confidentiality_level: 'restricted',
        expires_at: new Date('2024-12-31'),
      })
      .returning({ id: quotationsTable.id })
      .execute();

    const quotation2 = await db.insert(quotationsTable)
      .values({
        client_name: 'Client 2',
        reference_number: 'REF-002',
        status: 'pending',
        title: 'Quotation 2',
        description: 'Second quotation',
        buy_price: '2000.00',
        sale_price: '2400.00',
        margin: '400.00',
        profit: '400.00',
        cost_basis: '2000.00',
        markup_percentage: '20.00',
        internal_notes: 'Notes 2',
        risk_level: 'high',
        confidentiality_level: 'confidential',
        expires_at: new Date('2024-11-30'),
      })
      .returning({ id: quotationsTable.id })
      .execute();

    // Delete first quotation
    const deleteInput: QuotationIdInput = { id: quotation1[0].id };
    const result = await deleteQuotation(deleteInput);

    expect(result).toBe(true);

    // Verify first quotation is deleted
    const deletedQuotations = await db.select()
      .from(quotationsTable)
      .where(eq(quotationsTable.id, quotation1[0].id))
      .execute();
    expect(deletedQuotations).toHaveLength(0);

    // Verify second quotation still exists
    const remainingQuotations = await db.select()
      .from(quotationsTable)
      .where(eq(quotationsTable.id, quotation2[0].id))
      .execute();
    expect(remainingQuotations).toHaveLength(1);
    expect(remainingQuotations[0].client_name).toBe('Client 2');
  });

  it('should handle deletion of quotation with all optional fields null', async () => {
    // Create a quotation with minimal data (optional fields as null)
    const minimalQuotation = await db.insert(quotationsTable)
      .values({
        client_name: 'Minimal Client',
        reference_number: 'REF-MIN',
        status: 'draft',
        title: 'Minimal Quotation',
        description: null, // Optional field as null
        buy_price: '500.00',
        sale_price: '600.00',
        margin: '100.00',
        profit: '100.00',
        cost_basis: '500.00',
        markup_percentage: '20.00',
        internal_notes: null, // Optional field as null
        risk_level: 'low',
        confidentiality_level: 'restricted',
        expires_at: null, // Optional field as null
      })
      .returning({ id: quotationsTable.id })
      .execute();

    const deleteInput: QuotationIdInput = { id: minimalQuotation[0].id };

    // Delete the minimal quotation
    const result = await deleteQuotation(deleteInput);

    expect(result).toBe(true);

    // Verify quotation is deleted
    const quotations = await db.select()
      .from(quotationsTable)
      .where(eq(quotationsTable.id, minimalQuotation[0].id))
      .execute();

    expect(quotations).toHaveLength(0);
  });
});