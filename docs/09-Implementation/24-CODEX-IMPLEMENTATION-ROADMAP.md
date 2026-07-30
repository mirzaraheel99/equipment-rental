# 24 — Codex Implementation Roadmap

**Document ID:** ERMS-DEV-001  
**Version:** 0.1  
**Status:** Working Draft  
**Primary Market:** Saudi Arabia  
**Execution Model:** Claude Code / Codex-assisted implementation  
**Architecture:** Modular monolith, API-first, multi-tenant, domain-driven  
**Purpose:** Define the complete implementation sequence, phase gates, deliverables, prerequisites, testing requirements, documentation updates, rollback expectations, and definition of done for building ERMS safely and incrementally.

---

## 1. Purpose

This document translates the approved product, domain, data, API, UX, security, and architecture specifications into an executable build sequence.

It is designed to prevent Claude Code or Codex from:

- Starting with random screens
- Creating duplicate entities
- Inventing unresolved requirements
- Building features before foundations exist
- Mixing domain ownership
- Skipping security or audit
- Hardcoding Saudi rules
- Creating fragile migrations
- Implementing UI before APIs and states are defined
- Advancing to later phases without passing quality gates

No phase may begin until its prerequisites are met.

---

## 2. Implementation Philosophy

### 2.1 Specification First

Every implementation task must reference:

- Product requirement
- Domain specification
- Database entity
- API contract
- Route or screen
- Permission
- Audit event
- Acceptance criteria

### 2.2 Build Vertically, Not Horizontally

A feature is delivered end to end:

```text
Requirement
→ Data
→ Domain Logic
→ API
→ Permission
→ Audit
→ UI
→ Tests
→ Documentation
```

Do not build all database tables first, then all APIs, then all screens without functional validation.

### 2.3 Modular Monolith First

The first release uses one deployable backend with strict internal domain boundaries.

Do not introduce microservices unless:

- A documented operational need exists
- Data ownership is stable
- Failure isolation is required
- Independent scaling is justified
- Extraction cost is approved

### 2.4 No Silent Assumptions

If an implementation task encounters an unresolved requirement:

1. Stop.
2. Add or update the Open Questions Register.
3. Describe the impact.
4. Wait for an approved decision.

### 2.5 Security and Audit Are Foundation Work

RBAC, tenant isolation, and audit must exist before operational modules are built.

They are not final-stage hardening tasks.

---

## 3. Repository Structure

Recommended monorepo:

```text
erms/
├── apps/
│   ├── web/
│   ├── api/
│   ├── worker/
│   ├── customer-portal/
│   └── mobile-pwa/
│
├── packages/
│   ├── ui/
│   ├── config/
│   ├── types/
│   ├── validation/
│   ├── api-client/
│   ├── auth/
│   ├── observability/
│   ├── localization/
│   ├── testing/
│   └── domain-contracts/
│
├── infrastructure/
│   ├── terraform/
│   ├── docker/
│   ├── environments/
│   └── scripts/
│
├── docs/
│   ├── foundation/
│   ├── product/
│   ├── domains/
│   ├── architecture/
│   ├── data/
│   ├── api/
│   ├── ux/
│   ├── security/
│   ├── implementation/
│   └── registers/
│
├── tooling/
├── .github/
├── CLAUDE.md
├── README.md
└── package.json
```

---

## 4. Global Phase Gates

Every phase must pass the following before closure.

### 4.1 Functional Gate

- Acceptance criteria pass
- Required workflows operate end to end
- Error and exception paths are tested
- No unresolved critical defects

### 4.2 Security Gate

- Permissions tested
- Tenant isolation tested
- Sensitive actions audited
- No unauthorized data exposure
- Threat considerations documented

### 4.3 Data Gate

- Migration reviewed
- Constraints present
- Indexes reviewed
- Rollback plan exists
- Seed or test data updated

### 4.4 API Gate

- OpenAPI updated
- Request/response schemas validated
- Errors standardized
- Idempotency added where needed
- API tests pass

### 4.5 UX Gate

- Loading, empty, error, and success states exist
- Accessibility checks pass
- Arabic and RTL reviewed where applicable
- Mobile behavior reviewed where applicable

### 4.6 Observability Gate

- Structured logging
- Correlation IDs
- Metrics
- alerts for critical failures
- background-job visibility

