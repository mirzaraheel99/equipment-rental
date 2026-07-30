# Master Index

Full inventory of ERMS documentation: what exists, its status, and what is still a known gap. This is the single place to check "does a doc for X exist" before writing a new one — per CLAUDE.md's "do not invent requirements" and the roadmap's "never create a new ... without updating its registry" rules.

Status legend: **Working Draft** = content exists, not yet business-approved. **Gap** = referenced as a dependency somewhere but not yet written.

---

## 00 — Foundation (Phase-00-lite governance)

| Doc | Status |
|---|---|
| `00-Foundation/MASTER-INDEX.md` | Working Draft (this file) |
| `00-Foundation/DECISION-REGISTER.md` | Working Draft |
| `00-Foundation/ASSUMPTIONS-REGISTER.md` | Working Draft |
| `00-Foundation/OPEN-QUESTIONS-REGISTER.md` | Working Draft |
| `00-Foundation/GLOSSARY.md` | Working Draft |
| `00-Foundation/SRS-RECONCILIATION.md` | Working Draft |
| `00-Foundation/CHANGELOG.md` | Working Draft |
| Product Strategy | **Gap** — referenced as a dependency by the Customer domain doc (06); not yet written. Tracked as Open Question B20. |
| Product Scope | **Gap** — same as above |
| Product Module Map | **Gap** — same as above |
| Requirements Traceability Matrix | **Gap** — partially substituted by `SRS-RECONCILIATION.md` (SRS requirements only) and `OPEN-QUESTIONS-REGISTER.md` (question tracking); a full matrix mapping every requirement across every document to its implementing phase is not yet built |

## 01 — Market Research

| Doc | Status |
|---|---|
| `01-Market-Research/01-SAUDI-EQUIPMENT-RENTAL-MARKET-AND-COMPETITIVE-ANALYSIS.md` | Working Draft |

## 04 — Domain

| Doc | Status |
|---|---|
| `04-Domain/05-ASSET-REGISTRY-DOMAIN-SPECIFICATION.md` | Working Draft — **new in this pass** |
| `04-Domain/06-CUSTOMER-AND-CORPORATE-ACCOUNT-DOMAIN-SPECIFICATION.md` | Working Draft |
| `04-Domain/07-CONTRACT-MANAGEMENT-DOMAIN-SPECIFICATION.md` | Working Draft |
| `04-Domain/08-PRICING-DOMAIN-SPECIFICATION.md` | Working Draft, Lite pass — **new in this pass** |
| `04-Domain/11-RENTAL-OPERATIONS-DOMAIN-SPECIFICATION.md` | Working Draft — **new in this pass** |
| `04-Domain/13-MAINTENANCE-PPM-DOMAIN-SPECIFICATION.md` | Working Draft, Lite pass — **new in this pass** |
| Project/Jobsite Domain | **Gap** — referenced as a dependency by the new Pricing doc; not yet written |
| Dispatch/Logistics Domain | **Gap** |
| Inventory/Warehouse Domain | **Gap** — referenced as a dependency by Maintenance/PPM (parts) |
| Finance/Billing Domain | **Gap** — referenced by multiple new docs (accounting integration, payment gateway, warranty billing, cycle-billing invoice generation); highest-priority remaining gap once Pricing/Contract are in active build |
| Sales/POS Domain | **Gap**, deliberately deferred — see SRS-RECONCILIATION.md §2.3 and Decision Register #21 |
| Customer Portal Domain | **Gap** |
| Reporting/Command Centers Domain | **Gap** |

## 06 — Data

| Doc | Status |
|---|---|
| `06-Data/18-ENTERPRISE-DATABASE-DICTIONARY.md` | Working Draft |
| API Registry and Contract Standards (doc "19") | **Gap** — referenced by doc 18 as "next document" |

## 08 — UX

| Doc | Status |
|---|---|
| `08-UX/20-SCREEN-INVENTORY-AND-NAVIGATION-REGISTRY.md` | Working Draft |
| `08-UX/21-UI-DESIGN-SYSTEM-AND-INTERACTION-STANDARDS.md` | Working Draft |
| Detailed Route Registry & Page Contracts (doc "22") | **Gap** — referenced by doc 20 as "next document" |

## 09 — Implementation

| Doc | Status |
|---|---|
| `09-Implementation/24-CODEX-IMPLEMENTATION-ROADMAP.md` | Working Draft |
| `09-Implementation/25-IMPLEMENTATION-PACK-01-PROJECT-BOOTSTRAP.md` | Working Draft — Implementation Guidance, Coding Not Yet Authorized until Stage 2 go-ahead |
| Implementation Pack 02: Platform Core (doc "26") | **Gap** — the next pack per doc 25 §34, not started |

## 10 — References

| Doc | Status |
|---|---|
| `10-References/ERMS-REFERENCES.md` | Working Draft |

---

## Document Numbering Convention

Document filenames carry a flat sequential number reflecting authorship order across the whole repository (not a per-folder number). Where a new domain doc's subject matches a named roadmap phase, its number has been aligned to that phase number for mnemonic consistency going forward (Decision Register #22) — this does not apply retroactively to docs 06/07, which predate the convention.

## Known Gaps Not Addressed in This Pass

Per the user-approved hybrid strategy, the following remain intentionally unwritten until their corresponding build phase is reached, rather than being drafted speculatively now:

- Product Strategy / Product Scope / Product Module Map
- Project/Jobsite, Dispatch, Inventory, Finance/Billing, Sales/POS, Customer Portal, Reporting domain specs
- API Registry, Route Registry
- Requirements Traceability Matrix (full, cross-document version)
- Implementation Pack 02 onward

Each is tracked either in this index or in `OPEN-QUESTIONS-REGISTER.md` so it is never silently forgotten.
