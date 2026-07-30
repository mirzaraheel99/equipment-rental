# Claude Code Instructions — ERMS

## Project root

Open Claude Code from the repository root after cloning:

```powershell
cd C:\Projects\equipment-rental
claude .
```

## Required reading order

1. `README.md`
2. `docs/README.md`
3. `docs/ERMS-COMPLETE-DOCUMENTATION-BUNDLE.md`
4. Relevant numbered domain, data, API, UX, functional-specification, implementation-pack, and engineering-standard documents

## Source-of-truth rules

- Use written specifications as the source of truth.
- Do not invent requirements, tables, endpoints, routes, permissions, events, state transitions, or workflows.
- Enforce tenant isolation, RBAC, validation, and audit logging in backend code.
- Do not duplicate pricing, finance, asset-status, or lifecycle logic.
- Signed contracts and posted financial history are immutable; changes use governed correction records.
- Update documentation, OpenAPI, database dictionary, permissions, events, tests, and changelog with approved implementation changes.
- Surface missing or conflicting requirements instead of silently guessing.

## Architecture direction

- Saudi-first and GCC-ready
- Multi-tenant enterprise SaaS
- Modular monolith initially
- Next.js frontend
- NestJS backend
- PostgreSQL
- Redis
- S3-compatible object storage
- API-first
- Event-driven
- Arabic and English with RTL support
- ZATCA-ready finance architecture
- Enterprise RBAC
- Full auditability

## Required engineering controls

Every implementation must preserve:

- Tenant isolation
- RBAC at API and service layers
- Request and business validation
- Secure error handling
- Correlation IDs
- Audit logging
- Event publication where specified
- OpenAPI documentation
- Automated tests
- No secrets in source control

## Recommended implementation order

1. Repository bootstrap
2. Identity, tenant, RBAC, audit, and configuration foundations
3. Customer Management
4. Asset Registry
5. CRM and Quotation
6. Pricing Engine
7. Contract Management
8. Rental Operations
9. Maintenance and Workshop
10. Dispatch and Logistics
11. Inventory and Warehouse
12. Finance and Billing
13. Reporting and Analytics
14. Customer Portal
15. AI Copilot

## Development rule

Before modifying a module, read its domain specification plus the related database, API, route, screen, UI, functional-specification, implementation-pack, and engineering-standard documents.

## Working rules

- Inspect existing code before creating or replacing files.
- Implement one coherent module or vertical slice at a time.
- Keep controllers thin.
- Keep business logic in services or domain layers.
- Keep persistence logic in repositories.
- Generate tests with every implementation.
- Do not bypass failing tests, security controls, or review requirements.
- Ask for clarification when documentation conflicts or is incomplete.

## Pull request expectations

Every pull request must include:

- Scope summary
- Documentation references
- Files changed
- Tests added and results
- Security and tenancy considerations
- Known limitations

Use Conventional Commits and do not commit directly to protected branches.