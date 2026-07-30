# 07 — Contract Management Domain Specification

**Document ID:** ERMS-DOM-003  
**Version:** 0.1  
**Status:** Working Draft  
**Primary Market:** Saudi Arabia  
**Domain Owner:** Contract Management Domain  
**Depends On:** Customer & Corporate Account, Asset Registry, Pricing, Project, Document, Identity, RBAC, Audit  
**Feeds:** Rental, Dispatch, Billing, Finance, Customer Portal, Reporting, Compliance, Notifications

---

## 1. Purpose

This document defines the Contract Management domain for the Equipment Rental Management System (ERMS).

The domain is responsible for creating, negotiating, approving, signing, activating, amending, suspending, extending, terminating, and closing legally and commercially binding rental agreements.

The domain must support:

- Short-term counter rental contracts
- Long-term corporate contracts
- Master rental agreements
- Project-specific agreements
- Call-off orders
- Multi-asset contracts
- Phased mobilization
- Partial dispatch and return
- Equipment substitution
- Contract extensions
- Contract amendments
- Cycle billing
- Deposits
- Insurance and loss damage waiver
- Category-specific liability clauses
- Bilingual contract documents
- Electronic signatures
- Versioning
- Immutable signed terms
- Complete audit history

The Contract Domain is the authoritative source for signed commercial obligations between the rental company and the customer.

---

## 2. Core Contract Principle

A signed contract must never be edited in place.

Once signed:

- Commercial terms become immutable.
- Legal clauses become immutable.
- Pricing snapshots become immutable.
- Signatures remain attached to the exact signed version.
- Any change must occur through a formal amendment, extension, substitution, or termination workflow.
- The original signed version must remain permanently retrievable.

The system shall maintain a complete version chain for every contract.

---

## 3. Business Context

Equipment-rental contracts in Saudi Arabia may range from a one-day small-equipment rental to a multi-month corporate project involving:

- Multiple equipment categories
- Operators and technicians
- Transport and mobilization
- Project-specific rates
- Customer purchase orders
- Contract ceilings
- Insurance requirements
- Monthly billing
- Equipment substitutions
- Partial returns
- Downtime and standby rules
- Safety and compliance obligations
- Arabic and English documents
- Customer-specific supporting-document requirements

The contract engine must therefore support more than a printable rental form.

---

## 4. Scope

### 4.1 In Scope

The Contract Domain shall support:

- Contract types
- Contract templates
- Master agreements
- Project agreements
- Rental contracts
- Call-off orders
- Contract line items
- Multi-asset contracts
- Unassigned category-based lines before serial allocation
- Commercial terms
- Pricing snapshots
- Customer-specific terms
- Project-specific terms
- Purchase order references
- Contract ceilings
- Deposits
- Insurance requirements
- COI validation
- LDW acceptance
- Liability clauses
- Indemnification clauses
- Operator/manpower clauses
- Delivery and collection terms
- Extension rules
- Substitution rules
- Amendment workflow
- Termination workflow
- Suspension workflow
- Signature workflow
- Document generation
- Contract numbering
- Contract versioning
- Bilingual documents
- Contract status management
- Approval workflow
- Audit trail
- Customer portal access
- Contract search and reporting

### 4.2 Out of Scope

The Contract Domain does not own:

- Asset master data
- Asset physical status
- Rate calculation logic
- Invoice generation
- Payment processing
- Project master data
- Dispatch execution
- Maintenance work orders
- General ledger
- Customer credit master data

It references those domains through governed APIs and events.

---

## 5. Contract Types

The system shall support configurable contract types.

Minimum types:

1. Standard Rental Contract
2. Corporate Rental Contract
3. Master Rental Agreement
4. Project Rental Agreement
5. Call-Off Order
6. Framework Agreement
7. Equipment-with-Operator Contract
8. Dry Hire Contract
9. Wet Hire Contract
10. Service-and-Rental Contract
11. Trial or Demonstration Agreement
12. Internal Group Rental Agreement
13. Sub-Rental Agreement
14. Emergency Rental Agreement
15. Used Equipment Sale Agreement
16. Rental-to-Own Agreement, future option

Each contract type may define:

- Required fields
- Allowed customer types
- Required approvals
- Allowed pricing structures
- Required documents
- Required clauses
- Signature sequence
- billing behavior
- extension rules
- termination rules
- country compliance adapter
- document template

---

