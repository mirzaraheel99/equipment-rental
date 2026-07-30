# 25 — Implementation Pack 01: Project Bootstrap

**Document ID:** ERMS-IMP-001  
**Version:** 0.1  
**Status:** Implementation Guidance — Coding Not Yet Authorized  
**Execution Model:** Claude Code / Codex  
**Architecture:** TypeScript monorepo, React/Next.js frontend, NestJS backend, PostgreSQL, Redis, S3-compatible storage  
**Purpose:** Define the exact first implementation package required to initialize the ERMS repository, local development environment, shared configuration, continuous integration pipeline, quality controls, documentation structure, and readiness checks before any business-domain code is created.

---

## 1. Objective

Create a clean, reproducible, production-capable project foundation that can support all later ERMS domains without requiring repository restructuring.

This implementation pack must produce:

- A TypeScript monorepo
- Separate frontend, backend, worker, portal, and shared packages
- Strict code-quality controls
- Local PostgreSQL, Redis, and object-storage services
- Environment validation
- Shared configuration
- CI pipeline
- Test foundation
- Documentation foundation
- Security-conscious secret handling
- Repeatable developer onboarding
- Clear extension points for future domains

No business-domain features are included in this pack.

---

## 2. In Scope

- Repository initialization
- Monorepo structure
- Package manager selection
- TypeScript configuration
- Linting
- Formatting
- Git hooks
- Commit standards
- Shared environment validation
- Local development infrastructure
- Base Next.js application
- Base NestJS API
- Base worker process
- Base customer portal
- Shared UI package
- Shared types package
- Shared validation package
- Shared API client package
- Shared observability package
- Shared localization package
- Unit-test setup
- End-to-end test foundation
- Storybook setup
- Docker Compose
- CI workflow
- Basic health endpoints
- Repository documentation
- Security baseline

---

## 3. Out of Scope

This pack must not implement:

- Authentication
- Tenant management
- Asset Registry
- Customer management
- Contracts
- Rentals
- Pricing
- Dispatch
- Maintenance
- Inventory
- Finance
- Reporting
- ZATCA
- Telematics
- Payments
- Production deployment infrastructure
- Production Kubernetes
- Business database tables
- Business APIs
- Business UI screens

Only foundation placeholders and interfaces are allowed.

---

## 4. Recommended Technology Decisions

### 4.1 Package Manager

Recommended:

```text
pnpm
```

Rationale:

- Strong workspace support
- efficient dependency storage
- strict dependency resolution
- suitable for large TypeScript monorepos

### 4.2 Monorepo Orchestration

Recommended:

```text
Turborepo
```

Rationale:

- Simple build graph
- task caching
- good compatibility with Next.js and TypeScript packages
- lower overhead than more complex enterprise tooling

### 4.3 Node.js

Recommended:

```text
Node.js 22 LTS
```

The exact supported runtime must be locked in:

- `.nvmrc`
- `.node-version`
- `package.json` engines
- CI configuration

### 4.4 Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- controlled component foundation
- Storybook

### 4.5 Backend

- NestJS
- TypeScript
- OpenAPI
- request validation
- structured logging
- health checks

### 4.6 Database and Infrastructure

Local-only for this pack:

- PostgreSQL
- Redis
- MinIO or equivalent S3-compatible storage
- Mailpit or equivalent local mail catcher

### 4.7 Test Tools

Recommended:

- Vitest for packages and frontend units
- Jest only where NestJS tooling requires it, unless standardized on Vitest successfully
- Playwright for end-to-end tests
- Testing Library for React
- Supertest or equivalent for API tests
- Storybook interaction tests
- axe-based accessibility checks

A single test runner should be preferred where practical.

---

## 5. Target Repository Structure

