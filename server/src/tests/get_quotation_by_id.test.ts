import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { quotationsTable } from '../db/schema';
import { type QuotationIdInput } from '../schema';
import { getQuotationById } from '../handlers/get_quotation_by_id';
import { eq } from 'drizzle-orm';

// Test quotation data with all required fields
const testQuotation = {
  client_name: 'Test Client',
  reference_number: 'REF-001',
  status: 'draft' as const,
  title: 'Test Quotation',
  description: 'A test quotation with all details',
  buy_price: '1000.5000',
  sale_price: '1500.7500',
  margin: '500.2500',
  profit: '400.1000',
  cost_basis: '950.0000',
  markup_percentage: '52.71',
  internal_notes: 'Internal test notes',
  risk_level: 'medium' as const,
  confidentiality_level: 'confidential' as const,
  expires_at: new Date('2024-12-31')
};

describe('getQuotationById', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return quotation when found', async () => {
    // Insert test quotation
    const insertResult = await db.insert(quotationsTable)
      .values(testQuotation)
      .returning()
      .execute();

    const insertedQuotation = insertResult[0];
    const input: QuotationIdInput = { id: insertedQuotation.id };

    const result = await getQuotationById(input);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(insertedQuotation.id);
    expect(result!.client_name).toEqual('Test Client');
    expect(result!.reference_number).toEqual('REF-001');
    expect(result!.status).toEqual('draft');
    expect(result!.title).toEqual('Test Quotation');
    expect(result!.description).toEqual('A test quotation with all details');
    
    // Verify numeric field conversions
    expect(typeof result!.buy_price).toEqual('number');
    expect(result!.buy_price).toEqual(1000.5000);
    expect(typeof result!.sale_price).toEqual('number');
    expect(result!.sale_price).toEqual(1500.7500);
    expect(typeof result!.margin).toEqual('number');
    expect(result!.margin).toEqual(500.2500);
    expect(typeof result!.profit).toEqual('number');
    expect(result!.profit).toEqual(400.1000);
    expect(typeof result!.cost_basis).toEqual('number');
    expect(result!.cost_basis).toEqual(950.0000);
    expect(typeof result!.markup_percentage).toEqual('number');
    expect(result!.markup_percentage).toEqual(52.71);
    
    // Verify sensitive data is included
    expect(result!.internal_notes).toEqual('Internal test notes');
    expect(result!.risk_level).toEqual('medium');
    expect(result!.confidentiality_level).toEqual('confidential');
    
    // Verify timestamps
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.expires_at).toBeInstanceOf(Date);
  });

  it('should return null when quotation not found', async () => {
    const input: QuotationIdInput = { id: 999 };

    const result = await getQuotationById(input);

    expect(result).toBeNull();
  });

  it('should handle quotation with null optional fields', async () => {
    // Create quotation with minimal required fields
    const minimalQuotation = {
      client_name: 'Minimal Client',
      reference_number: 'MIN-001',
      status: 'pending' as const,
      title: 'Minimal Quotation',
      description: null,
      buy_price: '100.0000',
      sale_price: '150.0000',
      margin: '50.0000',
      profit: '40.0000',
      cost_basis: '90.0000',
      markup_percentage: '66.67',
      internal_notes: null,
      risk_level: 'low' as const,
      confidentiality_level: 'restricted' as const,
      expires_at: null
    };

    const insertResult = await db.insert(quotationsTable)
      .values(minimalQuotation)
      .returning()
      .execute();

    const input: QuotationIdInput = { id: insertResult[0].id };

    const result = await getQuotationById(input);

    expect(result).toBeDefined();
    expect(result!.description).toBeNull();
    expect(result!.internal_notes).toBeNull();
    expect(result!.expires_at).toBeNull();
    
    // Numeric fields should still be converted properly
    expect(typeof result!.buy_price).toEqual('number');
    expect(result!.buy_price).toEqual(100.0000);
    expect(typeof result!.markup_percentage).toEqual('number');
    expect(result!.markup_percentage).toEqual(66.67);
  });

  it('should return correct quotation when multiple quotations exist', async () => {
    // Insert multiple quotations
    const quotation1 = { ...testQuotation, reference_number: 'REF-001' };
    const quotation2 = { ...testQuotation, reference_number: 'REF-002', client_name: 'Client 2' };
    
    const result1 = await db.insert(quotationsTable)
      .values(quotation1)
      .returning()
      .execute();
    
    const result2 = await db.insert(quotationsTable)
      .values(quotation2)
      .returning()
      .execute();

    const input: QuotationIdInput = { id: result2[0].id };

    const result = await getQuotationById(input);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(result2[0].id);
    expect(result!.client_name).toEqual('Client 2');
    expect(result!.reference_number).toEqual('REF-002');
  });

  it('should verify data is correctly stored in database', async () => {
    // Insert test quotation
    const insertResult = await db.insert(quotationsTable)
      .values(testQuotation)
      .returning()
      .execute();

    const quotationId = insertResult[0].id;

    // Query directly from database to verify storage
    const dbQuotations = await db.select()
      .from(quotationsTable)
      .where(eq(quotationsTable.id, quotationId))
      .execute();

    expect(dbQuotations).toHaveLength(1);
    
    const dbQuotation = dbQuotations[0];
    expect(dbQuotation.client_name).toEqual('Test Client');
    expect(dbQuotation.reference_number).toEqual('REF-001');
    
    // Verify numeric fields are stored as strings in database
    expect(typeof dbQuotation.buy_price).toEqual('string');
    expect(dbQuotation.buy_price).toEqual('1000.5000');
    expect(typeof dbQuotation.sale_price).toEqual('string');
    expect(dbQuotation.sale_price).toEqual('1500.7500');

    // Now test handler returns proper number conversion
    const handlerResult = await getQuotationById({ id: quotationId });
    expect(typeof handlerResult!.buy_price).toEqual('number');
    expect(handlerResult!.buy_price).toEqual(1000.5000);
  });

  it('should handle high precision numeric values correctly', async () => {
    // Test with high precision values
    const precisionQuotation = {
      ...testQuotation,
      buy_price: '1234.5678',
      sale_price: '2000.9999',
      margin: '766.4321',
      profit: '700.1234',
      cost_basis: '1100.0001',
      markup_percentage: '81.90'
    };

    const insertResult = await db.insert(quotationsTable)
      .values(precisionQuotation)
      .returning()
      .execute();

    const input: QuotationIdInput = { id: insertResult[0].id };
    const result = await getQuotationById(input);

    expect(result).toBeDefined();
    expect(result!.buy_price).toEqual(1234.5678);
    expect(result!.sale_price).toEqual(2000.9999);
    expect(result!.margin).toEqual(766.4321);
    expect(result!.profit).toEqual(700.1234);
    expect(result!.cost_basis).toEqual(1100.0001);
    expect(result!.markup_percentage).toEqual(81.90);
  });
});