### 4.7 Documentation Gate

- Domain docs updated
- Database dictionary updated
- API registry updated
- Route registry updated
- Permission registry updated
- Event registry updated
- Decision or change log updated

---

# 5. Phase 00 — Planning Repository Consolidation

## Objective

Create one trusted documentation repository before code exists.

## Prerequisites

- Market analysis draft
- Product strategy draft
- Product scope draft
- Module map draft
- Core domain specifications
- Data, API, UX, and architecture drafts

## Tasks

- Consolidate all Markdown documents
- Assign stable document IDs
- Normalize terminology
- Add document metadata
- Cross-link dependencies
- Create master index
- Create decision register
- Create assumption register
- Create open-question register
- Create requirements traceability matrix
- Create glossary
- Create change log
- Identify conflicts between documents

## Deliverables

- `MASTER-INDEX.md`
- `GLOSSARY.md`
- `DECISION-REGISTER.md`
- `ASSUMPTIONS-REGISTER.md`
- `OPEN-QUESTIONS-REGISTER.md`
- `REQUIREMENTS-TRACEABILITY-MATRIX.md`
- `CHANGELOG.md`

## Definition of Done

- No duplicate document IDs
- All source documents indexed
- Critical conflicts identified
- Coding status explicitly marked as unauthorized

---

# 6. Phase 01 — Project Bootstrap

## Objective

Create a production-capable monorepo with development standards and environment foundations.

## Tasks

### Repository

- Initialize monorepo
- Configure package manager
- Configure TypeScript strict mode
- Configure linting
- Configure formatting
- Configure commit hooks
- Configure conventional commits
- Configure dependency policies

### Applications

Create empty foundations for:

- Web app
- API app
- Worker app
- Customer portal
- Shared UI package
- Shared types
- Shared validation
- API client

### Local Development

- Docker Compose
- PostgreSQL
- Redis
- object-storage emulator
- email emulator
- malware-scan development stub
- environment-variable templates

### CI

- Install
- lint
- type check
- unit test
- build
- dependency audit
- migration check

## Files to Create

```text
package.json
turbo.json or equivalent
tsconfig.base.json
eslint.config.*
prettier.config.*
docker-compose.yml
.env.example
.github/workflows/ci.yml
```

## Tests

- Monorepo builds from clean clone
- Development stack starts
- CI passes
- Environment validation fails safely when secrets are missing

## Definition of Done

A new developer can clone, configure, start, test, and build the project using documented commands.

---

# 7. Phase 02 — Platform Core

## Objective

Build foundational services shared by every domain.

## Scope

- Tenant
- Legal entity
- Branch
- Department
- Settings
- Localization
- Document storage
- Notifications
- Audit
- Outbox events
- Background jobs
- Observability

## Tasks

### Tenant Foundation

- Tenant context middleware
- Tenant-aware repositories
- Tenant-safe query utilities
- Tenant test fixtures
- Cross-tenant access tests

### Organization Foundation

- Legal entities
- branches
- departments
- organization hierarchy

### Audit

- Append-only audit event model
- Audit service
- Entity-diff utility
- Correlation IDs
- Sensitive access logging

### Documents

- Upload metadata
- object storage
- content hashing
- versioning
- malware scan workflow
- access audit

### Events

- Domain event contract
- transactional outbox
- publisher worker
- retry
- dead-letter handling

### Notifications

- Template model
- delivery abstraction
- email provider stub
- SMS/WhatsApp adapters as future interfaces

## Definition of Done

Every later domain can rely on tenant scope, audit, document, event, notification, and background-job foundations.

---

# 8. Phase 03 — Authentication, RBAC, and Governance

## Objective

Implement secure identity and authorization before business operations.

## Scope

- User accounts
- Sessions
- OIDC
- MFA
- Roles
- Permissions
- Scope
- Approval engine
- Delegation
- Security audit

## Tasks

- Local development identity provider
- Microsoft Entra ID integration interface
- OIDC session flow
- secure token handling
- session expiry
- refresh and revocation
- MFA policy hooks
- user provisioning
- role management
- permission registry
- branch/legal entity/project scopes
- ABAC evaluation
- route and API guards
- approval workflow
- delegated approvals
- privileged action reauthentication
- permission-change audit

## Required Tests