```text
erms/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/
│   │   ├── public/
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── api/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── common/
│   │   │   ├── config/
│   │   │   ├── health/
│   │   │   └── main.ts
│   │   ├── test/
│   │   └── package.json
│   │
│   ├── worker/
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── customer-portal/
│   │   ├── app/
│   │   ├── components/
│   │   └── package.json
│   │
│   └── storybook/
│       └── package.json
│
├── packages/
│   ├── ui/
│   ├── types/
│   ├── validation/
│   ├── api-client/
│   ├── auth/
│   ├── config/
│   ├── observability/
│   ├── localization/
│   ├── testing/
│   └── domain-contracts/
│
├── infrastructure/
│   ├── docker/
│   ├── terraform/
│   ├── environments/
│   └── scripts/
│
├── docs/
│   ├── foundation/
│   ├── product/
│   ├── domains/
│   ├── architecture/
│   ├── data/
│   ├── api/
│   ├── ux/
│   ├── security/
│   ├── implementation/
│   └── registers/
│
├── tooling/
│   ├── eslint/
│   ├── typescript/
│   └── scripts/
│
├── .github/
│   ├── workflows/
│   ├── pull_request_template.md
│   └── ISSUE_TEMPLATE/
│
├── .changeset/
├── .editorconfig
├── .env.example
├── .gitignore
├── .npmrc
├── .nvmrc
├── CLAUDE.md
├── CODEOWNERS
├── CONTRIBUTING.md
├── docker-compose.yml
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
├── SECURITY.md
├── tsconfig.base.json
└── turbo.json
```

---

## 6. Root Package Configuration

The root `package.json` should:

- Be private
- Declare Node and pnpm versions
- Define workspace-wide scripts
- Avoid runtime dependencies unless truly shared at root

Recommended scripts:

```json
{
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "test:e2e": "turbo run test:e2e",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "clean": "turbo run clean && rimraf node_modules",
    "services:up": "docker compose up -d",
    "services:down": "docker compose down",
    "services:reset": "docker compose down -v",
    "validate": "pnpm lint && pnpm typecheck && pnpm test && pnpm build"
  }
}
```

Final scripts may vary, but the intent must remain.

---

## 7. Workspace Configuration

