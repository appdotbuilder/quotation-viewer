import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { quotationsTable } from '../db/schema';
import { type CreateQuotationInput, type UpdateQuotationInput } from '../schema';
import { updateQuotation } from '../handlers/update_quotation';
import { eq } from 'drizzle-orm';

// Helper function to create a test quotation
const createTestQuotation = async (): Promise<number> => {
  const testData: CreateQuotationInput = {
    client_name: 'Test Client',
    reference_number: 'REF001',
    status: 'draft',
    title: 'Test Quotation',
    description: 'A test quotation',
    buy_price: 1000.50,
    sale_price: 1200.75,
    margin: 200.25,
    profit: 200.25,
    cost_basis: 1000.50,
    markup_percentage: 20.00,
    internal_notes: 'Test notes',
    risk_level: 'medium',
    confidentiality_level: 'restricted',
    expires_at: new Date('2024-12-31')
  };

  const result = await db.insert(quotationsTable)
    .values({
      client_name: testData.client_name,
      reference_number: testData.reference_number,
      status: testData.status,
      title: testData.title,
      description: testData.description,
      buy_price: testData.buy_price.toString(),
      sale_price: testData.sale_price.toString(),
      margin: testData.margin.toString(),
      profit: testData.profit.toString(),
      cost_basis: testData.cost_basis.toString(),
      markup_percentage: testData.markup_percentage.toString(),
      internal_notes: testData.internal_notes,
      risk_level: testData.risk_level,
      confidentiality_level: testData.confidentiality_level,
      expires_at: testData.expires_at
    })
    .returning()
    .execute();

  return result[0].id;
};

describe('updateQuotation', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update basic quotation fields', async () => {
    const quotationId = await createTestQuotation();

    const updateInput: UpdateQuotationInput = {
      id: quotationId,
      client_name: 'Updated Client',
      title: 'Updated Title',
      status: 'pending'
    };

    const result = await updateQuotation(updateInput);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(quotationId);
    expect(result!.client_name).toEqual('Updated Client');
    expect(result!.title).toEqual('Updated Title');
    expect(result!.status).toEqual('pending');
    // Verify unchanged fields remain the same
    expect(result!.reference_number).toEqual('REF001');
    expect(result!.description).toEqual('A test quotation');
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update numeric fields correctly', async () => {
    const quotationId = await createTestQuotation();

    const updateInput: UpdateQuotationInput = {
      id: quotationId,
      buy_price: 1500.75,
      sale_price: 1800.50,
      margin: 300.75,
      profit: 299.75,
      markup_percentage: 25.50
    };

    const result = await updateQuotation(updateInput);

    expect(result).not.toBeNull();
    expect(typeof result!.buy_price).toBe('number');
    expect(result!.buy_price).toEqual(1500.75);
    expect(typeof result!.sale_price).toBe('number');
    expect(result!.sale_price).toEqual(1800.50);
    expect(typeof result!.margin).toBe('number');
    expect(result!.margin).toEqual(300.75);
    expect(typeof result!.profit).toBe('number');
    expect(result!.profit).toEqual(299.75);
    expect(typeof result!.markup_percentage).toBe('number');
    expect(result!.markup_percentage).toEqual(25.50);
  });

  it('should update sensitive fields correctly', async () => {
    const quotationId = await createTestQuotation();

    const updateInput: UpdateQuotationInput = {
      id: quotationId,
      internal_notes: 'Updated sensitive notes',
      risk_level: 'high',
      confidentiality_level: 'top_secret'
    };

    const result = await updateQuotation(updateInput);

    expect(result).not.toBeNull();
    expect(result!.internal_notes).toEqual('Updated sensitive notes');
    expect(result!.risk_level).toEqual('high');
    expect(result!.confidentiality_level).toEqual('top_secret');
  });

  it('should update nullable fields to null', async () => {
    const quotationId = await createTestQuotation();

    const updateInput: UpdateQuotationInput = {
      id: quotationId,
      description: null,
      internal_notes: null,
      expires_at: null
    };

    const result = await updateQuotation(updateInput);

    expect(result).not.toBeNull();
    expect(result!.description).toBeNull();
    expect(result!.internal_notes).toBeNull();
    expect(result!.expires_at).toBeNull();
  });

  it('should persist changes to database', async () => {
    const quotationId = await createTestQuotation();

    const updateInput: UpdateQuotationInput = {
      id: quotationId,
      client_name: 'Database Test Client',
      buy_price: 2000.25
    };

    await updateQuotation(updateInput);

    // Verify changes were persisted
    const quotations = await db.select()
      .from(quotationsTable)
      .where(eq(quotationsTable.id, quotationId))
      .execute();

    expect(quotations).toHaveLength(1);
    expect(quotations[0].client_name).toEqual('Database Test Client');
    expect(parseFloat(quotations[0].buy_price)).toEqual(2000.25);
    expect(quotations[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent quotation', async () => {
    const nonExistentId = 999999;

    const updateInput: UpdateQuotationInput = {
      id: nonExistentId,
      client_name: 'Should Not Update'
    };

    const result = await updateQuotation(updateInput);

    expect(result).toBeNull();
  });

  it('should only update provided fields', async () => {
    const quotationId = await createTestQuotation();

    // Update only one field
    const updateInput: UpdateQuotationInput = {
      id: quotationId,
      status: 'approved'
    };

    const result = await updateQuotation(updateInput);

    expect(result).not.toBeNull();
    expect(result!.status).toEqual('approved');
    // Verify all other fields remain unchanged
    expect(result!.client_name).toEqual('Test Client');
    expect(result!.reference_number).toEqual('REF001');
    expect(result!.title).toEqual('Test Quotation');
    expect(result!.description).toEqual('A test quotation');
    expect(result!.buy_price).toEqual(1000.50);
    expect(result!.sale_price).toEqual(1200.75);
    expect(result!.margin).toEqual(200.25);
    expect(result!.profit).toEqual(200.25);
    expect(result!.cost_basis).toEqual(1000.50);
    expect(result!.markup_percentage).toEqual(20.00);
    expect(result!.internal_notes).toEqual('Test notes');
    expect(result!.risk_level).toEqual('medium');
    expect(result!.confidentiality_level).toEqual('restricted');
  });

  it('should update expires_at date correctly', async () => {
    const quotationId = await createTestQuotation();
    const newExpiryDate = new Date('2025-06-15');

    const updateInput: UpdateQuotationInput = {
      id: quotationId,
      expires_at: newExpiryDate
    };

    const result = await updateQuotation(updateInput);

    expect(result).not.toBeNull();
    expect(result!.expires_at).toBeInstanceOf(Date);
    expect(result!.expires_at!.toISOString()).toEqual(newExpiryDate.toISOString());
  });

  it('should update updated_at timestamp automatically', async () => {
    const quotationId = await createTestQuotation();

    // Get original updated_at
    const originalQuotation = await db.select()
      .from(quotationsTable)
      .where(eq(quotationsTable.id, quotationId))
      .execute();

    const originalUpdatedAt = originalQuotation[0].updated_at;

    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateQuotationInput = {
      id: quotationId,
      client_name: 'Timestamp Test'
    };

    const result = await updateQuotation(updateInput);

    expect(result).not.toBeNull();
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });
});