- Unauthorized endpoint access
- Cross-tenant denial
- Cross-branch denial
- Expired session
- revoked role
- delegated approval expiry
- permission escalation attempt
- customer portal scope isolation

## Definition of Done

No protected business endpoint can operate without authenticated, authorized, tenant-scoped server context.

---

# 9. Phase 04 — Design System and Application Shell

## Objective

Build the reusable frontend foundation before module screens.

## Scope

- Design tokens
- typography
- spacing
- status badges
- buttons
- inputs
- forms
- tables
- drawers
- dialogs
- app shell
- command palette
- workspace switcher
- language and RTL
- accessibility

## Tasks

- Implement token system
- Light/dark/system themes
- English and Arabic layout
- Shared app shell
- Global header
- Command palette
- Scope selector
- Notification shell
- Approval shell
- Data table foundation
- Form foundation
- Status system
- Loading/empty/error patterns
- Storybook
- Accessibility baseline

## Required Stories

Each shared component must include:

- Default
- loading
- disabled
- error
- compact
- dense
- dark
- RTL
- keyboard interaction

## Definition of Done

No module needs to create its own basic button, form, table, modal, status, or page-shell implementation.

---

# 10. Phase 05 — Asset Registry Foundation

## Objective

Deliver the single authoritative Asset Registry.

## Scope

- Categories
- Manufacturers
- Models
- Assets
- Status
- Location
- Meters
- Documents
- Timeline
- QR/barcode

## Backend Tasks

- Asset schema
- controlled statuses
- state transition service
- optimistic locking
- location service
- meter service
- status history
- asset documents
- search
- event publishing

## Frontend Tasks

- Asset list
- asset creation
- asset 360°
- availability shell
- document tab
- timeline
- transfer flow
- scanning entry point

## Critical Rules

- One current status
- One current location
- No direct status update
- No cross-tenant asset reference
- Status changes audited
- Concurrent transitions rejected safely

## Tests

- Duplicate serial
- invalid status transition
- stale row version
- cross-module lock simulation
- meter rollback
- expired certificate visibility
- Arabic asset fields

## Definition of Done

A serialized asset can be onboarded, located, updated through controlled transitions, searched, audited, and viewed from one authoritative record.

---

# 11. Phase 06 — Customer and Corporate Account

## Objective

Deliver customer identity, hierarchy, contacts, credit profile, documents, and portal ownership.

## Backend Tasks

- Customer schema
- corporate hierarchy
- contact roles
- signatory authority
- billing profile
- credit profile
- customer documents
- risk flags
- duplicate detection
- merge workflow

## Frontend Tasks

- Customer list
- customer onboarding
- customer 360°
- contacts
- credit
- documents
- portal users
- duplicate review

## Tests

- Duplicate VAT/CR
- hierarchy cycle
- expired signatory
- credit hold
- merge preservation
- sensitive document access
- portal scope

## Definition of Done

Every contract and rental can reference one verified, governed customer identity.

---

# 12. Phase 07 — Project and Jobsite Foundation

## Objective

Support corporate project-rental context.

## Scope

- Projects
- jobsites
- customer POs
- cost centers
- project documents
- access rules
- project status

## Deliverables

- Project list
- project 360°
- jobsite detail
- PO register
- project equipment placeholder
- project dashboard shell

## Tests

- PO expiry
- PO ceiling
- customer-project mismatch
- jobsite access scope
- project closure restrictions

---

# 13. Phase 08 — Pricing Engine

## Objective

Build deterministic, testable pricing before contracts and invoices depend on it.

## Scope

- Rate cards
- inheritance
- billing units
- discounts
- deposits
- transport
- operator charges
- standby
- overage
- taxes
- pricing snapshots
- approval triggers

## Tasks

- Calculation engine
- Rule versioning
- Pricing simulation
- Margin calculation
- Price floor
- Override approval
- Test-vector library

## Required Test Vectors

- 10-day weekly plus daily rental
- 28-day cycle
- partial month
- operating-hour overage
- customer rate override
- project rate override
- below-floor approval
- VAT-inclusive
- VAT-exclusive
- waived deposit
- transport round trip
- operator overtime
- standby day

## Definition of Done

Given identical governed inputs and rule versions, the engine returns identical explainable results.

---

# 14. Phase 09 — Contract Management

## Objective

Deliver versioned, approved, signable contracts.

## Scope