## 6. Contract Hierarchy

The domain shall support hierarchical contract structures.

Example:

```text
Master Rental Agreement
└── Project Rental Agreement
    ├── Call-Off Order 001
    │   ├── Asset Line 1
    │   ├── Asset Line 2
    │   └── Operator Line 1
    ├── Call-Off Order 002
    └── Amendment 001
```

### 6.1 Hierarchy Rules

- A master agreement may govern multiple projects.
- A project agreement may inherit terms from a master agreement.
- A call-off order may inherit approved rates, clauses, and payment terms.
- Inherited terms may be overridden only when permitted.
- Overrides may require approval.
- Child contracts must record the source of inherited terms.
- Expired parent agreements must restrict creation of new child contracts unless formally extended.
- Existing active child contracts may continue only if explicitly allowed by the parent agreement.

---

## 7. Contract Identity

Each contract shall have:

- Contract ID
- Contract Number
- Tenant ID
- Legal Entity ID
- Customer ID
- Customer Legal Entity
- Contract Type
- Parent Contract ID, where applicable
- Project ID
- Jobsite ID
- Customer PO Number
- Contract Status
- Contract Version
- Original Version ID
- Effective Date
- Start Date
- Expected End Date
- Actual End Date
- Currency
- Tax Treatment
- Language
- Governing Law
- Branch
- Account Owner
- Created By
- Created Date
- Last Updated
- Signed Date
- Activated Date
- Closed Date

Contract numbers must be unique within the configured numbering scope.

---

## 8. Contract Numbering

The system shall support configurable numbering schemes.

Example:

```text
KSA-RYD-RNT-2026-000123
```

Possible components:

- Country
- Legal Entity
- Branch
- Contract Type
- Year
- Sequence

Rules:

- Contract numbers are non-reusable.
- Voided contracts retain their number.
- Amendments receive linked amendment numbers.
- Numbering configuration changes must not alter historical numbers.
- Imported legacy contracts may retain external identifiers plus a system-generated ID.

---

## 9. Contract Lifecycle

### 9.1 Minimum Contract States

- Draft
- Pending Internal Review
- Pending Commercial Approval
- Pending Credit Approval
- Pending Compliance
- Pending Customer Review
- Pending Signature
- Partially Signed
- Signed
- Active
- Suspended
- Amendment Pending
- Extended
- Termination Pending
- Terminated
- Expired
- Closed
- Cancelled
- Voided
- Archived

### 9.2 State Rules

#### Draft

Editable by authorized users.

#### Pending Internal Review

The contract is under operational, legal, commercial, finance, or compliance review.

#### Pending Commercial Approval

Required when:

- Rate below floor
- Discount above threshold
- deposit reduced
- non-standard payment terms
- liability clause modified
- contract value exceeds authority
- free or waived charges exist

#### Pending Credit Approval

Required when:

- Customer uses credit terms
- Contract increases exposure
- Credit limit is exceeded
- Customer is on hold
- Temporary limit is needed

#### Pending Compliance

Required documents or checks are incomplete.

#### Pending Customer Review

Contract shared with customer but not yet submitted for signature.

#### Pending Signature

All internal approvals complete and contract is ready for signature.

#### Partially Signed

One required party has signed.

#### Signed

All required signatures complete, but operational activation may still be pending.

#### Active

Contract is legally active and operationally eligible for dispatch, subject to all checkout rules.

#### Suspended

Temporary block on new dispatch, extension, or billing actions as configured.

#### Amendment Pending

A change is being negotiated while the current signed version remains authoritative.

#### Terminated

Contract ended before scheduled completion.

#### Expired

Contract end date passed without formal extension.

#### Closed

All assets returned, charges reconciled, obligations resolved, and closure approved.

#### Cancelled

Contract cancelled before activation.

#### Voided

Contract invalidated through approved legal or administrative action while retaining full history.

---

## 10. Contract Parties

The system shall support multiple parties.

Possible party roles:

- Rental Company
- Customer
- Customer Subsidiary
- Guarantor
- Joint Venture Partner
- Equipment Owner
- Subcontractor
- Operator Provider
- Transport Provider
- Insurer
- Authorized Signatory
- Witness
- Project Consultant
- Government Entity

Each party must have:

- Party ID
- Role
- Legal name
- registration details
- address
- authorized signatory
- signature requirement
- responsibility scope
- effective dates

---

## 11. Contract Line Items

