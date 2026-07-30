# 11 — Rental Operations Domain Specification

**Document ID:** ERMS-DOM-005
**Version:** 0.1
**Status:** Working Draft
**Primary Market:** Saudi Arabia
**Domain Owner:** Rental Operations Domain
**Depends On:** Asset Registry, Contract Management, Pricing, Customer & Corporate Account
**Feeds:** Dispatch, Maintenance/PPM, Finance, Reporting, Customer Portal

**Source Input:** Seeded from the stakeholder SRS §4.2 (REQ-RM-001 through REQ-RM-007), reconciled against the Asset Registry's status model (`05-ASSET-REGISTRY-DOMAIN-SPECIFICATION.md`) and the availability/reservation, checkout, return, and damage-comparison screens already catalogued in `docs/08-UX/20-SCREEN-INVENTORY-AND-NAVIGATION-REGISTRY.md` (UX-400 series). See `docs/00-Foundation/SRS-RECONCILIATION.md`.

---

## 1. Purpose

This document defines the Rental Operations domain: availability search, reservation-to-hold, checkout, active-rental tracking, extension, substitution, return/off-hire, and damage evidence — the physical and evidentiary lifecycle of a rental, sitting between a signed Contract and the Asset Registry's status transitions.

## 2. Core Domain Principle

**No rental operation may change an asset's authoritative status except through the Asset Registry's controlled transition service (see doc 05 §6.2), and no checkout may occur against a contract that is not Signed and Active.**

This domain does not maintain its own copy of asset status; it triggers and observes Asset Registry transitions.

## 3. Business Context

A rental's physical lifecycle does not always match its contractual lifecycle one-to-one: a single signed contract may cover multiple assets checked out and returned independently (per the Contract domain's multi-asset model, doc 07), a rental may be extended or have an asset substituted mid-hire, and disputes over damage are common enough that evidence capture is a first-class requirement, not an afterthought.

## 4. Scope

### 4.1 In Scope