`pnpm-workspace.yaml` should include:

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tooling/*"
```

The workspace must prevent undeclared cross-package imports.

---

## 8. TypeScript Standards

### 8.1 Base Configuration

`tsconfig.base.json` must enable:

- `strict`
- `noImplicitOverride`
- `noUncheckedIndexedAccess`
- `exactOptionalPropertyTypes`
- `noFallthroughCasesInSwitch`
- `useUnknownInCatchVariables`
- `forceConsistentCasingInFileNames`
- `isolatedModules`
- `resolveJsonModule`

### 8.2 Path Rules

Prefer package imports:

```text
@erms/ui
@erms/types
@erms/validation
@erms/api-client
@erms/config
```

Avoid broad root aliases that hide package boundaries.

### 8.3 Type Safety Rules

- No `any` without documented exception
- Use `unknown` for untrusted input
- Runtime validation required at boundaries
- No duplicate DTO definitions across frontend and backend
- Shared contracts belong in controlled packages
- Database types must not leak directly into public APIs

---

## 9. Linting and Formatting

### 9.1 ESLint

Shared ESLint configuration should enforce:

- TypeScript rules
- React hooks
- import ordering
- no unused variables
- no floating promises
- no unsafe assignment
- no console use outside approved logger
- boundary restrictions
- accessibility rules
- no direct environment access outside config package
- no cross-domain imports when domains are later introduced

### 9.2 Prettier

One shared Prettier configuration.

Formatting should run automatically through editor and CI.

### 9.3 EditorConfig

Provide consistent:

- UTF-8
- LF line endings
- indentation
- final newline
- trailing whitespace handling

---

## 10. Git and Commit Standards

### 10.1 Branching

Recommended branch naming:

```text
feature/erms-123-short-description
fix/erms-456-short-description
docs/erms-789-short-description
```

### 10.2 Conventional Commits

Examples:

```text
feat(asset): add asset onboarding validation
fix(contract): prevent signed version mutation
docs(api): update contract endpoint registry
test(rental): add double-booking concurrency case
```

### 10.3 Commit Hooks

Use a lightweight hook manager to run:

- staged lint
- formatting
- commit-message validation

Do not run the complete test suite on every commit hook.

### 10.4 Pull Requests

Every PR must include:

- Purpose
- Source requirement
- Scope
- Screenshots if UI
- Migration impact
- Security impact
- Test evidence
- Documentation updates
- Rollback notes

---

## 11. Environment Configuration

### 11.1 Environment Principles

- No direct `process.env` usage outside configuration adapters
- Validate all environment variables at startup
- Fail fast on invalid required variables
- Never commit secrets
- Use `.env.example`
- Separate public and server-only variables
- Prefix public web variables explicitly

### 11.2 Initial Variables

```text
NODE_ENV
APP_ENV
WEB_PORT
API_PORT
WORKER_PORT
DATABASE_URL
REDIS_URL
S3_ENDPOINT
S3_REGION
S3_BUCKET
S3_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY
MAIL_HOST
MAIL_PORT
LOG_LEVEL
OTEL_EXPORTER_OTLP_ENDPOINT
```

No real credentials belong in `.env.example`.

### 11.3 Environment Package

Create `@erms/config` to provide:

- Typed configuration
- runtime validation
- application-specific schemas
- public/server separation
- test configuration helpers

---

## 12. Local Infrastructure

`docker-compose.yml` should initially provide:

### PostgreSQL

- Persistent local volume
- Health check
- Development-only credentials
- Exposed local port
- UTF-8 configuration

### Redis

- Persistent optional volume
- Health check
- Local port

### MinIO

- S3-compatible storage
- Development bucket initialization
- Console port
- Health check

### Mailpit

- SMTP endpoint
- Web inbox
- No external email delivery

### Optional Future Services

Do not add yet unless required:

- OpenSearch
- Kafka
- Prometheus
- Grafana
- ClamAV
- identity provider

Avoid unnecessary local complexity in Bootstrap.

---

## 13. Base Web Application

### 13.1 Requirements

The web application must include:

- Next.js App Router
- TypeScript
- global error boundary
- not-found page
- base layout
- health/status page
- environment indicator in non-production
- shared UI package integration
- localization foundation
- theme provider
- structured API-client use
- no business screens

### 13.2 Initial Routes

```text
/
/health
/dev/components
```

The root page should only confirm successful setup.

### 13.3 Restrictions

- No fake dashboard
- No hardcoded business navigation
- No mock business data presented as product behavior
- No business permissions yet

---

## 14. Base Customer Portal

Create a separate Next.js application or a clearly isolated application boundary.

Initial routes:

```text
/
/health
```

It should share:

- UI package
- localization
- config
- API client
- observability

It must remain logically isolated from internal-user navigation.

---

## 15. Base API Application

### 15.1 Requirements

The NestJS API must include:

- Global validation pipe
- standardized error filter
- request ID and correlation ID
- structured logger
- OpenAPI
- health endpoint
- readiness endpoint
- liveness endpoint
- configuration module
- graceful shutdown
- CORS configuration
- security headers
- request-size limits
- API prefix `/api/v1`

### 15.2 Initial Endpoints

```text
GET /api/v1/health
GET /api/v1/health/live
GET /api/v1/health/ready
```

### 15.3 Standard Response

Health endpoints may use a specialized health format, but general APIs should later follow the approved response standard.

### 15.4 Restrictions

- No placeholder business endpoints
- No database schema beyond migration infrastructure
- No authentication bypass patterns
- No generic “admin” endpoint

---

## 16. Base Worker Application

The worker application should include:

- Shared configuration
- Redis connection abstraction
- structured logger
- health signal
- graceful shutdown
- job registry abstraction
- retry-policy interface
- dead-letter interface
- no operational jobs yet

A single sample development job may be used only to validate the worker pipeline.

---

## 17. Shared UI Package

The initial package should include only foundation components:

- Button
- Input
- Label
- Textarea
- Select
- Checkbox
- Radio
- Switch
- Badge
- Alert
- Dialog
- Drawer
- Tabs
- Skeleton
- Spinner
- Page container
- Theme provider
- Direction provider

Each component must include:

- TypeScript props
- accessibility behavior
- RTL support
- Storybook story
- unit or interaction test
- loading/disabled/error states where applicable

Do not build domain-specific components in Bootstrap.

---

## 18. Shared Types and Validation

### 18.1 `@erms/types`

Include only foundation types:

- Environment
- Language
- Direction
- Correlation ID
- API success envelope
- API error envelope
- Pagination metadata
- Sort definition
- Filter primitives

### 18.2 `@erms/validation`

Include:

- Shared runtime-validation helpers
- UUID validation
- pagination validation
- sort validation
- date validation
- safe string helpers

Do not add business schemas yet.

---

## 19. API Client Package

The base API client must support:

- Configurable base URL
- Correlation ID propagation
- standardized error parsing
- request timeout
- abort signal
- authentication hook interface
- retry only for safe operations
- typed response envelopes
- no silent swallowing of errors

Do not hardcode frontend fetch calls throughout apps.

---

## 20. Localization Foundation

Create `@erms/localization`.

Initial requirements:

- English
- Arabic
- locale detection
- explicit language switch
- direction provider
- number formatting
- currency formatting
- date formatting
- pluralization
- fallback behavior
- missing-key development warnings

Initial translation namespaces:

```text
common
navigation
errors
validation
```

Do not add business translations yet.

---

## 21. Observability Foundation

Create `@erms/observability`.

Requirements:

- Structured JSON logging
- Correlation ID
- request ID
- application name
- environment
- log level
- error serialization
- OpenTelemetry initialization interface
- no secrets or raw sensitive payloads in logs

Initial metrics:

- Application start
- health check
- request count
- request duration
- error count

---

## 22. Database Migration Foundation

Even without business tables, configure:

- ORM migration tool
- migration directory
- migration naming
- migration status command
- clean local reset command
- CI migration validation
- no automatic production schema synchronization

### ORM Decision

The final ORM must be explicitly approved before Bootstrap execution.

Current options:

- Prisma
- Drizzle

Do not install both.

---

## 23. Test Foundation

### 23.1 Unit Tests

Configure unit testing for:

- packages
- web
- API
- worker

### 23.2 Integration Tests

Provide infrastructure for:

- API boot
- PostgreSQL test database
- Redis test connection
- cleanup strategy

### 23.3 End-to-End Tests

Playwright should validate:

- Web app loads
- Customer portal loads
- API health responds
- Arabic direction can switch
- Dark/light theme can switch

### 23.4 Accessibility

Run automated accessibility checks on:

- Root page
- component stories
- basic dialog
- base form

---

## 24. Storybook

Storybook should include:

- Shared tokens
- foundation components
- light mode
- dark mode
- Arabic RTL
- density examples
- accessibility addon
- interaction testing

Storybook must build in CI.

---

## 25. Continuous Integration

Create a CI workflow triggered by:

- Pull request
- Push to protected branches

Recommended jobs:

1. Install
2. Format check
3. Lint
4. Type check
5. Unit tests
6. Build packages
7. Build apps
8. Storybook build
9. End-to-end smoke tests
10. Dependency vulnerability scan
11. Secret scan
12. License-policy check
13. Migration validation

Use caching safely.

CI must run from a clean checkout.

---

## 26. Security Baseline

Bootstrap must include:

- Dependency scanning
- Secret scanning
- secure headers
- CORS allowlist configuration
- request size limits
- safe error responses
- no stack traces in production
- no secrets in logs
- environment validation
- lockfile committed
- restricted production scripts
- documented vulnerability reporting

Create:

```text
SECURITY.md
```

---

## 27. Documentation Requirements

### 27.1 Root README

Must include:

- Product description
- Planning status
- prerequisites
- installation
- environment setup
- service startup
- application startup
- test commands
- build commands
- troubleshooting
- documentation links

### 27.2 CONTRIBUTING

Must include:

- Branch naming
- commits
- pull requests
- tests
- documentation updates
- dependency rules
- security reporting
- code review expectations

### 27.3 CLAUDE.md

Must instruct Claude Code to:

- Read planning documents
- Avoid business implementation
- Follow repository boundaries
- use shared packages
- update docs
- avoid unapproved dependencies
- report conflicts
- never create hidden tenant or security assumptions

---

## 28. Exact Deliverables

The implementation pack is complete only when the repository contains:

### Root

- `README.md`
- `CLAUDE.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `CODEOWNERS`
- `.editorconfig`
- `.gitignore`
- `.npmrc`
- `.nvmrc`
- `.env.example`
- `package.json`
- `pnpm-workspace.yaml`
- `pnpm-lock.yaml`
- `turbo.json`
- `tsconfig.base.json`
- `docker-compose.yml`

### Applications

- `apps/web`
- `apps/api`
- `apps/worker`
- `apps/customer-portal`
- Storybook application or configuration

### Packages

- `packages/ui`
- `packages/types`
- `packages/validation`
- `packages/api-client`
- `packages/config`
- `packages/observability`
- `packages/localization`
- `packages/testing`
- `packages/domain-contracts`

### CI

- `.github/workflows/ci.yml`
- Pull-request template
- Dependabot or approved dependency-update configuration

---

## 29. Recommended Command Sequence

This is guidance, not an instruction to execute before authorization.

```bash
corepack enable
corepack prepare pnpm@<approved-version> --activate

pnpm install
pnpm services:up
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

Versions must be pinned before execution.

---

## 30. Acceptance Tests

### AT-001 — Clean Clone

Given a new developer clones the repository, when documented setup steps are followed, then all dependencies install without manual source changes.

### AT-002 — Local Services

Given Docker is available, when `pnpm services:up` runs, then PostgreSQL, Redis, object storage, and mail services become healthy.

### AT-003 — Application Startup

Given valid local environment variables, when `pnpm dev` runs, then web, API, worker, and customer portal start successfully.

### AT-004 — Health

When health endpoints are called, they return success and correlation metadata where applicable.

### AT-005 — Quality

When `pnpm validate` runs, formatting, lint, types, tests, and builds complete successfully.

### AT-006 — CI

When a pull request is opened, the full CI pipeline runs and blocks merge on failure.

### AT-007 — RTL

When the language changes to Arabic, the base application direction changes to RTL without layout failure.

### AT-008 — Theme

When theme changes, shared components render correctly in light and dark modes.

### AT-009 — Environment Failure

Given a required variable is missing, the affected application fails with a clear safe configuration error.

### AT-010 — Security

Given a secret-like value is committed in a test branch, secret scanning blocks the pipeline.

---

## 31. Definition of Done

Implementation Pack 01 is complete when:

- Monorepo structure matches the approved architecture
- All applications build
- Shared packages build
- Local services are reproducible
- CI passes from clean checkout
- Strict TypeScript is enabled
- Linting and formatting are enforced
- Environment validation exists
- Health checks exist
- Structured logging exists
- Storybook builds
- RTL foundation works
- Accessibility smoke tests pass
- No business-domain code exists
- No real secrets are committed
- Documentation is complete
- Claude/Codex rules are present
- Repository can proceed to Platform Core without restructuring

---

## 32. Risks

### 32.1 Premature Dependency Growth

Risk:

Adding libraries before real requirements exist.

Control:

Every new dependency requires a short architectural justification.

### 32.2 Duplicate Frameworks

Risk:

Using multiple libraries for the same responsibility.

Control:

One approved solution per category.

### 32.3 Fake Product Screens

Risk:

Generating attractive placeholder dashboards that later become technical debt.

Control:

Bootstrap includes only neutral setup pages.

### 32.4 Weak Package Boundaries

Risk:

Applications import source files directly from one another.

Control:

All sharing occurs through explicit packages and exports.

### 32.5 Environment Drift

Risk:

Local, CI, and production use different assumptions.

Control:

Pin runtime versions and validate configuration consistently.

---

## 33. Open Decisions Before Execution

The following must be approved before coding:

1. Exact Node.js version
2. Exact pnpm version
3. Turborepo confirmation
4. Prisma versus Drizzle
5. Vitest-only versus mixed Vitest/Jest
6. UI primitive foundation
7. Icon library
8. Storybook location
9. Next.js version
10. NestJS version
11. Tailwind version
12. Local object-storage choice
13. Secret-scanning tool
14. Dependency-update policy
15. License allowlist
16. Supported developer operating systems
17. Whether customer portal is a separate app at launch
18. Whether the mobile PWA is separate or part of the internal web app

No tool should guess these decisions during implementation.

---

## 34. Next Implementation Pack

After approval and completion of Bootstrap, the next package should be:

**26 — Implementation Pack 02: Platform Core**

It will define:

- Tenant context
- legal entities
- branches
- departments
- settings
- document service
- audit engine
- correlation IDs
- event outbox
- notification foundation
- background jobs
- tenant isolation tests
- foundational migrations
