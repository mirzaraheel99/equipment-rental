import { z } from 'zod';

/** Runtime validators for values crossing a trust boundary — never trust
 * unknown input, even when a TypeScript type claims it is safe. */

export const uuidSchema = z.string().uuid();

export const isoDateSchema = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: 'Expected a valid ISO 8601 date string',
});

export const nonEmptyStringSchema = z.string().trim().min(1);

export const safeDisplayStringSchema = z
  .string()
  .trim()
  .max(500)
  .refine((value) => !/[<>]/.test(value), {
    message: 'Value must not contain angle brackets',
  });

export function isUuid(value: unknown): value is string {
  return uuidSchema.safeParse(value).success;
}