A contract may contain:

- Serialized equipment
- Equipment category placeholders
- Bulk tools
- Attachments
- Kits
- Bundles
- Operators
- Drivers
- Technicians
- Transport
- Mobilization
- Demobilization
- Setup
- Fuel
- Consumables
- Safety equipment
- Maintenance service
- Standby
- Overtime
- Insurance
- LDW
- Deposits
- Damage charges
- Other fees

### 11.1 Line Item Fields

- Line ID
- Contract ID
- Item Type
- Asset ID, if assigned
- Category ID
- Model ID
- Quantity
- Unit
- Billing Frequency
- Start Date
- End Date
- Rate Source
- Rate
- Discount
- Tax
- Deposit
- Replacement Value
- Meter Allowance
- Overage Rate
- Standby Rate
- Overtime Rate
- Mobilization Charge
- Demobilization Charge
- Customer PO Line Reference
- Project Code
- Cost Center
- Status
- Notes

### 11.2 Allocation Model

The contract may be created before a specific serial-numbered asset is assigned.

Example:

```text
2 × 20-ton excavators
```

Later, Rental or Dispatch allocates actual assets.

The Contract Domain owns the commercial commitment.  
The Asset and Rental Domains own actual asset allocation and availability.

---

## 12. Multi-Asset Contract Rules

The system shall support contracts with multiple assets and independent line-level timelines.

Each asset may:

- Dispatch on a different date
- Arrive at a different jobsite
- Return early
- Be extended
- Be substituted
- Be suspended
- Be under repair
- Be partially billed
- Be closed separately

The master contract remains active until all obligations are resolved.

---

## 13. Commercial Terms Snapshot

At the time of signature, the system shall snapshot:

- Rates
- discounts
- taxes
- fees
- deposits
- payment terms
- billing frequency
- grace periods
- overage rules
- standby rules
- overtime rules
- fuel rules
- transport charges
- liability terms
- insurance requirements
- document requirements
- customer PO details
- contract ceiling
- currency
- exchange-rate rule, if applicable

The signed snapshot must remain immutable.

---

## 14. Contract Templates

Templates may be defined by:

- Country
- legal entity
- branch
- contract type
- customer type
- equipment category
- risk level
- project type
- language
- government or private sector

Templates may contain:

- Header
- party information
- commercial terms
- equipment schedule
- pricing schedule
- payment terms
- liability clauses
- insurance clauses
- safety obligations
- operator clauses
- logistics terms
- signature blocks
- annexures
- certificate schedules

Template changes must be versioned.

---

## 15. Clause Library

The system shall support a controlled clause library.

Clause categories:

- General Terms
- Payment
- Liability
- Indemnity
- Insurance
- Damage
- Loss
- Theft
- Safety
- Operator Responsibility
- Fuel
- Maintenance
- Breakdown
- Replacement Equipment
- Standby
- Delays
- Access and Permits
- Transport
- Force Majeure
- Termination
- Dispute Resolution
- Governing Law
- Data Protection
- Confidentiality
- Tax
- Project-Specific Terms

Each clause shall have:

- Clause ID
- Version
- Language
- Effective Date
- Country
- Applicability Rules
- Approval Status
- Legal Owner
- Superseded Version
- Risk Classification

---

## 16. Category-Based Clause Rules

The system shall automatically attach clauses based on:

- Equipment category
- replacement value
- risk classification
- operator requirement
- transport requirement
- project type
- customer type
- country
- insurance status

Examples:

- Crane indemnification clause
- Lifting certificate requirement
- Generator fuel responsibility
- Operator liability
- High-value theft clause
- Hazardous-environment restrictions

Users must not manually remove mandatory clauses without authorized approval.

---

## 17. Insurance and COI

The contract shall validate customer insurance.

Checks may include:

- Policy active
- Expiry after contract end
- Coverage amount sufficient
- Equipment categories covered
- Project or jobsite covered
- Contracting entity covered
- Deductible accepted
- Verified certificate on file

If insurance is insufficient:

- Block contract
- require updated COI
- require LDW
- require elevated approval
- restrict high-value assets

The chosen outcome must be recorded in the signed contract.

---

## 18. Loss Damage Waiver

The system shall support configurable LDW rules.

Possible calculation methods:

- Percentage of rental charge
- Percentage of replacement value
- Flat amount
- Category-based amount
- Project-specific amount
- Customer-specific amount

