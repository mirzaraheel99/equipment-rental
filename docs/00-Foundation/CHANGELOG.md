# Changelog

All notable documentation and planning changes to the ERMS repository. This repository has no application code yet — entries below are documentation-only until noted otherwise.

## [Unreleased]

### Added — 2026-07-30

- `docs/00-Foundation/` — new Phase-00-lite governance set:
  - `MASTER-INDEX.md` — full document inventory and status
  - `DECISION-REGISTER.md` — the 18 Bootstrap technical decisions (Implementation Pack 01 §33) plus 4 cross-cutting planning decisions, each with rationale
  - `ASSUMPTIONS-REGISTER.md` — 11 working assumptions adopted to unblock drafting, each flagged for later confirmation
  - `OPEN-QUESTIONS-REGISTER.md` — rollup of ~50 open questions across all existing and new documents, tagged Blocking-for-MVP or Deferred
  - `GLOSSARY.md` — resolves naming drift found between documents (e.g. "off-hire" vs "Return/Termination", "Guarantor Entity" vs "Guarantor")
  - `SRS-RECONCILIATION.md` — requirement-by-requirement mapping of the user-supplied SRS (`ERMS_SRS_1.docx`) into this repository's structure
  - `CHANGELOG.md` — this file
- `docs/04-Domain/05-ASSET-REGISTRY-DOMAIN-SPECIFICATION.md` — new domain spec, filling a gap referenced (but never written) as a dependency by the existing Customer and Contract domain docs. Seeded from SRS §4.1.
- `docs/04-Domain/08-PRICING-DOMAIN-SPECIFICATION.md` — new domain spec (lite pass — see its §9 for explicit deferrals). Seeded from SRS §4.2/§4.6.
- `docs/04-Domain/11-RENTAL-OPERATIONS-DOMAIN-SPECIFICATION.md` — new domain spec. Seeded from SRS §4.2.
- `docs/04-Domain/13-MAINTENANCE-PPM-DOMAIN-SPECIFICATION.md` — new domain spec (lite pass — see its §9 for explicit deferrals). Seeded from SRS §4.4/§4.5.

### Notes

- No application code was added in this change set. Per the roadmap's own gating (`docs/09-Implementation/24-CODEX-IMPLEMENTATION-ROADMAP.md`, `25-IMPLEMENTATION-PACK-01-PROJECT-BOOTSTRAP.md`), Phase 01 Project Bootstrap (the first actual code) requires a separate, explicit go-ahead — tracked as "Stage 2" in the approved planning session that produced this change set.
- Sales/POS module requirements from the SRS were deliberately **not** merged into any domain doc in this pass — see `SRS-RECONCILIATION.md` §2.3 and `OPEN-QUESTIONS-REGISTER.md` D22. This matches the roadmap's own Recommended MVP Boundary, which does not include a Sales module, and the user-approved B2B-first scope decision.
