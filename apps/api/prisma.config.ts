import { defineConfig, env } from 'prisma/config';

// Prisma 7 config for the CLI (migrate / studio / db push). PrismaClient's
// own runtime connection is configured separately via a driver adapter —
// see src/prisma/prisma.service.ts.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
