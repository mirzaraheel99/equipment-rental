# 05 — Asset Registry Domain Specification

**Document ID:** ERMS-DOM-001
**Version:** 0.1
**Status:** Working Draft
**Primary Market:** Saudi Arabia
**Domain Owner:** Asset Registry Domain
**Depends On:** Tenant Management, Identity, RBAC, Audit, Document Storage, Localization
**Feeds:** Customer & Corporate Account, Contract Management, Pricing, Rental Operations, Dispatch, Maintenance/PPM, Inventory, Finance, Reporting

**Source Input:** Seeded from the stakeholder-supplied SRS (`ERMS_SRS_1.docx`) §3.1 and §4.1 (REQ-AR-001 through REQ-AR-006), reconciled against `docs/06-Data/18-ENTERPRISE-DATABASE-DICTIONARY.md` §"Asset Registry Tables" and the multi-tenant/RBAC/audit conventions already established in `06-CUSTOMER-AND-CORPORATE-ACCOUNT-DOMAIN-SPECIFICATION.md` and `07-CONTRACT-MANAGEMENT-DOMAIN-SPECIFICATION.md`. See `docs/00-Foundation/SRS-RECONCILIATION.md` for the full requirement-by-requirement mapping.

---

## 1. Purpose

This document defines the Asset Registry domain for the Equipment Rental Management System (ERMS).

The domain is responsible for maintaining the single, authoritative identity, classification, current status, current location, utilization, condition history, and compliance state of every serialized and non-serialized rental asset across its entire lifecycle — from onboarding through disposal or decommission.

Every other operational domain (Rental, Contract, Dispatch, Maintenance/PPM, Inventory, Finance) reads asset state from this registry and writes status-changing events back to it through controlled services. No other domain may cache or independently maintain a competing copy of an asset's status.

## 2. Core Domain Principle — The Golden Rule

**Every asset has exactly one authoritative status and exactly one authoritative location at any point in time, visible identically to every module.**

This is the single most important architectural rule in ERMS (carried forward verbatim from the original stakeholder outline and the uploaded SRS, REQ-AR-002). It exists to prevent the classic failure mode of rental software: an asset appearing "Available" in the rental calendar while simultaneously flagged "In Service" in the maintenance system.

Consequences of the Golden Rule:

- No module may render, quote, reserve, or dispatch an asset using a status value it computed or cached itself; it must query the Asset Registry.
- A status change is only valid if it is written through the Asset Registry's controlled state-transition service — never by direct field update from another domain.
- Two modules must never be able to commit conflicting status-changing transactions on the same asset concurrently (see §8, Cross-Module Write Lock).
- Every status change is audited with actor, triggering module, timestamp, and previous/new value (see §11).

## 3. Business Context

ERMS assets range from small serialized hand tools and generators to heavy machinery (excavators, bobcats, cranes), specialized oil-and-gas equipment, and non-serialized bulk/consumable tooling. Assets may be:

- Onboarded directly into the Rental module or transitioned in from a Sales/disposition workflow
- Tracked with or without telematics (GPS/hour-meter hardware)
- Subject to safety or lifting-equipment certification requirements before they are legally rentable in the GCC
- Moved between branches, yards, jobsites, and customer sites
- Composed of a parent unit plus attachments (e.g., an excavator plus interchangeable buckets), which the registry must relate without conflating their identities

A generic "equipment list with a status column" is insufficient once multiple operational modules and multiple branches depend on the same record simultaneously.

## 4. Scope

### 4.1 In Scope

