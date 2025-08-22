import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { quotationsTable } from '../db/schema';
import { type CreateQuotationInput } from '../schema';
import { getPublicQuotations } from '../handlers/get_public_quotations';

// Test data with all required fields
const testQuotationInput: CreateQuotationInput = {
  client_name: 'Test Client Corp',
  reference_number: 'QT-2024-001',
  status: 'draft',
  title: 'Test Quotation',
  description: 'A test quotation for unit tests',
  buy_price: 1000.00,
  sale_price: 1500.00,
  margin: 500.00,
  profit: 450.00,
  cost_basis: 950.00,
  markup_percentage: 50.00,
  internal_notes: 'Highly confidential pricing information',
  risk_level: 'medium',
  confidentiality_level: 'restricted',
  expires_at: new Date('2024-12-31'),
};

const sensitiveQuotationInput: CreateQuotationInput = {
  client_name: 'Secret Client Ltd',
  reference_number: 'QT-2024-002',
  status: 'pending',
  title: 'Top Secret Project',
  description: null,
  buy_price: 50000.00,
  sale_price: 75000.00,
  margin: 25000.00,
  profit: 24000.00,
  cost_basis: 49000.00,
  markup_percentage: 53.06,
  internal_notes: 'This is highly classified financial data',
  risk_level: 'high',
  confidentiality_level: 'top_secret',
  expires_at: null,
};

