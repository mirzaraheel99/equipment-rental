# Assumptions Register

**Purpose:** Records assumptions made during planning and initial domain-doc authoring that were not explicitly confirmed by a source document, but were necessary to proceed under the user-approved hybrid strategy. Distinct from `DECISION-REGISTER.md` (concrete tooling/process choices) and `OPEN-QUESTIONS-REGISTER.md` (things still genuinely unresolved) — this register is for working assumptions adopted so drafting could proceed, each flagged for later confirmation.

---

## Scope and Strategy Assumptions

| # | Assumption | Basis | Confirmation Needed From |
|---|---|---|---|
| A1 | Build strategy is hybrid: lock low-risk decisions now, build vertically, write domain docs just-in-time | Explicit user approval, 2026-07-30 | Already confirmed |
| A2 | The uploaded SRS is merged as source input, with US-centric details translated to GCC equivalents | Explicit user approval, 2026-07-30 | Already confirmed |
| A3 | Near-term scope is B2B/corporate-first; "Individual" customer type stays in the data model but gets no dedicated consumer UX yet | Explicit user approval, 2026-07-30 | Already confirmed |
| A4 | "Live link" in the near term means the GitHub source repository/branch, not a deployed running application — deploying requires a hosting decision and account access the user has not yet provided | Inferred from environment constraints (no hosting credentials available in this session) and CLAUDE.md's silence on a specific hosting target | User, before Stage 2 completion — needs to say whether/where they want an actual deployed preview |

## Domain-Content Assumptions (carried into the new domain docs)

| # | Assumption | Basis | Confirmation Needed From |
|---|---|---|---|
| A5 | Base currency is SAR; the pricing calculation engine is built currency-agnostic so other GCC currencies can be added later without rework | CLAUDE.md's "Saudi-first and GCC-ready" architecture direction | Business stakeholder — confirm SAR-only vs. multi-currency-from-day-one |
| A6 | Payment gateway integration is a pluggable adapter interface (Moyasar/HyperPay/PayTabs/Stripe candidates), not a single hardcoded provider | Roadmap's Phase 18 rule that "provider-specific code remains behind interfaces"; SRS named only Stripe | Business stakeholder — confirm which gateway(s) are actually contracted |
| A7 | Compliance certificate "issuing body" is modeled as GCC-relevant reference data, not hardcoded to OSHA (the SRS's US-centric example) | GCC-first architecture direction | Compliance/legal stakeholder — confirm the actual applicable certifying bodies for Saudi lifting/safety equipment |
| A8 | Depreciation *policy* (method, useful life defaults) belongs to Finance, not Asset Registry; Asset Registry only stores the inputs | CLAUDE.md's "do not duplicate pricing, finance, asset-status, or lifecycle logic" rule | Finance domain owner, once a Finance/Billing domain doc is written |
| A9 | Rate-card override inheritance for pricing is project > customer > category-default | Reconciles the Customer domain doc's unresolved "inheritance priority must be explicit" note (doc 06 §13) for the pricing dimension specifically | Business stakeholder — the Customer doc's broader payment-terms inheritance question remains separately open |
| A10 | "Off-hire" (used in the UX/DB docs) and "Return/Termination" (used in the Contract domain doc) refer to the same real-world event | Cross-document terminology check performed during planning; no document explicitly states they differ | Product owner — low-risk assumption, but should be confirmed once and recorded in `GLOSSARY.md` rather than re-litigated per module |
| A11 | Sales/POS, cross-sell, and consumables-inventory-deduction requirements from the SRS are deferred, not built into any MVP-path domain doc | Matches the roadmap's own Recommended MVP Boundary (doc 24 §34), which does not include a Sales module | Product owner — confirm Sales module timing when the team reaches it |

## How to Resolve an Assumption

When a stakeholder confirms or corrects an assumption above: move it to the relevant domain doc's "Decision History" table with the confirming decision, and mark it **Resolved** here with a pointer to that entry — do not delete the row, to preserve the audit trail of what was assumed and when.
