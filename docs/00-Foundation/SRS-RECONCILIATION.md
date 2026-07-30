# SRS Reconciliation

**Purpose:** The user supplied `ERMS_SRS_1.docx` — an IEEE-830-style SRS (Draft v1.0, dated 25 Jul 2026) written earlier and independently of the GCC-focused documents already in this repository. Per the user's explicit instruction, it has been **merged as source input**: every requirement (REQ-ID) below is mapped to where it landed, with USD→SAR, Stripe-only→pluggable GCC payment adapters, and OSHA→GCC-relevant certification-body translations applied where the original text was US-centric.

This document is the audit trail for that merge. It does not restate requirements already covered in full elsewhere — see the target document for the authoritative text.

---

## 1. Reconciliation Principles Applied

1. **Currency:** every `$` figure in the SRS (e.g. "$50,000 replacement value") is treated as an illustrative example only. All monetary fields in the merged docs are SAR-based and currency-agnostic in the calculation engine (see `08-PRICING-DOMAIN-SPECIFICATION.md` §3.1).
2. **Payment gateway:** SRS REQ-INT-003 named Stripe exclusively. Merged as a pluggable payment-gateway adapter interface (per the roadmap's Phase 18 Integrations rule that "provider-specific code remains behind interfaces") covering Saudi-relevant providers (e.g. Moyasar, HyperPay, PayTabs) plus Stripe, rather than a single hardcoded provider.
3. **Certifications:** SRS referenced OSHA (a US regulatory body) for lifting/safety certificates. Merged as a generic "GCC-relevant certification body" reference-data concept — the specific bodies are an open question (see `OPEN-QUESTIONS-REGISTER.md`), not hardcoded to OSHA.
4. **Golden Rule / single-asset-status model:** preserved verbatim as the architectural core of the new Asset Registry domain doc — it did not conflict with anything already in the repo; it filled a gap (no Asset Registry domain doc existed).
5. **Where the SRS conflicts with an already-approved-in-spirit GCC document** (e.g. its accounting-integration assumption vs. the existing docs' ZATCA-first finance direction), the GCC document's direction wins, and the SRS requirement is marked "Reconciled — GCC direction prevails" below.
6. **Where the SRS is simply less detailed** than an existing doc (e.g. its Customer Master field list vs. the full Customer & Corporate Account domain spec), the existing doc's greater detail is retained and the SRS entry is marked "Superseded by existing doc."

---

## 2. Requirement-by-Requirement Mapping

### 2.1 Asset Registry (SRS §4.1)

| SRS REQ-ID | Disposition | Landed In |
|---|---|---|
| REQ-AR-001 Unique Asset Identity | Merged verbatim | `05-ASSET-REGISTRY-DOMAIN-SPECIFICATION.md` §5 |
| REQ-AR-002 Single Authoritative Status (Golden Rule) | Merged verbatim, elevated to Core Domain Principle | `05-ASSET-REGISTRY-DOMAIN-SPECIFICATION.md` §2 |
| REQ-AR-003 Cross-Module Status Write Lock | Merged, expanded with concurrency test requirements | `05-ASSET-REGISTRY-DOMAIN-SPECIFICATION.md` §12 |
| REQ-AR-004 Status Change Audit Trail | Merged, aligned to existing audit-entry field conventions from doc 06 | `05-ASSET-REGISTRY-DOMAIN-SPECIFICATION.md` §11 |
| REQ-AR-005 Asset 360° View | Merged, cross-referenced to existing UX-100 series screens | `05-ASSET-REGISTRY-DOMAIN-SPECIFICATION.md` §14 |
| REQ-AR-006 Disposal/Decommission Trigger | Merged verbatim | `05-ASSET-REGISTRY-DOMAIN-SPECIFICATION.md` §15 |

### 2.2 Rental Module (SRS §4.2)

| SRS REQ-ID | Disposition | Landed In |
|---|---|---|
| REQ-RM-001 Real-Time Availability Calendar | Merged | `11-RENTAL-OPERATIONS-DOMAIN-SPECIFICATION.md` §5 |
| REQ-RM-002 Flexible Billing Tiers | Merged, worked example preserved | `08-PRICING-DOMAIN-SPECIFICATION.md` §5 |
| REQ-RM-003 Digital Check-Out Checklist | Merged verbatim | `11-RENTAL-OPERATIONS-DOMAIN-SPECIFICATION.md` §6 |
| REQ-RM-004 Digital Check-In with Damage Comparison | Merged verbatim — most directly reusable requirement in the whole SRS | `11-RENTAL-OPERATIONS-DOMAIN-SPECIFICATION.md` §8 |
| REQ-RM-005 Automatic Cooldown Buffer | Merged, default value flagged open (SRS's own "24 hours" is illustrative, not confirmed) | `11-RENTAL-OPERATIONS-DOMAIN-SPECIFICATION.md` §9 |
| REQ-RM-006 Double-Booking Prevention | Merged verbatim | `11-RENTAL-OPERATIONS-DOMAIN-SPECIFICATION.md` §5 |
| REQ-RM-007 Overdue/Late Return Tracking | Merged, fee calculation delegated to Pricing per no-duplication rule | `11-RENTAL-OPERATIONS-DOMAIN-SPECIFICATION.md` §7 |

### 2.3 Sales Module (SRS §4.3)

| SRS REQ-ID | Disposition | Landed In |
|---|---|---|
| REQ-SM-001 Asset Disposition Workflow | Partially merged (book-value trigger only) | `05-ASSET-REGISTRY-DOMAIN-SPECIFICATION.md` §15 — full Sales/POS/disposition domain **not** written in this pass; deferred, matches roadmap's own MVP boundary which does not list a Sales module |
| REQ-SM-002 Cross-Sell on Active Contracts | Deferred, not merged into any doc yet | Tracked in `OPEN-QUESTIONS-REGISTER.md` as Deferred |
| REQ-SM-003 POS Payment Processing | Deferred | Tracked in `OPEN-QUESTIONS-REGISTER.md` as Deferred |
| REQ-SM-004 Automated Invoice Generation | Reconciled — GCC direction prevails; the existing Finance/Billing direction (ZATCA-ready, doc 24 Phase 15) supersedes a generic "automated invoice" requirement | Not written yet; belongs to a future Finance/Billing domain doc, out of this pass's scope |
| REQ-SM-005 Consumables Inventory Deduction | Deferred, depends on not-yet-written Inventory domain | Tracked in `OPEN-QUESTIONS-REGISTER.md` as Deferred |

### 2.4 Services Module (SRS §4.4)

| SRS REQ-ID | Disposition | Landed In |
|---|---|---|
| REQ-SV-001 Field Service Ticket Creation | Merged | `13-MAINTENANCE-PPM-DOMAIN-SPECIFICATION.md` §4 |
| REQ-SV-002 Mobile Technician Portal | Deferred to deeper pass (UX only, no domain-logic conflict) | `13-MAINTENANCE-PPM-DOMAIN-SPECIFICATION.md` §9 (listed as deferred) |
| REQ-SV-003 Customer Breakdown Portal | Deferred, belongs to Customer Portal (roadmap Phase 17) | Tracked in `OPEN-QUESTIONS-REGISTER.md` as Deferred |
| REQ-SV-004 Warranty Validation | Merged (flag only; billing exclusion mechanics deferred to Finance) | `13-MAINTENANCE-PPM-DOMAIN-SPECIFICATION.md` §4 |
| REQ-SV-005 Spare Parts Reorder Trigger | Deferred, depends on not-yet-written Inventory domain | `13-MAINTENANCE-PPM-DOMAIN-SPECIFICATION.md` §9 (listed as deferred) |
| REQ-SV-006 Service History Linkage | Merged verbatim | `13-MAINTENANCE-PPM-DOMAIN-SPECIFICATION.md` §4 |

### 2.5 PPM (SRS §4.5)

| SRS REQ-ID | Disposition | Landed In |
|---|---|---|
| REQ-PM-001 Dual-Trigger Scheduling | Merged verbatim — most directly reusable PPM requirement | `13-MAINTENANCE-PPM-DOMAIN-SPECIFICATION.md` §5 |
| REQ-PM-002 Auto-Lock Rental Availability | Merged, re-architected to go through the Asset Registry's controlled transition service rather than a separate flag | `13-MAINTENANCE-PPM-DOMAIN-SPECIFICATION.md` §6 |
| REQ-PM-003 Compliance Certificate Storage | Merged, OSHA reference generalized to GCC-relevant bodies (open question) | `13-MAINTENANCE-PPM-DOMAIN-SPECIFICATION.md` §7 |
| REQ-PM-004 Auto-Attach Certificates to Contracts | Merged, split: certificate query owned by Maintenance/PPM, Check-Out block enforced by Contract Management (no-duplication rule) | `13-MAINTENANCE-PPM-DOMAIN-SPECIFICATION.md` §7; existing `07-CONTRACT-MANAGEMENT-DOMAIN-SPECIFICATION.md` |
| REQ-PM-005 PPM Overdue Escalation | Merged verbatim | `13-MAINTENANCE-PPM-DOMAIN-SPECIFICATION.md` §5 |
| REQ-PM-006 Telematics Data Ingestion | Merged, split: raw ingestion owned by Asset Registry, threshold evaluation owned by Maintenance/PPM | `05-ASSET-REGISTRY-DOMAIN-SPECIFICATION.md` §9; `13-MAINTENANCE-PPM-DOMAIN-SPECIFICATION.md` §8 |

### 2.6 Contract Management (SRS §4.6)

All 15 SRS contract requirements (REQ-CM-001 through REQ-CM-015) are **superseded by the existing, far more detailed** `07-CONTRACT-MANAGEMENT-DOMAIN-SPECIFICATION.md`, which already covers unique contract IDs, term locking on signature, check-out gating, amendments, category-based liability clauses, downstream transaction linkage, multi-asset contracts, payment-terms enforcement, dynamic deposits (now delegated to Pricing, doc 08 §7), cycle billing (doc 08 §6), reconciliation statements, and COI/LDW/insurance rules in significantly greater depth. No changes made to doc 07; cross-references added from the new docs pointing into it instead of duplicating it.

### 2.7 Integration Requirements (SRS §6)

| SRS REQ-ID | Disposition |
|---|---|
| REQ-INT-001 Telematics Integration | Merged into Asset Registry (doc 05 §9) and Maintenance/PPM (doc 13 §8) |
| REQ-INT-002 Accounting Software Integration | Reconciled — GCC direction prevails (ZATCA-ready finance architecture per CLAUDE.md takes priority over a generic accounting-export requirement); not written into any doc in this pass, belongs to a future Finance/Billing domain doc |
| REQ-INT-003 Payment Gateway (Stripe) | Reconciled — generalized to a pluggable GCC-ready payment-adapter interface per §1.2 above; not yet written into a domain doc (belongs to a future Finance/Billing domain doc), but the "no hardcoded single provider" principle is recorded here for that future doc to follow |

### 2.8 Non-Functional Requirements (SRS §7) and Open Assumptions (SRS §8)

All SRS non-functional targets (uptime %, sync latency, retention period) are explicitly carried forward as **unconfirmed placeholders**, not business-approved SLAs, into the corresponding new domain docs' Non-Functional Requirements sections and into `OPEN-QUESTIONS-REGISTER.md`. The SRS's own §8 "Open Assumptions Requiring Stakeholder Sign-Off" items are folded into that same register rather than tracked in a second, separate list.

### 2.9 Master Data (SRS §5.2)

The SRS's proposed master-data field lists (Asset, Model, Manufacturer, Location, City, Region, Technician, Salesman, Lead Source, Customer, Vendor, Service, Payment Type, Complaints, PDI Status masters) are **superseded by the existing Enterprise Database Dictionary** (`docs/06-Data/18-ENTERPRISE-DATABASE-DICTIONARY.md`), which already models most of these tables with a fuller, tenant-scoped field set. Two SRS-proposed masters have no equivalent yet in the dictionary and are flagged as gaps: **Lead Source Master** and **Salesmen Master** (both Sales-module-adjacent, consistent with the Sales domain being out of scope for this pass).

---

## 3. Net Effect

- 4 new domain documents created, directly filling gaps the SRS's structure happened to match closely (Asset Registry, Rental Operations, Maintenance/PPM, and — indirectly, via the Pricing tables the SRS's billing-tier requirement needed — the Pricing lite doc).
- 0 changes made to the existing Customer and Contract domain docs — they were already more detailed than the SRS in their overlapping areas.
- Sales/POS module requirements are explicitly deferred, not merged, consistent with the roadmap's own MVP boundary (which does not include a Sales module) and the user-approved B2B-first scope decision.
- Every currency, payment-gateway, and certification-body reference from the SRS was generalized away from its US-centric original, not carried forward literally.