- Asset identity and unique, non-reusable serialization
- Asset categories, manufacturers, and models (master data)
- Controlled asset status enumeration and transitions
- Current location and location history
- Meter/utilization tracking, including telematics ingestion
- Compliance certificates and their expiry
- Asset documents (photos, manuals, warranty, PDI records)
- Asset condition and damage history
- Attachment/kit relationships (parent asset ↔ compatible attachments)
- Asset 360° consolidated view
- Cross-module status write-lock and conflict handling
- Status and location audit trail
- Disposal/decommission/for-sale transition triggers
- Depreciation and book-value fields required by the Sales/disposition workflow (values only — depreciation *policy* is owned by Finance, per CLAUDE.md's no-duplication rule)

### 4.2 Out of Scope

The domain does not own:

- Reservation or booking logic (Rental/Availability domain)
- Pricing or rate cards (Pricing domain)
- Contract terms (Contract domain)
- Work order execution or PPM scheduling policy (Maintenance/PPM domain — the registry only exposes the status/lock hooks that domain writes through)
- Inventory of consumable parts (Inventory domain)
- Invoicing or payment (Finance domain)
- Dispatch/transport execution (Dispatch domain)

The registry exposes asset data to these domains through controlled APIs and events; it never accepts direct writes to status or location from them.

## 5. Asset Identity

Every asset receives a tenant-scoped, unique, non-reusable Asset ID at onboarding, regardless of which module introduces it (Rental or Sales/disposition).

- Asset IDs are never reassigned, including after decommission or deletion-equivalent archival.
- Serialized assets carry a manufacturer serial number (unique within tenant + manufacturer + model, not globally, since two manufacturers may reuse serial formats).
- Non-serialized/bulk tooling is tracked at the SKU/lot level and is out of scope for per-unit status transitions (see Inventory domain).
- Attachments may be modeled either as their own serialized asset (if independently rentable/billable) or as an accessory linked to a parent asset — the operative rule for each category must be declared in asset-category master data, not hardcoded per asset.

## 6. Status Model

### 6.1 Controlled Status Enumeration

The minimum controlled status list (extendable only through a registry change, never invented ad hoc by a consuming module, per the roadmap's "never create a new status without registry updates" rule):

`Available → Reserved → Rented → In Transit → In Inspection (cooldown) → In Service → PPM Due → PPM Locked → For Sale → Sold → Decommissioned`

Additional statuses referenced by dependent domains that must resolve through this same enumeration rather than a private copy: `Damaged/Under Claim Review`, `Missing/Lost` (from Maintenance/PPM and Rental respectively — see their domain docs).

Only one status is active per asset at any time.

### 6.2 Status Transition Rules

- Every transition is executed by a single controlled state-transition service, never a direct field write.
- Each transition records: previous status, new status, triggering module, triggering user, reason/reference (e.g. work order ID, contract ID, PPM plan ID), and timestamp.
- Optimistic locking (row version) is mandatory on the asset status field to reject stale concurrent transitions rather than silently overwrite them.
- Invalid transitions (e.g. `Sold → Rented`) are rejected with an explicit error, not silently coerced.
- Assets in `For Sale`, `Sold`, or `Decommissioned` are immediately excluded from the rentable pool and from availability search results.
- Assets entering a configurable PPM lookahead window automatically transition to `PPM Due`, and `PPM Locked` once the maintenance/PPM domain confirms the lock — the registry exposes the transition hook; the *scheduling policy* that decides when to call it belongs to the Maintenance/PPM domain.

## 7. Asset Categories, Manufacturers, and Models

Master data hierarchy: **Manufacturer → Model → Asset**, with **Category** as a cross-cutting classification (not a hierarchy level) used for liability-clause selection (Contract domain), certification requirements, and rate-card defaults (Pricing domain).

Minimum model fields: model name, manufacturer reference, category, standard/default rate card reference (Pricing domain owns the rate card itself), required certification types, default depreciation method, default useful life.

Category-level flags the registry must expose to dependent domains: `requires_operator`, `requires_lifting_certificate`, `high_risk` (drives Contract domain's mandatory indemnification clause and COI coverage-limit checks), `telematics_capable`.

## 8. Location Tracking

- Current location is a single authoritative field per asset (branch/yard, jobsite, in-transit, with-customer), mirroring the Golden Rule for status.
- Location history is retained as an append-only log, not overwritten.
- Location changes triggered by Dispatch (delivery/pickup/transfer) must go through the same controlled write path as status changes, and are subject to the same optimistic-locking and audit rules.
- Cross-branch transfers must not create a window where two branches simultaneously believe they hold the asset.

## 9. Meter, Utilization, and Telematics

- Each asset may carry one or more meter types (engine hours, mileage, cycles) depending on category.
- Manual meter entry is supported for non-telematics-equipped assets (this is the common case for older/smaller fleet per the market research doc's segment analysis, not an edge case — REQ-AR-adjacent gap explicitly called out as under-specified in the SRS, see Open Questions).
- Telematics-equipped assets ingest GPS and hour-meter readings at a polling interval defined during technical design; each reading updates the utilization counter and is evaluated against Maintenance/PPM thresholds through an event, not a direct cross-domain write.
- Meter readings are never decreased by ingestion (a lower incoming reading than the current counter is flagged for review, not silently applied) — protects against faulty sensors and prevents accidental rollback of PPM due-dates.

## 10. Compliance Certificates

- Certificates (e.g. lifting/crane certification, pressure-vessel inspection, and other GCC-mandated safety certifications relevant to the asset's category) are stored against the asset with issuing body, certificate number, issue date, and expiry date.
- Expired-certificate state is computed, not manually flagged, and is visible on the Asset 360° view.
- The registry exposes a "current valid certificates for asset X" query that the Contract domain calls at Check-Out; the registry does not itself decide whether to block Check-Out (that business rule belongs to Contract/Rental Operations per CLAUDE.md's no-duplication rule) — it only guarantees the certificate state it returns is accurate and current.

## 11. Status and Location Audit Trail

Every status and location change produces an immutable audit record containing: asset ID, tenant ID, previous value, new value, triggering module, triggering user or system actor, reason/reference ID, correlation ID, timestamp, and (for status) the row version transitioned from/to.

The full chronological history must be retrievable per asset without reconstruction from other domains' logs.

## 12. Cross-Module Status Write Lock

- The registry serializes status-changing transactions per asset (e.g. via row-level locking or an equivalent optimistic-concurrency pattern) so that two modules (for example, Rental attempting a reservation and Maintenance/PPM attempting a lock) cannot both succeed on the same asset in the same instant.
- A losing transaction is rejected with a clear conflict error identifying the winning transaction's triggering module, not silently queued indefinitely.
- This behavior must be verified under concurrency tests (see §18, mirrored from the roadmap's Phase 05 required test list: duplicate serial, invalid status transition, stale row version, cross-module lock simulation, meter rollback, expired-certificate visibility).

## 13. Asset Documents

Photos (condition/onboarding/PDI), manuals, warranty documents, and compliance certificates are versioned and stored through the shared Document Storage foundation (Platform Core), not owned redundantly by this domain — the Asset Registry stores references and access rules, not raw file handling logic.

## 14. Asset 360° View

A single consolidated read view per Asset ID showing: current status, current location, active contract reference (if any, read from Contract domain), open service/work-order tickets (read from Maintenance/PPM), PPM schedule and next-due trigger, current meter readings, valid/expired certificates, financial book value, and full status/location history — without requiring the user to navigate to another module. This view aggregates read-only projections; it does not become a new source of truth for the data it displays.

## 15. Disposal, Decommission, and Sale Transition

- Transitioning an asset to `For Sale` triggers a book-value recalculation request to Finance (depreciation method and elapsed useful life are Finance-owned policy; the registry supplies purchase price, method reference, and in-service date as inputs).
- `For Sale`, `Sold`, and `Decommissioned` assets are immediately excluded from availability search results system-wide — this must hold even mid-search (no stale cache serving a since-decommissioned asset as bookable).
- Decommissioned assets retain their full audit and service history permanently; their Asset ID is never reused (§5).

## 16. RBAC Requirements

Example permissions:

- `asset.view`
- `asset.create`
- `asset.edit`
- `asset.status.transition`
- `asset.status.override` (privileged — bypasses normal transition rules, always audited and reauthenticated)
- `asset.location.transfer`
- `asset.meter.enter`
- `asset.meter.override`
- `asset.certificate.upload`
- `asset.certificate.verify`
- `asset.documents.view`
- `asset.documents.upload`
- `asset.disposal.initiate`
- `asset.decommission`
- `asset.audit.view`
- `asset.export`

Permissions must support tenant scope, legal-entity scope, branch scope, category scope, and role — consistent with the scoping model already defined in the Customer domain (§26 of doc 06).

## 17. Domain Events

- `AssetCreated`
- `AssetUpdated`
- `AssetStatusChanged`
- `AssetStatusTransitionRejected`
- `AssetLocationChanged`
- `AssetMeterReadingRecorded`
- `AssetMeterAnomalyFlagged`
- `AssetCertificateUploaded`
- `AssetCertificateExpired`
- `AssetEnteredPpmLookahead`
- `AssetPpmLocked`
- `AssetMovedForSale`
- `AssetSold`
- `AssetDecommissioned`

Each event includes: event ID, event type, event version, tenant ID, asset ID, timestamp, actor, correlation ID, relevant payload, source domain — matching the event envelope already established in the Customer domain spec (§29 of doc 06).

## 18. Non-Functional Requirements

- **Status sync:** a status change must be visible to every querying module within the tenant's defined sync tolerance (the SRS's REQ-NFR-001 proposed 5 seconds as an industry-baseline placeholder — see Open Questions; not a confirmed SLA).
- **Concurrency:** required test coverage — duplicate serial rejection, invalid status transition rejection, stale row-version rejection, cross-module lock simulation, meter rollback rejection, expired-certificate visibility at Check-Out.
- **Availability:** the registry is a hard dependency for Rental, Contract, and Dispatch; its read path must remain available even during Maintenance/PPM or Finance domain degradation.
- **Retention:** asset records, once they have any contract, work-order, or financial history, are never physically deleted — matches the database dictionary's retention rule (doc 18 §"Never physically delete").

## 19. Acceptance Criteria

The Asset Registry Domain specification is considered complete when:

1. Every asset has exactly one authoritative status and one authoritative location, enforced structurally, not by convention.
2. No other domain document describes writing directly to asset status or location.
3. Status and location changes are fully audited and retrievable in chronological order per asset.
4. Concurrent status-changing transactions on the same asset cannot both succeed.
5. Certificate expiry is computed, not manually maintained, and is visible before Check-Out decisions are made elsewhere.
6. For Sale/Sold/Decommissioned assets are excluded from rentable search results immediately and consistently.
7. Depreciation *policy* is explicitly deferred to Finance; this document does not invent a depreciation formula.
8. Manual meter entry for non-telematics assets is treated as a first-class path, not an edge case.

## 20. Dependencies

This domain depends on: Tenant Management, Identity, RBAC, Audit, Document Storage, Localization.

This domain feeds: Customer & Corporate Account (asset replacement value for insurance/COI checks), Contract Management (certificate/category checks, liability clause selection), Pricing (category-based rate defaults), Rental Operations (checkout/return status transitions), Dispatch (location transitions), Maintenance/PPM (lock transitions, meter data), Inventory (attachment/parts linkage), Finance (book value inputs), Reporting.

## 21. Open Questions

1. Sync-latency, uptime, and retention targets in §18 are industry-baseline placeholders carried from the SRS, not confirmed business SLAs — needs stakeholder sign-off (tracked centrally in `OPEN-QUESTIONS-REGISTER.md`).
2. Should attachments always be modeled as independent serialized assets, or can a category opt into "accessory linked to parent, no independent status" — needs a decision per category during Phase 05 design, not globally.
3. What proportion of the initial fleet is expected to be non-telematics (manual meter entry)? This affects whether manual entry needs its own guided workflow or a simple form.
4. Which GCC-specific certification bodies/registries must be modeled as structured reference data (vs. a free-text "issuing body" field) for Phase 05?
5. Is a single tenant-wide PPM lookahead window sufficient at launch, or does it need to vary by category/legal entity from day one?
6. Depreciation method (straight-line vs. other) referenced by §15 is explicitly owned by Finance and remains unresolved there (carried forward from the SRS's own §8 open item).

## 22. Decision History

| Version | Date | Decision |
|---|---|---|
| 0.1 | 2026-07-30 | Initial draft, seeded from stakeholder SRS §4.1 and reconciled with existing Customer/Contract domain conventions and the enterprise database dictionary's Asset Registry tables. |
