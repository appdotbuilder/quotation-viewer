import { z } from 'zod';

// Quotation schema for complete quotation data
export const quotationSchema = z.object({
  id: z.number(),
  client_name: z.string(),
  reference_number: z.string(),
  status: z.enum(['draft', 'pending', 'approved', 'rejected', 'expired']),
  title: z.string(),
  description: z.string().nullable(),
  // Sensitive financial data
  buy_price: z.number(),
  sale_price: z.number(),
  margin: z.number(),
  profit: z.number(),
  cost_basis: z.number(),
  markup_percentage: z.number(),
  // Additional sensitive data
  internal_notes: z.string().nullable(),
  risk_level: z.enum(['low', 'medium', 'high']),
  confidentiality_level: z.enum(['restricted', 'confidential', 'top_secret']),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  expires_at: z.coerce.date().nullable(),
});

export type Quotation = z.infer<typeof quotationSchema>;

// Public quotation schema (for list view - without sensitive data)
export const publicQuotationSchema = z.object({
  id: z.number(),
  client_name: z.string(),
  reference_number: z.string(),
  status: z.enum(['draft', 'pending', 'approved', 'rejected', 'expired']),
  title: z.string(),
  description: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  expires_at: z.coerce.date().nullable(),
});

export type PublicQuotation = z.infer<typeof publicQuotationSchema>;

// Sensitive quotation details schema (for modal view)
export const sensitiveQuotationSchema = z.object({
  id: z.number(),
  buy_price: z.number(),
  sale_price: z.number(),
  margin: z.number(),
  profit: z.number(),
  cost_basis: z.number(),
  markup_percentage: z.number(),
  internal_notes: z.string().nullable(),
  risk_level: z.enum(['low', 'medium', 'high']),
  confidentiality_level: z.enum(['restricted', 'confidential', 'top_secret']),
});

export type SensitiveQuotation = z.infer<typeof sensitiveQuotationSchema>;

// Input schema for creating quotations
export const createQuotationInputSchema = z.object({
  client_name: z.string().min(1),
  reference_number: z.string().min(1),
  status: z.enum(['draft', 'pending', 'approved', 'rejected', 'expired']).default('draft'),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  buy_price: z.number().positive(),
  sale_price: z.number().positive(),
  margin: z.number(),
  profit: z.number(),
  cost_basis: z.number().positive(),
  markup_percentage: z.number().nonnegative(),
  internal_notes: z.string().nullable().optional(),
  risk_level: z.enum(['low', 'medium', 'high']).default('medium'),
  confidentiality_level: z.enum(['restricted', 'confidential', 'top_secret']).default('restricted'),
  expires_at: z.coerce.date().nullable().optional(),
});

export type CreateQuotationInput = z.infer<typeof createQuotationInputSchema>;

// Input schema for updating quotations
export const updateQuotationInputSchema = z.object({
  id: z.number(),
  client_name: z.string().min(1).optional(),
  reference_number: z.string().min(1).optional(),
  status: z.enum(['draft', 'pending', 'approved', 'rejected', 'expired']).optional(),
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  buy_price: z.number().positive().optional(),
  sale_price: z.number().positive().optional(),
  margin: z.number().optional(),
  profit: z.number().optional(),
  cost_basis: z.number().positive().optional(),
  markup_percentage: z.number().nonnegative().optional(),
  internal_notes: z.string().nullable().optional(),
  risk_level: z.enum(['low', 'medium', 'high']).optional(),
  confidentiality_level: z.enum(['restricted', 'confidential', 'top_secret']).optional(),
  expires_at: z.coerce.date().nullable().optional(),
});

export type UpdateQuotationInput = z.infer<typeof updateQuotationInputSchema>;

// Query parameters for getting quotations by ID
export const quotationIdSchema = z.object({
  id: z.number(),
});

export type QuotationIdInput = z.infer<typeof quotationIdSchema>;