- Availability search and real-time calendar (On-Site / With Customer / Booked)
- Double-booking prevention
- Temporary holds and reservation lines
- Checkout workflow: checklist, photos, meter/fuel capture, certificate and signed-contract gating
- Active rental tracking, including overdue detection
- Extension requests
- Asset substitution mid-hire
- Return/off-hire workflow: checklist, photos, damage comparison against checkout evidence
- Automatic post-return cooldown/inspection buffer
- Late-fee triggering (calculation itself is Pricing's, per doc 08 §6)
- End-of-rental reconciliation statement generation (aggregation of Pricing/Finance outputs, not new financial logic)

### 4.2 Out of Scope

- Asset identity, status enumeration, and location tracking (Asset Registry)
- Contract terms, signature, amendments (Contract Management)
- Price and fee calculation (Pricing)
- Physical dispatch/transport execution, drivers, POD (Dispatch domain)
- Work order execution for damage repair (Maintenance/PPM)
- Invoice generation and payment (Finance)

## 5. Availability and Double-Booking Prevention

- Availability is computed live from the Asset Registry's current status plus confirmed reservation lines and active PPM locks — never from a separately maintained calendar cache that could drift.
- A reservation is rejected if it overlaps an existing confirmed reservation or an active PPM lock for the same serialized asset; the system offers alternative available assets in the same category rather than a bare rejection (SRS REQ-RM-006).
- Temporary holds expire automatically if not converted to a confirmed reservation within a configurable window, releasing the asset back to search results.

## 6. Checkout

- Checkout is blocked unless: the governing contract is `Signed and Active` (doc 07 §"Check-Out Blocked Without Signed Contract"), all required certificates for the asset's category are currently valid (doc 05 §10), and a completed digital checkout form exists.
- The checkout form requires, at minimum, one condition photo and a meter/fuel reading before the Asset Registry transition to `Rented` is permitted — the form's completeness is what this domain enforces; the actual status write goes through the Asset Registry's transition service.
- Checkout photos are retained and linked to the specific rental event so they can be presented side by side with return photos later (§8).

## 7. Active Rental and Overdue Handling

- Once `Rented`, the asset's rental record tracks scheduled return date/time, extension history, and substitution history.
- A rental becomes `Overdue` automatically once the scheduled return time passes without a return event recorded — this status is a Rental Operations concept describing the *rental record*, distinct from and layered on top of the Asset Registry's own `Rented` asset status (the asset is still physically `Rented`; the rental is additionally flagged overdue).
- Overdue rentals trigger a late-fee request to Pricing at the next billing cycle (doc 08 §6); this domain does not compute the fee itself.

## 8. Return and Damage Comparison

- Return/off-hire requires a completed digital return form with at least one condition photo, mirroring the checkout requirement.
- The return workflow presents checkout and return photos for the same asset side by side in a dedicated damage-comparison view — this is the SRS's most concrete, directly reusable requirement (REQ-RM-004) and is preserved verbatim in intent.
- A detected damage discrepancy creates a linked record for downstream handling (deposit deduction via Pricing/Finance, or a Maintenance/PPM work order) rather than being resolved inline in this domain, per CLAUDE.md's no-duplication rule.
- For multi-asset contracts, each asset's return is processed independently; unreturned assets on the same contract remain `Rented` and the contract remains active (doc 07 §"Multi-Asset Contract Support").

## 9. Post-Return Cooldown Buffer

- After a return is recorded, the asset transitions to `In Inspection` (Asset Registry status, doc 05 §6.1) for a configurable buffer period before automatically becoming `Available` again, allowing time for cleaning/inspection.
- The buffer default is business-configurable, not hardcoded — the SRS's illustrative "24 hours" is an example, not a confirmed value (see Open Questions).

## 10. Extension and Substitution

- **Extension:** a request to extend the scheduled return date on an active rental line. Must re-check availability (the extended window must not collide with another confirmed reservation on the same asset) before being accepted, and triggers a re-pricing request to Pricing for the extended period.
- **Substitution:** replacing one asset with another mid-hire on the same contract line, e.g. for a breakdown. Requires the original asset to transition out of `Rented` and the replacement to transition in, both through the Asset Registry, and is recorded as a linked pair of events for audit continuity.

## 11. RBAC Requirements

- `rental.availability.search`
- `rental.reservation.create`
- `rental.reservation.cancel`
- `rental.checkout.execute`
- `rental.checkout.override` (privileged — e.g. bypassing a non-blocking checklist item, always audited)
- `rental.extension.request`
- `rental.extension.approve`
- `rental.substitution.execute`
- `rental.return.execute`
- `rental.damage.review`
- `rental.audit.view`

## 12. Domain Events

- `ReservationCreated`
- `ReservationCancelled`
- `ReservationHoldExpired`
- `RentalCheckedOut`
- `RentalOverdueFlagged`
- `RentalExtended`
- `AssetSubstituted`
- `RentalReturned`
- `DamageDiscrepancyRecorded`
- `RentalReconciliationStatementGenerated`

Each event includes: event ID, event type, event version, tenant ID, rental/reservation ID, asset ID, contract ID, timestamp, actor, correlation ID, source domain.

## 13. Non-Functional Requirements

- Availability queries must reflect the Asset Registry's current state without a stale-cache window (the SRS's proposed "within 5 seconds" is a placeholder pending confirmation, consistent with doc 05 §18).
- Checkout/return forms must function on mobile devices at the counter and in the yard.
- Photo uploads must be retained for the contract's full retention period, not purged on rental closure.

## 14. Acceptance Criteria

1. Checkout cannot proceed without a Signed-and-Active contract, valid required certificates, and a complete checklist.
2. Return always offers a side-by-side checkout-vs-return photo comparison when checkout photos exist.
3. Double-booking is structurally prevented, not just discouraged by UI warnings.
4. Overdue detection and late-fee triggering are automatic, not dependent on a user noticing.
5. Multi-asset contracts allow independent per-asset checkout/return without affecting sibling asset lines.
6. Post-return cooldown is configurable, not hardcoded to a single value.
7. This domain never writes asset status directly — every transition traces back to an Asset Registry call.

## 15. Dependencies

Depends on: Asset Registry, Contract Management, Pricing, Customer & Corporate Account.

Feeds: Dispatch (checkout/return as delivery/pickup triggers), Maintenance/PPM (damage-discrepancy work orders), Finance (reconciliation statement inputs, late fees), Reporting, Customer Portal (extension/off-hire self-service requests, per the roadmap's Phase 17 scope).

## 16. Open Questions

1. Confirmed sync-latency target for availability search (SRS placeholder is 5 seconds — needs business sign-off, tracked centrally).
2. Default cooldown/buffer duration — business-defined value not yet supplied (carried forward from the SRS's own §8 open item).
3. Is a temporary hold's expiry window uniform tenant-wide, or configurable per branch/category?
4. Should extension requests from the Customer Portal require the same approval gate as counter-initiated extensions, or a lighter one?
5. What evidence (beyond photos) is required for a damage discrepancy to be contract-enforceable in a GCC dispute context — a legal/compliance question outside this domain's authority to resolve unilaterally.

## 17. Decision History

| Version | Date | Decision |
|---|---|---|
| 0.1 | 2026-07-30 | Initial draft, seeded from stakeholder SRS §4.2 and reconciled with the Asset Registry status model and Contract Management's multi-asset/immutability rules. |