LDW may be:

- Mandatory
- Optional
- Waived with approved COI
- Prohibited for certain categories
- Subject to deductible
- Subject to exclusions

LDW acceptance must be explicit and auditable.

---

## 19. Security Deposit

The contract shall support:

- Flat deposit
- Percentage of replacement value
- Percentage of contract value
- Customer-specific deposit
- Category-based deposit
- Project-level deposit
- Deposit waiver
- Bank guarantee
- Parent guarantee
- Letter of credit
- Cash deposit
- Card authorization hold

Deposit changes may require approval.

Deposit details shall include:

- Required amount
- approved amount
- method
- status
- transaction reference
- held date
- released date
- applied amount
- forfeited amount
- balance

Payment processing remains owned by Finance/Payment.

---

## 20. Contract Ceiling

Corporate contracts may have a maximum approved value.

The system shall track:

- Original ceiling
- amended ceiling
- committed amount
- billed amount
- unbilled accrual
- remaining amount
- pending extension exposure
- percentage consumed

Alerts:

- 75% consumed
- 90% consumed
- 100% consumed
- exceeded

New commitments above the ceiling must be blocked or approved through a formal amendment.

---

## 21. Customer Purchase Orders

The contract may require:

- PO number
- PO date
- PO value
- PO expiry
- PO currency
- PO lines
- project code
- cost center
- attachment
- customer approver
- remaining PO balance

The system shall validate:

- PO exists
- PO is active
- contract value fits within PO
- rental period fits within PO validity
- required line references exist
- extensions do not exceed PO limits

---

## 22. Effective Dates

The contract shall distinguish:

- Document creation date
- signature date
- effective date
- rental start date
- mobilization date
- billing start date
- expected end date
- notice date
- termination date
- closure date

These dates must not be treated as interchangeable.

---

## 23. Signature Workflow

The system shall support:

- Sequential signatures
- Parallel signatures
- Internal approval before customer signature
- Company signature
- Customer signature
- Guarantor signature
- Witness signature
- Multi-party signature
- Wet-signature upload
- Electronic signature provider
- OTP verification
- Identity verification
- Signature expiry
- Re-send
- Decline
- Withdraw
- Reissue

### 23.1 Signature Evidence

The system shall store:

- Signatory identity
- authority verification
- signature method
- timestamp
- IP
- device
- email/phone
- consent
- document hash
- signed version
- provider transaction ID
- completion certificate

---

## 24. Bilingual Contract Documents

The system shall support:

- Arabic-only
- English-only
- Bilingual Arabic/English

Requirements:

- Correct RTL
- consistent clause mapping
- no meaning mismatch
- legal review per language
- bilingual signature blocks
- bilingual asset schedules
- bilingual amounts and dates where configured
- stable pagination where possible

The system must record which language version was signed.

---

## 25. Contract Amendments

Amendments may include:

- Extend duration
- Add assets
- Remove assets
- Substitute assets
- Change project
- Change jobsite
- Change rates
- Change PO
- Increase ceiling
- Change billing frequency
- Change deposit
- Change insurance
- Change operator terms
- Change transport terms
- Change liability terms
- Change customer entity

### 25.1 Amendment Rules

- Original signed contract remains unchanged.
- Amendment receives a unique ID and version.
- Amendment must state changed sections.
- Amendment may require reapproval.
- Amendment may require new signatures.
- Effective date must be recorded.
- Pricing impact must be recalculated.
- Billing must use effective dates.
- Audit must link original and amended versions.

---

## 26. Contract Extensions

Extension workflow:

1. Customer requests extension.
2. Availability impact is checked.
3. Maintenance conflict is checked.
4. Pricing is recalculated.
5. PO and ceiling are checked.
6. Credit exposure is checked.
7. Approval is obtained.
8. Amendment is generated.
9. Signatures are collected.
10. Contract and rental timelines are updated.

An extension must not silently overwrite the original end date.

---

## 27. Asset Substitution

Substitution may occur because of:

- Breakdown
- Maintenance
- Customer request
- Availability issue
- Safety issue
- Upgrade
- Downgrade
- Branch transfer

The substitution record shall include:

- Original asset
- replacement asset
- reason
- effective date
- pricing impact
- meter readings
- condition evidence
- dispatch/collection events
- approvals
- customer acknowledgment

The commercial contract remains linked to both assets historically.

---

## 28. Partial Return

