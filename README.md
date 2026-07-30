# ERMS — Equipment Rental Management System

A Saudi-first, GCC-ready, multi-tenant Equipment Rental Management System: Next.js frontend,
NestJS backend, PostgreSQL, Redis, S3-compatible object storage.

## Status

**Phase 01 — Project Bootstrap.** The monorepo, shared packages, and four applications exist and
run, but contain no business-domain code yet (no tenants, assets, customers, contracts, rentals).
See `docs/00-Foundation/MASTER-INDEX.md` for full documentation status and `docs/09-Implementation/24-CODEX-IMPLEMENTATION-ROADMAP.md`
for the full build sequence.

## Start Here

1. Read `CLAUDE.md`.
2. Review `docs/README.md` and `docs/00-Foundation/MASTER-INDEX.md`.
3. Use the numbered folders under `docs/` as the source of truth before touching any module.

## Prerequisites

- Node.js 22.x (see `.nvmrc`)
- pnpm 10.x (`corepack enable && corepack prepare pnpm@10.33.0 --activate`)
- Docker (for local Postgres, Redis, MinIO, Mailpit)

## Installation

```bash
git clone <this repo>
cd equipment-rental
cp .env.example .env
pnpm install
```

## Local services

```bash
pnpm services:up     # Postgres, Redis, MinIO, Mailpit via docker-compose.yml
pnpm --filter @erms/api prisma:migrate
```

## Running the apps

```bash
pnpm dev
```

| App                                     | URL                               |
| --------------------------------------- | --------------------------------- |
| Web (internal operations)               | http://localhost:3000             |
| Customer portal                         | http://localhost:3100             |
| API                                     | http://localhost:4000/api/v1      |
| API docs (Swagger, non-production only) | http://localhost:4000/api/v1/docs |
| Worker health signal                    | http://localhost:4100/health      |
| Storybook                               | http://localhost:6006             |
| MinIO console                           | http://localhost:9001             |
| Mailpit inbox                           | http://localhost:8025             |

## Tests and build

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e        # apps/web only, requires a built app
pnpm validate        # lint + typecheck + test + build
```

## Troubleshooting

- **App fails to start with a configuration error:** a required environment variable is missing —
  check `.env` against `.env.example`. Every app validates its environment at startup and fails
  fast rather than starting half-configured.
- **API can't reach the database:** confirm `pnpm services:up` succeeded and
  `pnpm --filter @erms/api prisma:migrate` has been run at least once.
- **`@erms/ui` changes don't show up in the web app:** the UI package is consumed as source via
  Next's `transpilePackages`, not prebuilt — restart `pnpm dev` if changes don't hot-reload.

## Repository structure

```text
apps/            web, api, worker, customer-portal, storybook
packages/        ui, types, validation, api-client, auth, config, observability,
                 localization, testing, domain-contracts
infrastructure/  docker, terraform, environments, scripts (mostly reserved for later phases)
tooling/         shared eslint and typescript configs
docs/            source-of-truth specifications — see docs/00-Foundation/MASTER-INDEX.md
```

## Documentation

See `docs/00-Foundation/MASTER-INDEX.md` for the full inventory of specifications, decisions,
assumptions, open questions, and known gaps.

## Contributing

See `CONTRIBUTING.md`. See `SECURITY.md` to report a vulnerability.
