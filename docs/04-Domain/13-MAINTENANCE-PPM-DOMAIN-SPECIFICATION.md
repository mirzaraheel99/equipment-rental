# 13 — Maintenance, Workshop, and PPM Domain Specification (Lite)

**Document ID:** ERMS-DOM-006
**Version:** 0.1
**Status:** Working Draft — Lite Pass (see §9 for what is deliberately deferred)
**Primary Market:** Saudi Arabia
**Domain Owner:** Maintenance/PPM Domain
**Depends On:** Asset Registry, Inventory (referenced, not yet documented)
**Feeds:** Asset Registry (lock/unlock transitions), Rental Operations (damage-discrepancy work orders), Contract Management (certificate validity), Reporting

**Source Input:** Seeded from the stakeholder SRS §4.4 (Services/Reactive Maintenance, REQ-SV-001 through REQ-SV-006) and §4.5 (PPM, REQ-PM-001 through REQ-PM-006), reconciled against the Asset Registry's PPM-lock and certificate hooks (`05-ASSET-REGISTRY-DOMAIN-SPECIFICATION.md` §6.2, §10) and the `work_order`, `ppm_plan`, `inspection`, `certificate` tables in the database dictionary (doc 18). See `docs/00-Foundation/SRS-RECONCILIATION.md`.

**Why "Lite":** This pass covers what is required so the Asset Registry's PPM-lock and certificate-expiry hooks (already specified structurally in doc 05) have a real scheduling and work-order domain behind them, and so Contract Management's Check-Out certificate gate has a source of truth. It does not attempt full workshop-board UX, parts/labor costing, or warranty-claim financial handling — those are deferred to §9.

---

## 1. Purpose

This document defines the minimum Maintenance and Planned Preventative Maintenance (PPM) domain required to: (a) keep an asset's compliance certificates current and enforceable, (b) trigger and track PPM work orders on a dual time/usage basis, and (c) lock/unlock rental availability through the Asset Registry when maintenance requires it.

## 2. Core Domain Principle

**An asset cannot become rentable while blocked by an unresolved PPM requirement, an expired required certificate, or an open safety-relevant work order** — carried forward verbatim from the roadmap's own Phase 13 Definition of Done, and structurally enforced by this domain calling the Asset Registry's lock transition, never by a UI-level warning that can be dismissed.

## 3. Scope

### 3.1 In Scope (this lite pass)

- Reactive service ticket creation (internal or customer-reported) linked to Asset ID
- PPM plans with dual-trigger scheduling: time-based interval OR usage-based threshold, whichever occurs first
- Auto-lock of rental availability within a configurable PPM lookahead window
- Compliance certificate storage, expiry computation, and the "current valid certificates" query Contract Management calls at Check-Out (this domain owns the certificates themselves; doc 05 exposes the query surface)
- PPM overdue escalation notification
- Telematics/meter data consumption for threshold evaluation (ingestion itself is owned by Asset Registry, doc 05 §9; this domain evaluates the reading against PPM thresholds)
- Service history linkage to the asset's permanent record
- Basic ready-to-rent approval that clears the PPM lock

### 3.2 Out of Scope (deferred — see §9)