The system shall support returning one or more assets while the contract remains active.

For each returned asset:

- return date
- check-in evidence
- damage status
- meter status
- billing stop date
- charges
- deposit allocation
- replacement or closure status

---

## 29. Suspension

Contract suspension reasons may include:

- Credit hold
- Compliance issue
- Safety violation
- Legal dispute
- Customer request
- Site shutdown
- Force majeure
- Government order
- Equipment seizure
- Payment default

Suspension rules must define:

- Whether billing continues
- Whether standby applies
- Whether equipment may remain onsite
- Whether new dispatch is blocked
- Whether extensions are blocked
- Required approvals
- notification requirements

---

## 30. Termination

Termination types:

- Customer convenience
- Company convenience
- Breach
- Non-payment
- Safety breach
- Compliance breach
- Force majeure
- Mutual agreement
- Project cancellation

Termination workflow shall define:

- Notice period
- termination fee
- collection requirement
- final billing
- asset reconciliation
- deposit treatment
- damage claims
- document generation
- approvals
- signatures
- effective date

---

## 31. Contract Closure

A contract may close only when:

- All assets are returned or otherwise resolved.
- All dispatch and collection records are complete.
- All damage assessments are complete.
- Final meter and fuel charges are recorded.
- Final invoices are issued or approved for issue.
- Deposits are reconciled.
- Credit notes or refunds are resolved.
- Open disputes are resolved or formally transferred.
- Required documents are stored.
- Closure approval is complete.

---

## 32. Contract Document Generation

Generated documents may include:

- Draft Contract
- Final Contract
- Master Agreement
- Call-Off Order
- Amendment
- Extension
- Substitution Notice
- Suspension Notice
- Termination Notice
- Contract Summary
- Equipment Schedule
- Pricing Schedule
- Liability Annex
- Insurance Annex
- Signature Certificate
- Closure Statement

Each generated document shall store:

- Template version
- content version
- data snapshot
- language
- hash
- generated by
- generated date
- status
- signature status

---

## 33. RBAC Requirements

Example permissions:

- contract.view
- contract.create
- contract.edit_draft
- contract.submit
- contract.review
- contract.approve_commercial
- contract.approve_credit
- contract.approve_legal
- contract.approve_compliance
- contract.send_for_signature
- contract.sign_company
- contract.activate
- contract.suspend
- contract.amend
- contract.extend
- contract.substitute_asset
- contract.terminate
- contract.close
- contract.void
- contract.view_sensitive
- contract.export
- contract.audit.view
- contract.template.manage
- contract.clause.manage

Permissions must support:

- Tenant scope
- legal entity scope
- branch scope
- project scope
- customer scope
- contract value threshold
- discount threshold
- equipment risk level
- delegation

---

## 34. Approval Matrix

Approvals may depend on:

- Contract value
- discount
- price below floor
- customer risk
- credit exposure
- payment terms
- deposit waiver
- high-risk equipment
- non-standard clause
- contract duration
- project type
- government customer
- cross-border terms
- legal exception
- insurance exception

The approval engine must record:

- required approvers
- actual approvers
- sequence
- decision
- comments
- date/time
- delegation
- escalation
- expiry

---

## 35. Audit Requirements

Audit shall include:

- Contract creation
- field changes
- template selection
- clause insertion/removal
- pricing snapshot
- approvals
- rejections
- signature actions
- document generation
- activation
- suspension
- extension
- amendment
- substitution
- termination
- closure
- export
- voiding
- download of sensitive documents

Audit records must be immutable.

---

## 36. API Ownership

The Contract Domain owns APIs for:

- `/contracts`
- `/contracts/{id}`
- `/contracts/{id}/versions`
- `/contracts/{id}/lines`
- `/contracts/{id}/parties`
- `/contracts/{id}/approvals`
- `/contracts/{id}/signatures`
- `/contracts/{id}/amendments`
- `/contracts/{id}/extensions`
- `/contracts/{id}/substitutions`
- `/contracts/{id}/documents`
- `/contracts/{id}/insurance`
- `/contracts/{id}/deposits`
- `/contract-templates`
- `/contract-clauses`
- `/master-agreements`
- `/call-off-orders`

All APIs must enforce tenant and authorization scope.

---

## 37. Domain Events

Possible events:

