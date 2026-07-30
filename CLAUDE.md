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
3. Relevant numbered domain, data, API, UX, and implementation documents

## Source-of-truth rules

- Use written specifications as the source of truth.
- Do not invent requirements, tables, endpoints, routes, permissions, or workflows.
- Enforce tenant isolation, RBAC, validation, and audit logging in backend code.
- Do not duplicate pricing, finance, asset-status, or lifecycle logic.
- Signed contracts and posted financial history are immutable; changes use governed correction records.
- Update documentation, OpenAPI, database dictionary, permissions, events, tests, and changelog with implementation changes.
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
- Arabic and English with RTL support
- ZATCA-ready finance architecture

## Development rule

Before modifying a module, read its domain specification plus the related database, API, screen, UI, and implementation documents.
