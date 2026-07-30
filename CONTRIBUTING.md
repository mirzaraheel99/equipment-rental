# Contributing to ERMS

## Before you start

Read, in order: `CLAUDE.md`, `docs/README.md`, `docs/00-Foundation/MASTER-INDEX.md`, then the
domain/data/API/UX documents relevant to the area you're changing. Do not invent requirements —
if something is unspecified, add it to `docs/00-Foundation/OPEN-QUESTIONS-REGISTER.md` instead of
guessing.

## Branch naming

```text
feature/erms-123-short-description
fix/erms-456-short-description
docs/erms-789-short-description
```

## Commits

Conventional Commits, enforced by commitlint on every commit:

```text
feat(asset): add asset onboarding validation
fix(contract): prevent signed version mutation
docs(api): update contract endpoint registry
test(rental): add double-booking concurrency case
```

## Local setup

```bash
corepack enable
corepack prepare pnpm@10.33.0 --activate

cp .env.example .env
pnpm install
pnpm services:up      # Postgres, Redis, MinIO, Mailpit
pnpm --filter @erms/api prisma:migrate
pnpm dev
```

## Before opening a PR

```bash
pnpm validate   # lint + typecheck + test + build
```

Every PR must include: purpose, source requirement, scope, screenshots (if UI), migration impact,
security impact, test evidence, documentation updates, rollback notes — see
`.github/pull_request_template.md`.

## Tests

Add tests with the implementation, not after. Unit tests are colocated with source
(`*.test.ts`); NestJS e2e specs live in `apps/api/test/*.e2e-spec.ts`; Playwright e2e specs live
in `apps/web/tests/e2e/*.spec.ts`.

## Dependency policy

Every new dependency requires a short justification in the PR description (per
`docs/09-Implementation/25-IMPLEMENTATION-PACK-01-PROJECT-BOOTSTRAP.md` §32.1). One approved
library per responsibility — do not add a second library that solves a problem an existing
dependency already solves. License must be on the allowlist in
`docs/00-Foundation/DECISION-REGISTER.md` decision #15.

## Security

See `SECURITY.md` for vulnerability reporting. Never bypass tenant filtering, RBAC, or audit
logging — these are foundation requirements, not optional hardening.

## Code review expectations

- One approved task/requirement per PR — no unrelated refactoring bundled in
- Reviewer checks the relevant phase gate in
  `docs/09-Implementation/24-CODEX-IMPLEMENTATION-ROADMAP.md` §4 (Functional, Security, Data, API,
  UX, Observability, Documentation)
- Registries (permission, event, route, database dictionary) must be updated in the same PR that
  introduces what they describe — never as a follow-up