- ContractCreated
- ContractSubmitted
- ContractApproved
- ContractRejected
- ContractSentForSignature
- ContractPartiallySigned
- ContractSigned
- ContractActivated
- ContractSuspended
- ContractAmendmentCreated
- ContractAmended
- ContractExtended
- ContractAssetSubstituted
- ContractTerminated
- ContractExpired
- ContractClosed
- ContractVoided
- ContractCeilingThresholdReached
- ContractCeilingExceeded
- ContractPOExpiring
- ContractInsuranceExpiring
- ContractSignatureExpired

---

## 38. Reporting and KPIs

Reports may include:

- Contracts by status
- Contracts by customer
- Contracts by project
- Contracts by branch
- Contract value
- Active exposure
- Expiring contracts
- Pending signatures
- Approval aging
- Amendment frequency
- Extension rate
- Contract ceiling utilization
- Contract profitability
- Contract disputes
- Deposit exposure
- Uninsured exposure
- Non-standard clause usage
- Contract cycle time
- Quote-to-contract conversion
- Contract closure aging

---

## 39. Dashboard Widgets

Possible widgets:

- Contracts Pending Signature
- Contracts Awaiting Approval
- Expiring Contracts
- Extensions Requested
- Contract Ceiling Risk
- PO Expiry Risk
- Insurance Expiry Risk
- Suspended Contracts
- High-Value Contracts
- Contracts with Non-Standard Terms
- Amendment Queue
- Closure Pending
- Contract Value by Project
- Contract Margin Risk

---

## 40. Non-Functional Requirements

### 40.1 Integrity

Signed documents and pricing snapshots must be immutable.

### 40.2 Availability

Contract lookup must remain available to Rental, Dispatch, Finance, and Customer Portal.

### 40.3 Security

Sensitive contracts and attachments require controlled access.

### 40.4 Performance

Contract summary views must load without retrieving all historical versions and documents.

### 40.5 Retention

Contracts, amendments, signatures, and audit history must follow legally approved retention rules.

### 40.6 Idempotency

Signature webhooks, document generation, activation, and amendment processing must be idempotent.

---

## 41. Acceptance Criteria

The Contract Management Domain specification is complete when:

1. Every signed contract is immutable.
2. All changes occur through formal versioned workflows.
3. Multi-asset contracts support independent asset timelines.
4. Master agreements, projects, and call-offs are supported.
5. Commercial terms are snapshotted at signature.
6. Customer PO and ceiling controls are defined.
7. Insurance and LDW rules are enforceable.
8. Deposits are contractually represented.
9. Signatory authority is validated.
10. Bilingual documents are supported.
11. Approval rules are configurable.
12. Suspension, termination, and closure are controlled.
13. All contract actions are auditable.
14. Contract data is accessible to other domains without duplicate ownership.
15. APIs and events are defined.
16. Open pricing and finance formulas are deferred explicitly to the Pricing and Finance specifications.

---

## 42. Dependencies

This domain depends on:

- Customer & Corporate Account
- Asset Registry
- Pricing
- Project
- RBAC
- Audit
- Document Storage
- Notifications
- E-Signature Integration
- Localization
- Credit and Finance services

This domain feeds:

- Rental
- Dispatch
- Billing
- Finance
- Customer Portal
- Reporting
- Compliance
- Notifications
- AI advisory services

---

## 43. Open Questions

1. Which contract types are mandatory for MVP?
2. Are wet-hire and operator-inclusive contracts required at launch?
3. Is a master agreement required before project contracts?
4. Can customer POs cover multiple contracts?
5. Is customer-side approval evidence required before invoice generation?
6. What contract values trigger executive approval?
7. Which clauses require legal approval if modified?
8. Is Arabic-only contracting legally or commercially sufficient for any customer type?
9. Which e-signature provider will be used?
10. Are wet signatures accepted and scanned?
11. Can one contract cover multiple customer legal entities?
12. Can one contract cover multiple projects?
13. Are standby and downtime rules standardized or customer-specific?
14. Is contract ceiling measured against committed, billed, or total forecast exposure?
15. Can a contract remain active after parent master agreement expiry?
16. What retention period applies to contract documents?
17. Who may void a signed contract?
18. Are operator timesheets contractual evidence?
19. Are contract templates legal-entity-specific?
20. Are rental-to-own agreements in future scope?

---

## 44. Decision History

| Version | Date | Decision |
|---|---|---|
| 0.1 | 2026-07-29 | Initial Contract Management Domain draft created |
