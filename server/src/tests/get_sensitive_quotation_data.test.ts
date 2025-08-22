import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { quotationsTable } from '../db/schema';
import { type QuotationIdInput, type CreateQuotationInput } from '../schema';
import { getSensitiveQuotationData } from '../handlers/get_sensitive_quotation_data';

// Helper function to create a test quotation
const createTestQuotation = async (): Promise<number> => {
  const testInput: CreateQuotationInput = {
    client_name: 'Test Client Corp',
    reference_number: 'REF-2024-001',
    status: 'pending',
    title: 'Test Quotation for Sensitive Data',
    description: 'A quotation for testing sensitive data access',
    buy_price: 1000.50,
    sale_price: 1500.75,
    margin: 500.25,
    profit: 450.00,
    cost_basis: 950.00,
    markup_percentage: 57.97,
    internal_notes: 'Confidential client requirements',
    risk_level: 'high',
    confidentiality_level: 'top_secret',
    expires_at: new Date('2024-12-31'),
  };

  const result = await db.insert(quotationsTable)
    .values({
      client_name: testInput.client_name,
      reference_number: testInput.reference_number,
      status: testInput.status,
      title: testInput.title,
      description: testInput.description,
      buy_price: testInput.buy_price.toString(),
      sale_price: testInput.sale_price.toString(),
      margin: testInput.margin.toString(),
      profit: testInput.profit.toString(),
      cost_basis: testInput.cost_basis.toString(),
      markup_percentage: testInput.markup_percentage.toString(),
      internal_notes: testInput.internal_notes,
      risk_level: testInput.risk_level,
      confidentiality_level: testInput.confidentiality_level,
      expires_at: testInput.expires_at,
    })
    .returning()
    .execute();

  return result[0].id;
};

describe('getSensitiveQuotationData', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return sensitive data for existing quotation', async () => {
    const quotationId = await createTestQuotation();
    
    const input: QuotationIdInput = { id: quotationId };
    const result = await getSensitiveQuotationData(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(quotationId);
    expect(result!.buy_price).toEqual(1000.50);
    expect(result!.sale_price).toEqual(1500.75);
    expect(result!.margin).toEqual(500.25);
    expect(result!.profit).toEqual(450.00);
    expect(result!.cost_basis).toEqual(950.00);
    expect(result!.markup_percentage).toEqual(57.97);
    expect(result!.internal_notes).toEqual('Confidential client requirements');
    expect(result!.risk_level).toEqual('high');
    expect(result!.confidentiality_level).toEqual('top_secret');
  });

  it('should return null for non-existent quotation', async () => {
    const input: QuotationIdInput = { id: 99999 };
    const result = await getSensitiveQuotationData(input);

    expect(result).toBeNull();
  });

  it('should handle quotation with null internal_notes', async () => {
    // Create quotation without internal notes
    const result = await db.insert(quotationsTable)
      .values({
        client_name: 'Test Client',
        reference_number: 'REF-2024-002',
        title: 'Test Quotation Without Notes',
        buy_price: '2000.00',
        sale_price: '2500.00',
        margin: '500.00',
        profit: '450.00',
        cost_basis: '1950.00',
        markup_percentage: '25.64',
        internal_notes: null,
        risk_level: 'low',
        confidentiality_level: 'restricted',
      })
      .returning()
      .execute();

    const quotationId = result[0].id;
    const input: QuotationIdInput = { id: quotationId };
    const sensitiveData = await getSensitiveQuotationData(input);

    expect(sensitiveData).not.toBeNull();
    expect(sensitiveData!.internal_notes).toBeNull();
    expect(sensitiveData!.risk_level).toEqual('low');
    expect(sensitiveData!.confidentiality_level).toEqual('restricted');
  });

  it('should correctly convert all numeric fields from string to number', async () => {
    const quotationId = await createTestQuotation();
    
    const input: QuotationIdInput = { id: quotationId };
    const result = await getSensitiveQuotationData(input);

    expect(result).not.toBeNull();
    
    // Verify all numeric fields are returned as numbers, not strings
    expect(typeof result!.buy_price).toBe('number');
    expect(typeof result!.sale_price).toBe('number');
    expect(typeof result!.margin).toBe('number');
    expect(typeof result!.profit).toBe('number');
    expect(typeof result!.cost_basis).toBe('number');
    expect(typeof result!.markup_percentage).toBe('number');
    
    // Verify specific values are correctly parsed
    expect(result!.buy_price).toEqual(1000.50);
    expect(result!.sale_price).toEqual(1500.75);
    expect(result!.markup_percentage).toEqual(57.97);
  });

  it('should only select sensitive fields from the database', async () => {
    const quotationId = await createTestQuotation();
    
    const input: QuotationIdInput = { id: quotationId };
    const result = await getSensitiveQuotationData(input);

    expect(result).not.toBeNull();
    
    // Verify that ONLY sensitive fields are included in the result
    const resultKeys = Object.keys(result!);
    const expectedKeys = [
      'id',
      'buy_price',
      'sale_price', 
      'margin',
      'profit',
      'cost_basis',
      'markup_percentage',
      'internal_notes',
      'risk_level',
      'confidentiality_level'
    ];
    
    expect(resultKeys.sort()).toEqual(expectedKeys.sort());
    
    // Verify that public fields are NOT included
    expect(result).not.toHaveProperty('client_name');
    expect(result).not.toHaveProperty('reference_number');
    expect(result).not.toHaveProperty('status');
    expect(result).not.toHaveProperty('title');
    expect(result).not.toHaveProperty('description');
    expect(result).not.toHaveProperty('created_at');
    expect(result).not.toHaveProperty('updated_at');
    expect(result).not.toHaveProperty('expires_at');
  });

  it('should handle quotations with different risk and confidentiality levels', async () => {
    // Test with different enum values
    const result = await db.insert(quotationsTable)
      .values({
        client_name: 'Test Client',
        reference_number: 'REF-2024-003',
        title: 'Medium Risk Confidential Quote',
        buy_price: '500.00',
        sale_price: '750.00',
        margin: '250.00',
        profit: '225.00',
        cost_basis: '475.00',
        markup_percentage: '57.89',
        risk_level: 'medium',
        confidentiality_level: 'confidential',
      })
      .returning()
      .execute();

    const quotationId = result[0].id;
    const input: QuotationIdInput = { id: quotationId };
    const sensitiveData = await getSensitiveQuotationData(input);

    expect(sensitiveData).not.toBeNull();
    expect(sensitiveData!.risk_level).toEqual('medium');
    expect(sensitiveData!.confidentiality_level).toEqual('confidential');
    expect(sensitiveData!.buy_price).toEqual(500.00);
    expect(sensitiveData!.sale_price).toEqual(750.00);
  });
});