- Contract types
- templates
- clause library
- contract hierarchy
- lines
- parties
- approvals
- signatures
- insurance
- deposits
- amendments
- extensions
- termination
- closure

## Tasks

- Contract builder
- pricing snapshot integration
- customer and project validation
- PO and ceiling validation
- approval routing
- document generation
- bilingual contract rendering
- e-signature adapter
- immutable versions
- amendment comparison

## Critical Tests

- Signed version cannot change
- Clause version preserved
- Signatory authority expired
- Amendment creates new version
- Contract ceiling exceeded
- Insurance insufficient
- Deposit waiver approval
- bilingual document consistency

## Definition of Done

A contract can move from draft through approval, signature, activation, amendment, and closure without modifying signed history.

---

# 15. Phase 10 — Availability and Reservation

## Objective

Deliver trustworthy availability and double-booking prevention.

## Scope

- Availability search
- reservation
- temporary holds
- future commitments
- maintenance locks
- PPM windows
- allocation candidates

## Tasks

- Availability query model
- conflict engine
- temporary hold expiry
- reservation lines
- category-based reservation
- specific-asset reservation
- alternative asset suggestions
- allocation workspace

## Concurrency Tests

- Two users reserve same asset
- PPM lock races reservation
- Transfer changes availability
- Temporary hold expires
- Return buffer overlaps booking

## Definition of Done

The system cannot confirm conflicting commitments for the same serialized asset.

---

# 16. Phase 11 — Rental Operations

## Objective

Deliver checkout, active rental, extensions, off-hire, returns, and damage evidence.

## Scope

- Rental activation
- asset allocation
- checkout
- active rental
- extension
- substitution
- off-hire
- return
- inspection handoff
- ready-to-rent handoff

## Tasks

- Checkout checklist
- photos
- meter/fuel
- signed contract check
- certificate validation
- customer eligibility
- active rental timeline
- overdue rules
- extension request
- substitution
- partial return
- return inspection
- damage comparison

## Definition of Done

A rental can move from reservation through return with complete evidence, history, and controlled asset state transitions.

---

# 17. Phase 12 — Dispatch, Logistics, and Yard

## Objective

Deliver physical equipment movement.

## Scope

- Dispatch orders
- delivery
- pickup
- transfers
- trucks
- trailers
- drivers
- staging
- loading
- POD
- yard receiving

## Tasks

- Dispatch board
- route planning interface
- assignment
- mobile driver workspace
- yard staging
- receiving
- proof of delivery
- GPS capture
- failed delivery
- branch transfer

## Tests

- Capacity constraints
- driver-license expiry
- duplicate assignment
- POD required
- partial delivery
- failed delivery
- transfer custody

## Definition of Done

Every physical movement is scheduled, assigned, evidenced, and auditable.

---

# 18. Phase 13 — Maintenance, Workshop, and PPM

## Objective

Deliver maintenance controls that protect safety and availability.

## Scope

- Maintenance requests
- work orders
- PPM
- inspections
- certificates
- technicians
- labor
- parts
- warranty
- ready-to-rent

## Tasks

- Work order workflow
- technician mobile workspace
- workshop board
- PPM scheduler
- certificate expiry
- parts reservation
- labor capture
- inspection templates
- ready-to-rent approval
- downtime metrics

## Definition of Done

An asset cannot become rentable while blocked by unresolved maintenance, inspection, PPM, or certificate requirements.

---

# 19. Phase 14 — Inventory and Warehouse

## Objective

Deliver stock accuracy and maintenance-parts support.

## Scope

- Items
- warehouses
- bins
- balances
- transactions
- reservations
- transfers
- cycle counts
- reorder

## Tasks

- Stock ledger
- immutable transactions
- balance projection
- reservation
- issue to work order
- receipt
- transfer
- count and adjustment
- reorder recommendations
- barcode/QR

## Tests

- Negative inventory prevention
- concurrent issue
- reversal
- reserved stock
- cycle-count variance
- cross-branch transfer

---

# 20. Phase 15 — Billing, Payments, and Receivables

## Objective

Convert approved commercial activity into governed financial records.

## Scope

- Billing runs
- invoices
- invoice lines
- tax
- ZATCA
- payments
- allocation
- deposits
- refunds
- credit/debit notes
- statements
- collections

## Tasks

