import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(25),
});

export const sortDirectionSchema = z.enum(['asc', 'desc']);

export const sortQuerySchema = z.object({
  field: z.string().min(1),
  direction: sortDirectionSchema.default('asc'),
});