- Full workshop board / technician assignment UX
- Labor and parts costing, warranty-claim financial reconciliation
- Spare-parts reorder automation (depends on the not-yet-written Inventory domain)
- Predictive maintenance / AI-driven scheduling (explicitly listed as deferrable in the roadmap's MVP boundary, §34)
- Multi-step inspection templates beyond a basic checklist

## 4. Reactive Service Tickets

- A ticket can originate from an internal breakdown report or a customer-submitted report (Customer Portal), and must link to the affected Asset ID at creation — an unlinked ticket is not valid.
- Ticket closure appends to the asset's permanent service history (visible on the Asset 360° view, doc 05 §14), with date, technician, and work performed.
- Warranty status is checked before a ticket is billed to the customer; a repair under active manufacturer/extended warranty is flagged warranty-covered and excluded from customer billing (SRS REQ-SV-004). The warranty record and billing exclusion mechanics are a Finance concern to formalize in the deeper pass; this domain only supplies the warranty-covered flag.

## 5. PPM Dual-Trigger Scheduling

- Each PPM plan defines both a time interval (e.g. every 6 months) and a usage threshold (e.g. every 250 operating hours), evaluated independently; whichever is reached first generates the work order (SRS REQ-PM-001, preserved verbatim as it is the domain's most concrete and directly reusable requirement).
- Usage-threshold evaluation consumes meter readings from the Asset Registry's telematics ingestion (doc 05 §9) via event, not a direct cross-domain read of raw sensor data.
- A generated PPM work order that is not closed by its due date triggers an overdue escalation notification (SRS REQ-PM-005).

## 6. Auto-Lock of Rental Availability

- Once an asset enters its configured PPM lookahead window (before the time or usage trigger fires), this domain calls the Asset Registry's transition service to move the asset to `PPM Due`; on confirmed lock, to `PPM Locked` (doc 05 §6.2).
- A locked asset does not appear as bookable in availability search — enforced by the Asset Registry's status model, not by a separate maintenance-side flag that Rental Operations would have to remember to check.
- Ready-to-rent approval (clearing the lock back toward `Available`) requires an explicit sign-off action from this domain, not an automatic timer.

## 7. Compliance Certificates

- Certificates are stored with issuing body, certificate number, issue date, expiry date, and the asset/category they apply to.
- Expiry is computed from the stored date, not manually flagged.
- Contract Management calls this domain's "current valid certificates for Asset X" query at Check-Out and blocks Check-Out if a required certificate has expired (doc 07 and SRS REQ-PM-004) — the block itself is enforced by Contract Management/Rental Operations; this domain's responsibility is that the query it answers is always accurate and current.

## 8. Telematics Consumption

- This domain subscribes to the Asset Registry's meter-reading events (doc 05 §9, `AssetMeterReadingRecorded`) and evaluates each reading against any open PPM plan's usage threshold for that asset.
- A meter-reading anomaly flagged by the Asset Registry (§9 rollback protection) is not evaluated against thresholds until resolved, to avoid a faulty sensor falsely clearing or falsely triggering a PPM cycle.

## 9. Deferred to a Future Deeper Pass

- Full workshop board, technician mobile workspace UX, and shift/capacity scheduling
- Labor-hour and parts costing, and their roll-up into repair-ticket billing
- Spare-parts reorder automation (needs the Inventory domain first)
- Warranty-claim financial reconciliation with vendors
- Predictive/AI-assisted maintenance scheduling
- Multi-step configurable inspection templates beyond a basic pass/fail checklist

These remain tracked in `docs/00-Foundation/OPEN-QUESTIONS-REGISTER.md` as **Deferred, not blocking MVP**.

## 10. RBAC Requirements

- `maintenance.ticket.create`
- `maintenance.ticket.view`
- `maintenance.ticket.close`
- `maintenance.ppm.plan.manage`
- `maintenance.ppm.override` (privileged — force-clear a lock, always audited and reauthenticated)
- `maintenance.certificate.upload`
- `maintenance.certificate.verify`
- `maintenance.readytorent.approve`
- `maintenance.audit.view`

## 11. Domain Events

- `ServiceTicketCreated`
- `ServiceTicketClosed`
- `PpmPlanCreated`
- `PpmWorkOrderGenerated`
- `PpmWorkOrderOverdue`
- `PpmLockRequested`
- `PpmLockCleared`
- `CertificateUploaded`
- `CertificateExpired`
- `ReadyToRentApproved`

Each event includes: event ID, event type, event version, tenant ID, asset ID, work-order/ticket ID, timestamp, actor, correlation ID, source domain.

## 12. Non-Functional Requirements

- PPM threshold evaluation must run close enough to real time that an asset does not remain bookable materially past the point its usage threshold was crossed (exact tolerance is an Open Question, not yet a confirmed SLA).
- Certificate-expiry computation must be timezone-correct for the Saudi/GCC market to avoid off-by-one-day blocking errors.
- Overdue escalation notifications must not be silently swallowed if the notification channel (email/SMS/WhatsApp) is degraded — falls back to an in-app alert per Platform Core's notification foundation.

## 13. Acceptance Criteria

1. A PPM work order fires on whichever of its two triggers (time or usage) is reached first, matching the SRS's worked example (250 hours reached at 4 months on a 6-month/250-hour plan fires at 4 months).
2. An asset within its PPM lookahead window is not bookable, enforced through the Asset Registry, not a separate flag.
3. Check-Out is blocked when a required certificate has expired, and the block traces to this domain's certificate query.
4. Meter-reading anomalies are excluded from threshold evaluation until resolved.
5. Every item in §9 is explicitly marked deferred, not silently omitted from scope.

## 14. Dependencies

Depends on: Asset Registry (status/lock transitions, meter events, certificate query surface), Inventory (parts — deferred interaction, not required for this lite pass).

Feeds: Asset Registry (lock/unlock requests), Rental Operations (damage-discrepancy-triggered work orders), Contract Management (certificate validity at Check-Out), Reporting.

## 15. Open Questions

1. Confirmed PPM lookahead window default — business-defined value not yet supplied (carried forward from the SRS's own §8 open item, same status as the Rental Operations cooldown-buffer question).
2. Which GCC-specific certification bodies are structured reference data vs. free text (mirrors the same open question in the Asset Registry doc, §21.4 — should be resolved once, not independently by each domain).
3. Telematics polling interval and threshold-evaluation tolerance — not yet defined during technical design (SRS Integration Requirements section leaves this open too).
4. Should warranty-covered billing exclusion be enforced automatically at invoice generation, or remain a manual Finance review step at MVP?

## 16. Decision History

| Version | Date | Decision |
|---|---|---|
| 0.1 | 2026-07-30 | Initial lite draft, seeded from stakeholder SRS §4.4/§4.5 and scoped to only what the Asset Registry's lock/certificate hooks and Contract Management's Check-Out gate require; workshop/costing/parts automation explicitly deferred. |