- Cycle billing engine
- invoice generation
- duplicate-billing prevention
- tax document model
- ZATCA adapter
- payment gateway adapter
- payment allocation
- deposit reconciliation
- credit/debit notes
- refunds
- AR aging
- collection cases
- accounting export

## Critical Tests

- Duplicate billing run
- partial return
- extension billing
- credit note
- deposit application
- partial payment
- multi-invoice allocation
- ZATCA retry
- idempotent payment webhook

## Definition of Done

Every financial transaction is traceable to source contract, rental activity, pricing snapshot, and approval.

---

# 21. Phase 16 — Reporting and Command Centers

## Objective

Deliver role-based operational intelligence.

## Scope

- KPI registry
- dashboards
- widgets
- saved views
- alerts
- reports
- export
- scheduled reports

## Tasks

- Semantic KPI definitions
- Executive dashboard
- Fleet dashboard
- Rental dashboard
- Dispatch dashboard
- Maintenance dashboard
- Finance dashboard
- Inventory dashboard
- Compliance dashboard
- Drill-through
- Report scheduling
- Power BI connector interface

## Definition of Done

Every KPI is defined, permission-filtered, drillable, and traceable to governed source data.

---

# 22. Phase 17 — Customer Portal

## Objective

Deliver secure self-service for corporate customers.

## Scope

- Portal home
- projects
- contracts
- signatures
- rentals
- extension
- off-hire
- breakdown
- invoices
- payments
- documents
- portal users

## Tasks

- Customer-scoped identity
- portal roles
- entity/project access
- document access
- signature
- requests
- notification preferences
- portal branding
- Arabic/English
- responsive behavior

## Definition of Done

A portal user can access only explicitly authorized customer entities, projects, contracts, and documents.

---

# 23. Phase 18 — Integrations

## Objective

Connect external platforms through stable adapters.

## Initial Adapters

- Payment gateway
- ZATCA
- Accounting
- Email
- SMS
- WhatsApp
- Maps
- E-signature
- Telematics
- Microsoft Entra ID

## Rules

- Provider-specific code remains behind interfaces.
- Retries are idempotent.
- Integration state is observable.
- Secrets are externally managed.
- Raw provider payloads are protected.
- Failures do not silently corrupt domain state.

---

# 24. Phase 19 — Data Migration

## Objective

Migrate approved legacy data safely.

## Tasks

- Source profiling
- field mapping
- cleansing
- duplicate strategy
- validation rules
- trial migration
- reconciliation
- exception handling
- business sign-off
- production cutover

## Migration Order

1. Reference data
2. Organization
3. Users
4. Customers
5. Assets
6. Projects
7. Contracts
8. Active rentals
9. Maintenance history
10. Inventory
11. Open invoices and balances
12. Documents
13. Audit source references

## Definition of Done

Source and target totals reconcile within approved tolerances, and all exceptions are documented.

---

# 25. Phase 20 — Production Hardening

## Objective

Prepare ERMS for production use.

## Scope

- Performance
- security
- resilience
- backup
- restore
- monitoring
- alerting
- incident response
- operational support

## Tasks

- Load testing
- concurrency testing
- penetration testing
- dependency audit
- backup automation
- restore drill
- disaster recovery exercise
- queue recovery
- integration-failure simulation
- log retention
- alert tuning
- runbooks
- support escalation
- production access controls

---

# 26. Phase 21 — UAT and Pilot Rollout

## Objective

Validate the system against real operational workflows.

## Pilot Strategy

Start with:

- One legal entity
- One or two branches
- Selected equipment categories
- Controlled user group
- Limited customer set
- Parallel reconciliation where necessary

## UAT Scenarios

- Customer onboarding
- Asset onboarding
- Quote/pricing
- Contract approval
- Signature
- Reservation
- Dispatch
- Checkout
- Extension
- Breakdown
- Return
- Damage
- Maintenance
- Invoice
- Payment
- Deposit release
- Reporting
- Audit

## Exit Criteria

- Critical workflows approved
- No severity-one defects
- Financial reconciliation accepted
- Operational support ready
- Training completed
- Cutover approved

---

# 27. Phase 22 — Production Launch

## Objective

Launch safely with rollback readiness.

## Cutover Checklist

- Final backup
- migration complete
- reconciliation complete
- DNS and certificates
- integrations enabled
- users provisioned
- roles verified
- monitoring active
- support bridge active
- rollback decision point defined
- stakeholder sign-off

