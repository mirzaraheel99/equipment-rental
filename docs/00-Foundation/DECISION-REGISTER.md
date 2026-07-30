# Decision Register

**Purpose:** Formal record of decisions made against the "Open Decisions Before Execution" list in `docs/09-Implementation/25-IMPLEMENTATION-PACK-01-PROJECT-BOOTSTRAP.md` §33, plus other cross-cutting decisions made during planning. Each entry is dated, gives the decision, the rationale, and the alternative(s) considered. This register is append-only — a changed decision gets a new row referencing the old one, not an edit in place, consistent with the audit-trail conventions used throughout this repository.

---

## Bootstrap Technical Decisions (Implementation Pack 01 §33)

| # | Decision Area | Decision | Rationale | Alternative Considered |
|---|---|---|---|---|
| 1 | Node.js version | **22 LTS**, pinned via `.nvmrc`, `.node-version`, and `package.json` engines | Doc 25's own recommendation; actively maintained LTS at time of writing | Node 24 (also LTS by mid-2026) — deferred; no concrete need to move off 22 yet, revisit at Phase 20 hardening |
| 2 | pnpm version | Latest stable pnpm 9.x, pinned via `corepack` | Doc 25's own recommendation; strong workspace support for a large TS monorepo | npm/yarn workspaces — rejected, weaker monorepo ergonomics |
| 3 | Monorepo orchestration | **Turborepo**, confirmed | Doc 25's own recommendation; simple build graph, good Next.js/TS compatibility | Nx — rejected as higher overhead than justified at this stage |
| 4 | ORM | **Prisma** | Stronger migration-diffing and schema-review ergonomics for a team following the roadmap's strict "migration reviewed / constraints present / indexes reviewed" data gate (doc 24 §4.3); mature NestJS integration | Drizzle — lower-level, faster raw queries, but weaker migration-review tooling for this team's process |
| 5 | Test runner | **Vitest** for packages/web/worker; **Jest** for `apps/api` only | Doc 25 explicitly allows "Jest only where NestJS tooling requires it"; Nest's official testing module and e2e tooling are most stable on Jest | Vitest everywhere — rejected for `apps/api` specifically due to weaker Nest e2e-testing-module support as of this decision date |
| 6 | UI primitive foundation | **Radix UI primitives + Tailwind** (shadcn/ui pattern) | Headless, accessible-by-default, RTL-friendly, matches doc 25 §17's per-component accessibility/RTL/story requirements | A closed component library (e.g. MUI) — rejected, harder to fully theme for bilingual RTL/LTR and tenant branding (doc 21) |
| 7 | Icon library | **Lucide** | Tree-shakeable, wide coverage, pairs naturally with the shadcn/Radix pattern | Heroicons — comparable, no material advantage found; Lucide chosen for broader icon coverage |
| 8 | Storybook location | `apps/storybook`, consuming `packages/ui` | Matches doc 25 §5 target tree | Storybook inside `packages/ui` itself — rejected, keeps the UI package a pure library without a dev-server dependency |
| 9 | Next.js version | Latest stable (App Router) | Doc 25's own recommendation | — |
| 10 | NestJS version | Latest stable | Doc 25's own recommendation | — |
| 11 | Tailwind version | Latest stable v4 | Greenfield project; v4's CSS-based config reduces boilerplate | Tailwind v3 — rejected, no reason to start on the older major version for a new build |
| 12 | Local object storage | **MinIO** | Doc 25's own recommendation, S3-compatible, matches CLAUDE.md's S3-compatible object storage architecture direction | — |
| 13 | Secret-scanning tool | **gitleaks** in pre-commit + CI, plus GitHub's native secret scanning | Doc 25 §26 requires secret scanning; gitleaks is lightweight and CI-friendly | TruffleHog — comparable; gitleaks chosen for simpler CI integration |
| 14 | Dependency-update policy | **Dependabot**, weekly, minor/patch auto-grouped, major requires review | Standard, native to GitHub (matches the repo's GitHub hosting), matches doc 25 §26's "restricted production scripts / dependency-update policy" requirement | Renovate — comparable; Dependabot chosen for native GitHub integration with no extra service |
| 15 | License allowlist | MIT / Apache-2.0 / BSD / ISC allowed; copyleft (GPL/AGPL) requires explicit review | Standard SaaS-safe allowlist; avoids copyleft obligations in a commercial multi-tenant product | — |
| 16 | Supported developer OS | macOS, Linux, Windows (WSL2 recommended) | CLAUDE.md's own quick-start instructs opening the project from a Windows path (`C:\Projects\equipment-rental`); WSL2 recommended for parity with Linux-based CI without blocking native Windows use | Linux/macOS only — rejected, conflicts with CLAUDE.md's documented Windows workflow |
| 17 | Customer portal as separate app at launch | **Yes** — `apps/customer-portal`, scaffolded empty in Bootstrap | Matches doc 25's own target repository tree; customer portal has materially different security/scope boundaries (doc 24 Phase 17) that benefit from app-level isolation from day one | Folding portal routes into `apps/web` behind auth — rejected, weaker isolation guarantee for a customer-facing, lower-trust surface |
| 18 | Mobile PWA as separate app | **No, not yet** — mobile-first workflows (driver, technician, yard, checkout/return) ship as responsive routes inside `apps/web` | Doc 25's own target repository tree (§5) omits a separate `mobile-pwa` app, even though the roadmap's high-level structure (doc 24 §3) lists one aspirationally; deferred until an offline-first requirement actually justifies the split | Separate `apps/mobile-pwa` from day one — rejected as premature per doc 25 §32.1 "Premature Dependency Growth" risk control |

---

## Other Cross-Cutting Decisions

| # | Decision Area | Decision | Rationale | Date |
|---|---|---|---|---|
| 19 | Overall build strategy | **Hybrid**: lock low-risk tooling decisions now, build one vertical slice at a time, write each module's domain doc just-in-time rather than all Phase 00 documentation upfront | User-approved; balances the user's request for visible progress against the roadmap's own "build vertically, not horizontally" rule (doc 24 §2.2) | 2026-07-30 |
| 20 | SRS handling | **Merge as source input** into the domain docs the SRS structurally overlaps with (Asset Registry, Rental Operations, Maintenance/PPM, Pricing), translating US-centric details (USD, Stripe-only, OSHA) to GCC-appropriate equivalents | User-approved; SRS contained genuinely reusable concrete requirements for domains that had no spec at all | 2026-07-30 |
| 21 | Customer scope | **B2B/corporate-first**: build corporate/project customer and contract workflows as the primary near-term target; keep "Individual" as a supported customer type in the data model, no consumer self-checkout UX yet | User-approved; matches the market research doc's segment analysis and the user's own emphasis on long-term corporate contracts | 2026-07-30 |
| 22 | Doc numbering for newly authored domain docs | Where a new domain doc's subject matches a named roadmap phase (doc 24), its filename number is aligned to that phase number for mnemonic consistency (Asset Registry=05↔Phase 05, Pricing=08↔Phase 08, Rental Operations=11↔Phase 11, Maintenance/PPM=13↔Phase 13) | Existing docs 06/07 don't follow this convention perfectly (Contract doc is numbered 07 but is Phase 09) — not retroactively renumbered to avoid breaking existing cross-references; new convention applied going forward only | 2026-07-30 |

---

## Governance Note

Per CLAUDE.md and the roadmap's "no silent assumptions" rule, every decision above is a **default proposal**, not a claim of business sign-off. Items with material commercial or legal weight (e.g. license allowlist, dependency-update policy) should be re-confirmed by the actual business/legal stakeholders before Stage 2 (Bootstrap) code is merged to a protected branch, even though they are treated as approved-for-now to unblock scaffolding.
