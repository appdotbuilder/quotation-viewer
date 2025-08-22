import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import { 
  createQuotationInputSchema, 
  updateQuotationInputSchema, 
  quotationIdSchema 
} from './schema';

// Import handlers
import { createQuotation } from './handlers/create_quotation';
import { getPublicQuotations } from './handlers/get_public_quotations';
import { getQuotationById } from './handlers/get_quotation_by_id';
import { getSensitiveQuotationData } from './handlers/get_sensitive_quotation_data';
import { updateQuotation } from './handlers/update_quotation';
import { deleteQuotation } from './handlers/delete_quotation';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check endpoint
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Get all quotations (public data only - for main list view)
  getPublicQuotations: publicProcedure
    .query(() => getPublicQuotations()),

  // Get complete quotation by ID (including sensitive data)
  getQuotationById: publicProcedure
    .input(quotationIdSchema)
    .query(({ input }) => getQuotationById(input)),

  // Get only sensitive quotation data by ID (for secure modal)
  getSensitiveQuotationData: publicProcedure
    .input(quotationIdSchema)
    .query(({ input }) => getSensitiveQuotationData(input)),

  // Create new quotation
  createQuotation: publicProcedure
    .input(createQuotationInputSchema)
    .mutation(({ input }) => createQuotation(input)),

  // Update existing quotation
  updateQuotation: publicProcedure
    .input(updateQuotationInputSchema)
    .mutation(({ input }) => updateQuotation(input)),

  // Delete quotation
  deleteQuotation: publicProcedure
    .input(quotationIdSchema)
    .mutation(({ input }) => deleteQuotation(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();