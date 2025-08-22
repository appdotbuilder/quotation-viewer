import { serial, text, pgTable, timestamp, numeric, pgEnum } from 'drizzle-orm/pg-core';

// Define enums for quotation status, risk level, and confidentiality level
export const quotationStatusEnum = pgEnum('quotation_status', [
  'draft', 
  'pending', 
  'approved', 
  'rejected', 
  'expired'
]);

export const riskLevelEnum = pgEnum('risk_level', [
  'low', 
  'medium', 
  'high'
]);

export const confidentialityLevelEnum = pgEnum('confidentiality_level', [
  'restricted', 
  'confidential', 
  'top_secret'
]);

// Quotations table with sensitive financial data
export const quotationsTable = pgTable('quotations', {
  id: serial('id').primaryKey(),
  client_name: text('client_name').notNull(),
  reference_number: text('reference_number').notNull(),
  status: quotationStatusEnum('status').notNull().default('draft'),
  title: text('title').notNull(),
  description: text('description'), // Nullable by default
  // Sensitive financial data - using numeric for precision in monetary values
  buy_price: numeric('buy_price', { precision: 15, scale: 4 }).notNull(),
  sale_price: numeric('sale_price', { precision: 15, scale: 4 }).notNull(),
  margin: numeric('margin', { precision: 15, scale: 4 }).notNull(),
  profit: numeric('profit', { precision: 15, scale: 4 }).notNull(),
  cost_basis: numeric('cost_basis', { precision: 15, scale: 4 }).notNull(),
  markup_percentage: numeric('markup_percentage', { precision: 5, scale: 2 }).notNull(),
  // Additional sensitive data
  internal_notes: text('internal_notes'), // Nullable by default
  risk_level: riskLevelEnum('risk_level').notNull().default('medium'),
  confidentiality_level: confidentialityLevelEnum('confidentiality_level').notNull().default('restricted'),
  // Timestamps
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  expires_at: timestamp('expires_at'), // Nullable by default
});

// TypeScript types for the table schema
export type Quotation = typeof quotationsTable.$inferSelect; // For SELECT operations
export type NewQuotation = typeof quotationsTable.$inferInsert; // For INSERT operations

// Important: Export all tables and relations for proper query building
export const tables = { 
  quotations: quotationsTable 
};