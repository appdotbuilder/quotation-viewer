import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { quotationsTable } from '../db/schema';
import { type CreateQuotationInput } from '../schema';
import { createQuotation } from '../handlers/create_quotation';
import { eq } from 'drizzle-orm';

// Complete test input with all required fields
const testInput: CreateQuotationInput = {
  client_name: 'Acme Corporation',
  reference_number: 'REF-2024-001',
  status: 'draft',
  title: 'Software Development Project',
  description: 'Custom software development for inventory management',
  buy_price: 15000.50,
  sale_price: 22500.75,
  margin: 7500.25,
  profit: 7500.25,
  cost_basis: 15000.50,
  markup_percentage: 50.00,
  internal_notes: 'Client requires expedited delivery',
  risk_level: 'medium',
  confidentiality_level: 'confidential',
  expires_at: new Date('2024-12-31'),
};

// Minimal test input (explicitly including fields that have Zod defaults)
const minimalInput: CreateQuotationInput = {
  client_name: 'Simple Client',
  reference_number: 'REF-MIN-001',
  status: 'draft', // Explicitly include Zod default
  title: 'Basic Project',
  buy_price: 1000.00,
  sale_price: 1500.00,
  margin: 500.00,
  profit: 500.00,
  cost_basis: 1000.00,
  markup_percentage: 50.00,
  risk_level: 'medium', // Explicitly include Zod default
  confidentiality_level: 'restricted', // Explicitly include Zod default
};

