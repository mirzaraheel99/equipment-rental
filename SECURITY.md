# Security Policy

## Reporting a Vulnerability

Do not open a public GitHub issue for a suspected security vulnerability. Instead, report it
privately to the repository owner via GitHub's private vulnerability reporting
(Security tab → "Report a vulnerability") or by contacting the maintainers directly.

Please include:

- A description of the vulnerability and its potential impact
- Steps to reproduce
- Affected version/commit

We aim to acknowledge reports within 5 business days.

## Scope

This policy covers the ERMS monorepo (`apps/*`, `packages/*`, `tooling/*`, `infrastructure/*`).
It does not cover third-party services ERMS integrates with (payment gateways, ZATCA, telematics
providers) — report issues in those directly to their respective vendors.

## Supported Versions

Pre-release / Bootstrap phase — only the `main` branch (and active feature branches) is supported.
No versioned releases exist yet.

## Security Practices in This Repository

- Dependency scanning: `pnpm audit` runs in CI (`.github/workflows/ci.yml`)
- Secret scanning: gitleaks runs in CI and should be enabled as a pre-commit hook locally
- No secrets are committed — `.env` is gitignored, `.env.example` contains no real credentials
- All environment variables are validated at startup via `@erms/config` (fail-fast, no
  partially-configured process ever serves traffic)
- Structured logging (`@erms/observability`) redacts known-sensitive fields (tokens, passwords,
  card numbers) by default
- Every API error response is normalized and never leaks stack traces outside development
  (`apps/api/src/common/filters/all-exceptions.filter.ts`)
- Tenant isolation, RBAC, and audit logging are treated as foundation work (Phase 02–03 of
  `docs/09-Implementation/24-CODEX-IMPLEMENTATION-ROADMAP.md`), not later hardening

## Dependency and License Policy

See `docs/00-Foundation/DECISION-REGISTER.md` decisions #13–#15 for the secret-scanning tool,
dependency-update policy, and license allowlist.