## Hypercare

- Daily defect review
- integration monitoring
- billing review
- user adoption
- support response
- data quality
- performance
- security events

---

# 28. Claude Code / Codex Task Format

Every implementation task must use this structure.

```markdown
# Task: [Title]

## Objective

## Source Documents

## Requirement IDs

## Prerequisites

## In Scope

## Out of Scope

## Files to Create

## Files to Modify

## Database Changes

## API Changes

## UI Changes

## RBAC Changes

## Audit Changes

## Events

## Validation Rules

## Error Cases

## Tests

## Acceptance Criteria

## Documentation Updates

## Rollback Notes
```

---

# 29. Claude Code / Codex Execution Rules

Claude or Codex must:

- Work on one approved task at a time.
- Read source documents before editing.
- State affected files before changes.
- Avoid unrelated refactoring.
- Preserve existing behavior unless change is approved.
- Add tests with the implementation.
- Update documentation with the implementation.
- Report unresolved conflicts.
- Never skip tenant filtering.
- Never bypass RBAC.
- Never bypass audit.
- Never modify signed or financial history in place.
- Never introduce a new dependency without justification.
- Never create a new status without registry updates.
- Never create a new route, endpoint, event, permission, or table without updating its registry.

---

# 30. Definition of Ready

A task is ready only when:

- Requirement is approved
- Domain owner is known
- Data ownership is known
- API contract exists
- Screen or consumer is known
- Permission is defined
- Audit behavior is defined
- Acceptance criteria exist
- Open questions are resolved
- Dependencies are available

---

# 31. Definition of Done

A task is done only when:

- Code reviewed
- Tests pass
- Type checks pass
- Lint passes
- Migration reviewed
- Security tests pass
- Tenant tests pass
- Audit verified
- OpenAPI updated
- UI states complete
- Arabic/RTL tested where relevant
- Accessibility tested where relevant
- Observability added
- Documentation updated
- Rollback documented
- Acceptance criteria signed off

---

# 32. Release Governance

## Release Types

- Patch
- Minor
- Major
- Emergency hotfix

## Required Release Artifacts

- Release notes
- migration plan
- rollback plan
- test evidence
- security review
- deployment approval
- monitoring plan
- known issues
- customer communication where applicable

---

# 33. Prioritization Framework

Use the following order:

1. Safety
2. Legal and compliance
3. Financial integrity
4. Security
5. Operational blockers
6. Data integrity
7. Customer commitments
8. Efficiency
9. Reporting
10. Enhancement

Do not prioritize visually impressive features over operational correctness.

---

# 34. Recommended MVP Boundary

The first controlled MVP should include:

- Tenant and organization
- Authentication and RBAC
- Audit
- Asset Registry
- Customer
- Project/jobsite
- Pricing foundation
- Contract
- Availability
- Reservation
- Checkout
- Active rental
- Return
- Basic dispatch
- Basic maintenance
- Invoice generation
- Payment recording
- Core dashboards
- Arabic/English
- Document storage
- Notifications

May be deferred from MVP:

- Advanced route optimization
- Full offline support
- Predictive maintenance
- AI damage analysis
- Natural-language analytics
- Marketplace
- Multi-provider telematics hub
- Advanced Power BI embedding
- Multi-country tax adapters beyond Saudi Arabia
- Rental-to-own
- Complex manpower scheduling

---

# 35. Acceptance Criteria

This roadmap is approved when:

1. Every major domain has an implementation phase.
2. Platform, security, and audit precede business modules.
3. Pricing precedes signed commercial dependencies.
4. Contracts precede rental activation.
5. Availability and concurrency are tested before live reservations.
6. Finance includes idempotency and source traceability.
7. Every phase has prerequisites and definition of done.
8. Claude/Codex task format is standardized.
9. Production hardening and UAT are explicit phases.
10. No production launch can occur without rollback and reconciliation.

---

# 36. Next Document

The next document should be:

**25 — Implementation Pack 01: Project Bootstrap**

This will be the first executable Codex package and will define:

- Exact repository commands
- exact folder tree
- package choices
- configuration files
- local infrastructure
- environment variables
- CI workflow
- lint/type/test/build commands
- files to create
- acceptance tests
- completion checklist

It should still remain implementation guidance until coding is explicitly authorized.
