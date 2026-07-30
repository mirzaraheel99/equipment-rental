# Open Questions Register

**Purpose:** Consolidates every open question raised across all ERMS documents — including the ones newly written in this pass — into one place, each tagged **Blocking-for-MVP** (must be resolved before the phase that needs it can reach its Definition of Done) or **Deferred** (does not block the hybrid-strategy MVP vertical slice: Asset → Customer → Contract → Availability → Rental Operations → basic Billing). Source document is cited for each so the original context is never lost.

This register replaces the need to hunt through each document's own "Open Questions" section individually; those sections remain in place as the authoritative per-document record — this is the rollup.

---

## Blocking-for-MVP

These need a decision before the corresponding phase can be considered done, per the roadmap's own phase gates (doc 24 §4).

| # | Question | Source | Blocks |
|---|---|---|---|
| B1 | Are individual (B2C) customers supported in the first release? | Customer domain (06) §35.1 | Resolved for planning purposes — see Decision Register #21 (B2B-first); data-model support remains, UX does not |
| B2 | Which customer types are mandatory at launch? | Customer domain (06) §35.2 | Phase 06 |
| B3 | Is customer credit managed fully in ERMS or synchronized from accounting? | Customer domain (06) §35.3; Database dictionary (18) | Phase 06, Phase 15 |
| B4 | Which Saudi identity fields are mandatory per customer type? | Customer domain (06) §35.7 | Phase 06 |
| B5 | Which documents must block contract activation when missing? | Customer domain (06) §35.8; Contract domain (07) | Phase 09 |
| B6 | Mandatory MVP contract types — which of the 16 defined types ship first? | Contract domain (07) open questions | Phase 09 |
| B7 | Is a master agreement mandatory before project contracts, or can project contracts stand alone? | Contract domain (07) open questions | Phase 09 |
| B8 | Contract ceiling measured against committed vs. billed vs. forecast spend? | Contract domain (07) open questions | Phase 09 |
| B9 | E-signature provider choice, and whether wet-signature upload is acceptable at launch | Contract domain (07) open questions | Phase 09 |
| B10 | Prisma vs Drizzle | Database dictionary (18) open questions | **Resolved** — Decision Register #4 (Prisma) |
| B11 | UUID v4 vs v7 for primary keys | Database dictionary (18) open questions | Phase 01 Bootstrap (migration foundation) |
| B12 | Is row-level security (RLS) mandatory for tenant isolation at launch, or is application-layer scoping sufficient for MVP? | Database dictionary (18) open questions | Phase 02 Platform Core |
| B13 | Operators (equipment-with-operator contracts) modeled as employees, vendors, or both? | Database dictionary (18) open questions; Contract domain (07) | Phase 09 (wet-hire contract types) |
| B14 | Confirmed sync-latency target for asset status and availability search (SRS placeholder: 5 seconds) | SRS REQ-NFR-001; Asset Registry (05) §18; Rental Operations (11) §13 | Phase 05, Phase 10 |
| B15 | Default post-return cooldown/buffer duration | SRS §8; Rental Operations (11) §16.2 | Phase 11 |
| B16 | Default PPM lookahead window | SRS §8; Maintenance/PPM (13) §15.1 | Phase 13 |
| B17 | Which GCC-specific certification bodies are structured reference data? | Asset Registry (05) §21.4; Maintenance/PPM (13) §15.2 | Phase 05, Phase 13 |
| B18 | Confirmed accounting-software integration platform and approach (API vs. file export) | SRS REQ-INT-002; SRS-RECONCILIATION.md §2.7 | Phase 15, Phase 18 |
| B19 | Confirmed payment gateway(s) actually contracted (Moyasar/HyperPay/PayTabs/Stripe) | SRS REQ-INT-003; Assumptions Register A6 | Phase 15, Phase 18 |
| B20 | Product Strategy, Product Scope, and Product Module Map documents do not exist yet, even though the Customer domain doc (06) lists them as dependencies | Gap identified during this planning pass | Formally blocks nothing in the hybrid path (working assumption: CLAUDE.md + market research doc serve as informal substitutes), but should be written before Phase 00 is considered closed |

## Deferred (not blocking the MVP vertical slice)

| # | Question | Source |
|---|---|---|
| D1 | Are parent-level credit guarantees required? | Customer domain (06) §35.4 |
| D2 | Is project-level credit control required? | Customer domain (06) §35.6 |
| D3 | Is sanctions/adverse-party screening required? | Customer domain (06) §35.9 |
| D4 | Can customer portal administrators self-provision other users? | Customer domain (06) §35.10 |
| D5 | Is customer hierarchy required across multiple countries? | Customer domain (06) §35.11 |
| D6 | Can one contact represent multiple customer entities? | Customer domain (06) §35.12 |
| D7 | What approval is required to blacklist or merge a customer? | Customer domain (06) §35.13 |
| D8 | Are WhatsApp notifications required at launch? | Customer domain (06) §35.14 |
| D9 | Is customer profitability visible to sales users, or only management/finance? | Customer domain (06) §35.15 |
| D10 | Standby/downtime rate standardization across contract types | Contract domain (07) open questions |
| D11 | Multi-entity/multi-project single contract support | Contract domain (07) open questions |
| D12 | Rental-to-own as a future contract type | Contract domain (07) open questions |
| D13 | Full pricing negotiation workflow and margin/floor governance | Pricing (08) §9 |
| D14 | Standby/overtime/overage/transport/operator charge rate structures | Pricing (08) §9 |
| D15 | Multi-currency FX settlement | Pricing (08) §9 |
| D16 | Discount-approval routing thresholds | Pricing (08) §9 |
| D17 | Pricing Simulator tooling | Pricing (08) §9 |
| D18 | Full workshop board / technician scheduling UX | Maintenance/PPM (13) §9 |
| D19 | Labor/parts costing and warranty-claim financial reconciliation | Maintenance/PPM (13) §9 |
| D20 | Spare-parts reorder automation | Maintenance/PPM (13) §9 (depends on not-yet-written Inventory domain) |
| D21 | Predictive/AI-assisted maintenance scheduling | Maintenance/PPM (13) §9; Roadmap (24) §34 "may be deferred" list |
| D22 | Sales module: cross-sell, POS, consumables inventory deduction | SRS §4.3; SRS-RECONCILIATION.md §2.3 |
| D23 | Customer breakdown self-service portal | SRS REQ-SV-003; belongs to Customer Portal, roadmap Phase 17 |
| D24 | Full mobile technician/driver PWA as a separate app | Decision Register #18 |
| D25 | Dedicated per-tenant databases vs. shared schema with tenant_id | Database dictionary (18) open questions |
| D26 | Cross-subsidiary shared projects / cross-legal-entity consolidated billing | Database dictionary (18) open questions |
| D27 | Route Registry (doc 22) and API Registry (doc 19) — referenced as "next document" by two existing docs but not yet written | Database dictionary (18); Screen registry (20) |

---

## Maintenance of This Register

- When a Blocking item is resolved, move its row to the relevant domain doc's Decision History table and mark it **Resolved** here with a pointer.
- When a Deferred item becomes relevant (its phase is about to start), promote it to Blocking rather than letting a phase start with an unresolved question silently.
- Do not delete rows — this register is the audit trail of what was unknown and when it was resolved.