describe('createQuotation', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a quotation with all fields', async () => {
    const result = await createQuotation(testInput);

    // Validate basic fields
    expect(result.client_name).toEqual('Acme Corporation');
    expect(result.reference_number).toEqual('REF-2024-001');
    expect(result.status).toEqual('draft');
    expect(result.title).toEqual('Software Development Project');
    expect(result.description).toEqual('Custom software development for inventory management');
    expect(result.internal_notes).toEqual('Client requires expedited delivery');
    expect(result.risk_level).toEqual('medium');
    expect(result.confidentiality_level).toEqual('confidential');

    // Validate numeric fields are properly converted
    expect(result.buy_price).toEqual(15000.50);
    expect(typeof result.buy_price).toBe('number');
    expect(result.sale_price).toEqual(22500.75);
    expect(typeof result.sale_price).toBe('number');
    expect(result.margin).toEqual(7500.25);
    expect(typeof result.margin).toBe('number');
    expect(result.profit).toEqual(7500.25);
    expect(typeof result.profit).toBe('number');
    expect(result.cost_basis).toEqual(15000.50);
    expect(typeof result.cost_basis).toBe('number');
    expect(result.markup_percentage).toEqual(50.00);
    expect(typeof result.markup_percentage).toBe('number');

    // Validate auto-generated fields
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.expires_at).toBeInstanceOf(Date);
  });

  it('should create a quotation with minimal input and apply Zod defaults', async () => {
    const result = await createQuotation(minimalInput);

    // Validate basic fields
    expect(result.client_name).toEqual('Simple Client');
    expect(result.reference_number).toEqual('REF-MIN-001');
    expect(result.title).toEqual('Basic Project');

    // Validate Zod defaults are applied
    expect(result.status).toEqual('draft');
    expect(result.risk_level).toEqual('medium');
    expect(result.confidentiality_level).toEqual('restricted');

    // Validate nullable fields are null when not provided
    expect(result.description).toBeNull();
    expect(result.internal_notes).toBeNull();
    expect(result.expires_at).toBeNull();

    // Validate numeric fields
    expect(result.buy_price).toEqual(1000.00);
    expect(result.sale_price).toEqual(1500.00);
    expect(result.markup_percentage).toEqual(50.00);
  });

  it('should save quotation to database correctly', async () => {
    const result = await createQuotation(testInput);

    // Query the database to verify the data was saved
    const quotations = await db.select()
      .from(quotationsTable)
      .where(eq(quotationsTable.id, result.id))
      .execute();

    expect(quotations).toHaveLength(1);
    const savedQuotation = quotations[0];

    // Verify basic fields
    expect(savedQuotation.client_name).toEqual('Acme Corporation');
    expect(savedQuotation.reference_number).toEqual('REF-2024-001');
    expect(savedQuotation.title).toEqual('Software Development Project');

    // Verify numeric fields are stored as strings in the database
    expect(savedQuotation.buy_price).toEqual('15000.5000');
    expect(savedQuotation.sale_price).toEqual('22500.7500');
    expect(savedQuotation.margin).toEqual('7500.2500');
    expect(savedQuotation.profit).toEqual('7500.2500');
    expect(savedQuotation.cost_basis).toEqual('15000.5000');
    expect(savedQuotation.markup_percentage).toEqual('50.00');

    // Verify enums
    expect(savedQuotation.status).toEqual('draft');
    expect(savedQuotation.risk_level).toEqual('medium');
    expect(savedQuotation.confidentiality_level).toEqual('confidential');

    // Verify timestamps
    expect(savedQuotation.created_at).toBeInstanceOf(Date);
    expect(savedQuotation.updated_at).toBeInstanceOf(Date);
    expect(savedQuotation.expires_at).toBeInstanceOf(Date);
  });

  it('should handle null/optional values correctly', async () => {
    const inputWithNulls: CreateQuotationInput = {
      ...minimalInput,
      description: null,
      internal_notes: null,
      expires_at: null,
    };

    const result = await createQuotation(inputWithNulls);

    // Verify null values are properly handled
    expect(result.description).toBeNull();
    expect(result.internal_notes).toBeNull();
    expect(result.expires_at).toBeNull();

    // Verify in database
    const quotations = await db.select()
      .from(quotationsTable)
      .where(eq(quotationsTable.id, result.id))
      .execute();

    const savedQuotation = quotations[0];
    expect(savedQuotation.description).toBeNull();
    expect(savedQuotation.internal_notes).toBeNull();
    expect(savedQuotation.expires_at).toBeNull();
  });

  it('should handle different status values correctly', async () => {
    const statusesToTest: Array<'draft' | 'pending' | 'approved' | 'rejected' | 'expired'> = [
      'draft', 'pending', 'approved', 'rejected', 'expired'
    ];

    for (const status of statusesToTest) {
      const input: CreateQuotationInput = {
        ...minimalInput,
        reference_number: `REF-${status.toUpperCase()}-001`,
        status,
      };

      const result = await createQuotation(input);
      expect(result.status).toEqual(status);
      expect(result.reference_number).toEqual(`REF-${status.toUpperCase()}-001`);
    }
  });

  it('should handle different risk and confidentiality levels', async () => {
    const riskLevels: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
    const confidentialityLevels: Array<'restricted' | 'confidential' | 'top_secret'> = [
      'restricted', 'confidential', 'top_secret'
    ];

    for (const riskLevel of riskLevels) {
      for (const confidentialityLevel of confidentialityLevels) {
        const input: CreateQuotationInput = {
          ...minimalInput,
          reference_number: `REF-${riskLevel}-${confidentialityLevel}`,
          risk_level: riskLevel,
          confidentiality_level: confidentialityLevel,
        };

        const result = await createQuotation(input);
        expect(result.risk_level).toEqual(riskLevel);
        expect(result.confidentiality_level).toEqual(confidentialityLevel);
      }
    }
  });

  it('should handle precise numeric values correctly', async () => {
    const precisionInput: CreateQuotationInput = {
      ...minimalInput,
      reference_number: 'REF-PRECISION-001',
      buy_price: 12345.6789,
      sale_price: 98765.4321,
      margin: 86419.7532,
      profit: 86419.7532,
      cost_basis: 12345.6789,
      markup_percentage: 700.12,
    };

    const result = await createQuotation(precisionInput);

    // Verify numeric precision is maintained
    expect(result.buy_price).toEqual(12345.6789);
    expect(result.sale_price).toEqual(98765.4321);
    expect(result.margin).toEqual(86419.7532);
    expect(result.profit).toEqual(86419.7532);
    expect(result.cost_basis).toEqual(12345.6789);
    expect(result.markup_percentage).toEqual(700.12);
  });

  it('should create multiple quotations independently', async () => {
    const firstQuotation = await createQuotation({
      ...testInput,
      reference_number: 'REF-FIRST-001',
    });

    const secondQuotation = await createQuotation({
      ...testInput,
      reference_number: 'REF-SECOND-001',
      client_name: 'Different Client',
    });

    // Verify both quotations have different IDs
    expect(firstQuotation.id).not.toEqual(secondQuotation.id);
    expect(firstQuotation.reference_number).toEqual('REF-FIRST-001');
    expect(secondQuotation.reference_number).toEqual('REF-SECOND-001');
    expect(secondQuotation.client_name).toEqual('Different Client');

    // Verify both exist in database
    const allQuotations = await db.select()
      .from(quotationsTable)
      .execute();

    expect(allQuotations).toHaveLength(2);
  });
});