describe('getPublicQuotations', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no quotations exist', async () => {
    const result = await getPublicQuotations();
    
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return public quotation data without sensitive fields', async () => {
    // Insert test quotation with sensitive data
    await db.insert(quotationsTable)
      .values({
        ...testQuotationInput,
        buy_price: testQuotationInput.buy_price.toString(),
        sale_price: testQuotationInput.sale_price.toString(),
        margin: testQuotationInput.margin.toString(),
        profit: testQuotationInput.profit.toString(),
        cost_basis: testQuotationInput.cost_basis.toString(),
        markup_percentage: testQuotationInput.markup_percentage.toString(),
      })
      .execute();

    const result = await getPublicQuotations();

    expect(result).toHaveLength(1);
    
    const publicQuotation = result[0];
    
    // Verify public fields are present
    expect(publicQuotation.id).toBeDefined();
    expect(publicQuotation.client_name).toEqual('Test Client Corp');
    expect(publicQuotation.reference_number).toEqual('QT-2024-001');
    expect(publicQuotation.status).toEqual('draft');
    expect(publicQuotation.title).toEqual('Test Quotation');
    expect(publicQuotation.description).toEqual('A test quotation for unit tests');
    expect(publicQuotation.created_at).toBeInstanceOf(Date);
    expect(publicQuotation.updated_at).toBeInstanceOf(Date);
    expect(publicQuotation.expires_at).toBeInstanceOf(Date);
    
    // Verify sensitive fields are NOT present
    expect((publicQuotation as any).buy_price).toBeUndefined();
    expect((publicQuotation as any).sale_price).toBeUndefined();
    expect((publicQuotation as any).margin).toBeUndefined();
    expect((publicQuotation as any).profit).toBeUndefined();
    expect((publicQuotation as any).cost_basis).toBeUndefined();
    expect((publicQuotation as any).markup_percentage).toBeUndefined();
    expect((publicQuotation as any).internal_notes).toBeUndefined();
    expect((publicQuotation as any).risk_level).toBeUndefined();
    expect((publicQuotation as any).confidentiality_level).toBeUndefined();
  });

  it('should return multiple quotations in correct order', async () => {
    // Insert first quotation
    await db.insert(quotationsTable)
      .values({
        ...testQuotationInput,
        buy_price: testQuotationInput.buy_price.toString(),
        sale_price: testQuotationInput.sale_price.toString(),
        margin: testQuotationInput.margin.toString(),
        profit: testQuotationInput.profit.toString(),
        cost_basis: testQuotationInput.cost_basis.toString(),
        markup_percentage: testQuotationInput.markup_percentage.toString(),
      })
      .execute();

    // Insert second quotation
    await db.insert(quotationsTable)
      .values({
        ...sensitiveQuotationInput,
        buy_price: sensitiveQuotationInput.buy_price.toString(),
        sale_price: sensitiveQuotationInput.sale_price.toString(),
        margin: sensitiveQuotationInput.margin.toString(),
        profit: sensitiveQuotationInput.profit.toString(),
        cost_basis: sensitiveQuotationInput.cost_basis.toString(),
        markup_percentage: sensitiveQuotationInput.markup_percentage.toString(),
      })
      .execute();

    const result = await getPublicQuotations();

    expect(result).toHaveLength(2);
    
    // Verify both quotations are returned with public data only
    const firstQuotation = result.find(q => q.reference_number === 'QT-2024-001');
    const secondQuotation = result.find(q => q.reference_number === 'QT-2024-002');
    
    expect(firstQuotation).toBeDefined();
    expect(firstQuotation!.client_name).toEqual('Test Client Corp');
    expect(firstQuotation!.title).toEqual('Test Quotation');
    
    expect(secondQuotation).toBeDefined();
    expect(secondQuotation!.client_name).toEqual('Secret Client Ltd');
    expect(secondQuotation!.title).toEqual('Top Secret Project');
    expect(secondQuotation!.description).toBeNull();
    expect(secondQuotation!.expires_at).toBeNull();
    
    // Ensure no sensitive data is leaked in either record
    result.forEach(quotation => {
      expect((quotation as any).buy_price).toBeUndefined();
      expect((quotation as any).internal_notes).toBeUndefined();
      expect((quotation as any).confidentiality_level).toBeUndefined();
    });
  });

  it('should handle quotations with null descriptions and expires_at', async () => {
    // Insert quotation with null values
    await db.insert(quotationsTable)
      .values({
        client_name: 'Null Field Client',
        reference_number: 'QT-2024-NULL',
        status: 'approved',
        title: 'Quotation with Nulls',
        description: null, // Explicitly null
        buy_price: '2000.00',
        sale_price: '3000.00',
        margin: '1000.00',
        profit: '950.00',
        cost_basis: '1950.00',
        markup_percentage: '53.85',
        internal_notes: null, // Explicitly null
        risk_level: 'low',
        confidentiality_level: 'confidential',
        expires_at: null, // Explicitly null
      })
      .execute();

    const result = await getPublicQuotations();

    expect(result).toHaveLength(1);
    
    const quotation = result[0];
    expect(quotation.client_name).toEqual('Null Field Client');
    expect(quotation.description).toBeNull();
    expect(quotation.expires_at).toBeNull();
    expect(quotation.created_at).toBeInstanceOf(Date);
    expect(quotation.updated_at).toBeInstanceOf(Date);
  });

  it('should handle all quotation statuses correctly', async () => {
    const statuses = ['draft', 'pending', 'approved', 'rejected', 'expired'] as const;
    
    // Insert quotations with different statuses
    for (let i = 0; i < statuses.length; i++) {
      await db.insert(quotationsTable)
        .values({
          client_name: `Client ${i + 1}`,
          reference_number: `QT-2024-${String(i + 1).padStart(3, '0')}`,
          status: statuses[i],
          title: `Quotation ${statuses[i]}`,
          description: `Quotation with ${statuses[i]} status`,
          buy_price: '1000.00',
          sale_price: '1500.00',
          margin: '500.00',
          profit: '450.00',
          cost_basis: '950.00',
          markup_percentage: '50.00',
          internal_notes: 'Internal notes',
          risk_level: 'medium',
          confidentiality_level: 'restricted',
          expires_at: new Date('2024-12-31'),
        })
        .execute();
    }

    const result = await getPublicQuotations();

    expect(result).toHaveLength(5);
    
    // Verify all statuses are present
    statuses.forEach(status => {
      const quotationWithStatus = result.find(q => q.status === status);
      expect(quotationWithStatus).toBeDefined();
      expect(quotationWithStatus!.title).toEqual(`Quotation ${status}`);
    });
  });
});