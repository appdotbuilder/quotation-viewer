import { db } from '../db';
import { quotationsTable } from '../db/schema';
import { type PublicQuotation } from '../schema';

export const getPublicQuotations = async (): Promise<PublicQuotation[]> => {
  try {
    // Select only non-sensitive columns for public view
    const results = await db.select({
      id: quotationsTable.id,
      client_name: quotationsTable.client_name,
      reference_number: quotationsTable.reference_number,
      status: quotationsTable.status,
      title: quotationsTable.title,
      description: quotationsTable.description,
      created_at: quotationsTable.created_at,
      updated_at: quotationsTable.updated_at,
      expires_at: quotationsTable.expires_at,
    })
    .from(quotationsTable)
    .execute();

    // Return results directly - no sensitive data conversion needed
    return results;
  } catch (error) {
    console.error('Failed to fetch public quotations:', error);
    throw error;
  }
};