# 08 — Pricing Domain Specification (Lite)

**Document ID:** ERMS-DOM-004
**Version:** 0.1
**Status:** Working Draft — Lite Pass (see §9 for what is deliberately deferred)
**Primary Market:** Saudi Arabia
**Domain Owner:** Pricing Domain
**Depends On:** Asset Registry, Customer & Corporate Account, Project/Jobsite (referenced, not yet documented)
**Feeds:** Contract Management, Rental Operations, Finance

**Source Input:** Seeded from the stakeholder SRS §4.2 (REQ-RM-002 billing tiers/proration, REQ-CM-009 dynamic deposit, REQ-CM-010 cycle billing), reconciled against `07-CONTRACT-MANAGEMENT-DOMAIN-SPECIFICATION.md` §"Commercial Terms Snapshot" (which already assumes a Pricing domain exists and defers to it) and the `rate_card` / `rate_card_line` / `discount_rule` / `pricing_calculation` tables in the database dictionary (doc 18). See `docs/00-Foundation/SRS-RECONCILIATION.md`.

**Why "Lite":** Per the user-approved hybrid strategy, this document covers only what the MVP vertical slice (Contract → Availability → Rental Operations → basic Billing) requires to produce a deterministic, explainable price. It intentionally does **not** attempt full negotiation-workflow UX, margin/floor governance, or multi-currency settlement — those require a dedicated deeper pass once Contract and Rental Operations are running end to end, and are logged as deferred in §9 rather than guessed.

---

## 1. Purpose

This document defines the minimum Pricing domain required so that a Contract line item can be priced deterministically, the same way every time, given the same governed inputs — before Contract Management, Availability, and Billing depend on it, per the roadmap's own sequencing (Phase 08 precedes Phase 09).

## 2. Core Domain Principle

**Given identical governed inputs and rate-card version, the pricing engine returns identical, explainable results.**

No module recalculates or overrides a price independently. Contract Management consumes a pricing *snapshot* produced by this domain and freezes it at signature (per doc 07 §2); it never derives price itself.

## 3. Scope

### 3.1 In Scope (this lite pass)

- Rate cards scoped to category/model, customer, and project (inheritance: project override > customer override > category default)
- Billing units: Daily, Weekly, Monthly, Custom
- Automatic proration across tier boundaries
- Cycle billing interval (28/30-day) for long-term contracts
- Security deposit calculation (flat, % of replacement value, % of contract value)
- LDW fee calculation methods (flat, % of rental charge, % of replacement value) — the *calculation*, not the insurance-eligibility decision, which stays with Contract Management (doc 07 §17–18)
- Late-fee calculation off the applicable rate card
- Multi-asset contract aggregate pricing
- Currency: SAR as base currency, with the calculation engine designed currency-agnostic (no hardcoded `$`) so additional GCC currencies can be added as country adapters, per CLAUDE.md's GCC-ready direction
- Pricing snapshot persisted at contract signature (immutable, per doc 07 §2)

### 3.2 Out of Scope (deferred — see §9)

- Interactive negotiation workflow / quote-to-contract redlining UX
- Margin and price-floor governance, approval routing for below-floor overrides
- Standby/overtime/overage rate structures beyond the basic late-fee case
- Operator/transport/mobilization charge schedules
- Multi-currency settlement and FX
- Discount-approval workflow (a `discount_rule` table exists in the database dictionary; the approval routing that consumes it is deferred)
- Pricing simulation tooling (UX doc references a "Pricing Simulator" screen — deferred until this engine exists)

## 4. Rate Cards

- A rate card is a versioned set of rate lines scoped to a category or specific model, with billing-unit rates (daily/weekly/monthly) and an optional custom-unit rate.
- Rate cards can be overridden at customer level and, further, at project level. Inheritance priority is **project > customer > category default** — resolving the "unresolved explicitly" inheritance-priority gap flagged in the Customer domain doc (§13) for the pricing dimension specifically; the *payment-terms* inheritance question that doc raises remains open there.
- Every price calculation records which rate-card version and override level it used, for auditability and dispute resolution.

## 5. Billing Units and Proration

- Supported billing units: Daily, Weekly, Monthly, Custom (contract-line-defined).
- When a rental period spans a tier boundary, the engine applies the largest applicable full unit(s) first, then prorates the remainder at the next smaller unit — mirroring the SRS's worked example (a 10-day rental on a Weekly+Daily tier prices as one weekly rate plus 3 prorated daily rates).
- Proration rules are configurable per category (some categories may disallow sub-day proration), not hardcoded globally.

## 6. Cycle Billing

