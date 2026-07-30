#!/usr/bin/env bash
# Clean local reset: drops and recreates the local database via Prisma,
# then re-applies all migrations. Safe only against the local docker-compose
# Postgres instance — never point DATABASE_URL at a shared environment when
# running this.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/../.."

pnpm --filter @erms/api prisma:migrate:reset -- --force