- Long-term contracts bill on a recurring cycle (28 or 30 days, contract-configured) from the contract start date.
- The Pricing domain computes the amount due per cycle from the frozen contract-line rates and any governed mid-cycle changes (extensions, substitutions); it does not itself generate or send the invoice — that is Finance's responsibility (Billing domain, Phase 15), consistent with CLAUDE.md's no-duplication rule.

## 7. Deposits and LDW

- **Security deposit** calculation methods: flat amount, percentage of combined replacement value of contracted assets, percentage of contract value, or customer-specific override — matching the deposit methods already enumerated in the Contract domain doc (§"Deposits").
- **LDW fee** calculation methods: flat, percentage of rental charge, percentage of replacement value — selected per category/customer/project policy. Whether LDW is mandatory, optional, waived-with-valid-COI, or prohibited for a given contract line is a Contract Management decision (doc 07 §17); this domain only computes the fee once that decision is made.

## 8. Multi-Asset Aggregation

For contracts with multiple asset lines, the domain produces a per-line price plus a contract-level aggregate, and supports independent re-pricing of a single line (e.g., on early partial return or substitution) without recalculating unaffected lines — required by Contract Management's multi-asset, independent-per-asset-timeline model (doc 07 §"Line items").

## 9. Deferred to a Future Deeper Pass

Explicitly not resolved here, to avoid inventing unapproved commercial policy (per CLAUDE.md):

- Negotiation workflow and redlining UX for corporate/master-agreement pricing
- Margin floor definitions and the approval chain for below-floor pricing
- Standby, overtime, overage, transport, and operator-charge rate structures
- Multi-currency FX handling beyond a currency-agnostic engine shape
- Discount-approval routing thresholds
- Pricing Simulator tooling

These remain tracked in `docs/00-Foundation/OPEN-QUESTIONS-REGISTER.md` as **Deferred, not blocking MVP**.

## 10. RBAC Requirements

- `pricing.ratecard.view`
- `pricing.ratecard.edit`
- `pricing.ratecard.publish`
- `pricing.override.customer`
- `pricing.override.project`
- `pricing.calculate` (internal service permission — other domains call the calculation service under this scope, not user-facing)
- `pricing.audit.view`

## 11. Domain Events

- `RateCardPublished`
- `RateCardVersionSuperseded`
- `PriceCalculated`
- `PricingSnapshotCreated`
- `DepositCalculated`
- `LdwFeeCalculated`

Each event includes: event ID, event type, event version, tenant ID, relevant entity ID(s), timestamp, actor, correlation ID, source domain — matching the envelope already established in doc 06 §29.

## 12. Non-Functional Requirements

- Calculation must be deterministic and replayable: given the same rate-card version and inputs, the same result every time — this is the acceptance bar the roadmap sets for Phase 08 (§13 "Definition of Done").
- Calculation latency must not become the bottleneck in contract creation or availability search flows.
- All calculation inputs and the resulting snapshot must be retained for the life of the contract for audit and dispute resolution.

## 13. Acceptance Criteria

1. A price calculated twice from the same governed inputs and rate-card version produces identical output.
2. Rate-card inheritance (project > customer > category) is explicit and auditable per calculation.
3. Proration across tier boundaries matches the documented worked example.
4. Deposit and LDW calculations are fully explainable (method + inputs + result), not a black box.
5. Cycle billing interval is contract-configurable (28 or 30 days).
6. No calculation hardcodes a currency symbol or a single-currency assumption.
7. Everything listed in §9 is explicitly marked deferred, not silently omitted.

## 14. Dependencies

Depends on: Asset Registry (replacement value, category), Customer & Corporate Account (customer-level overrides, credit/payment terms context), Project/Jobsite (project-level overrides — this upstream document does not yet exist; tracked as a gap in `MASTER-INDEX.md`).

Feeds: Contract Management (pricing snapshot at signature), Rental Operations (late-fee calculation), Finance (cycle billing amounts for invoice generation).

## 15. Open Questions

1. Is a single tenant-wide rate-card inheritance rule (project > customer > category) sufficient, or does any customer segment need a different override order?
2. What is the minimum viable discount-approval threshold model needed before Contract Management can go live, versus what can wait for the deeper pricing pass?
3. Should LDW/deposit calculation methods be lockable per category (so a branch admin cannot silently switch a high-risk category to a weaker method), and if so, who approves that lock?
4. Confirmed in the SRS as unresolved and still unresolved here: which accounting platform ERMS will integrate with — affects whether cycle-billing amounts need a specific export shape.

## 16. Decision History

| Version | Date | Decision |
|---|---|---|
| 0.1 | 2026-07-30 | Initial lite draft, seeded from stakeholder SRS §4.2/§4.6 and scoped down to only what Contract Management and Rental Operations require for the MVP vertical slice; full negotiation/margin/multi-currency pass explicitly deferred. |
