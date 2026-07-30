# 06 — Customer & Corporate Account Domain Specification

**Document ID:** ERMS-DOM-002  
**Version:** 0.1  
**Status:** Working Draft  
**Primary Market:** Saudi Arabia  
**Domain Owner:** Customer & Corporate Account Domain  
**Depends On:** Product Strategy, Product Scope, Product Module Map, Asset Registry Domain  
**Feeds:** Contract, Rental, Pricing, Project, Dispatch, Finance, Customer Portal, Reporting, Audit

---

## 1. Purpose

This document defines the Customer and Corporate Account domain for the Equipment Rental Management System (ERMS).

The domain is responsible for maintaining the authoritative business identity, hierarchy, contacts, commercial profile, credit profile, legal documents, communication preferences, account relationships, and customer history required to support rental, contract, project, billing, compliance, and customer-portal workflows.

The domain must support both:

- Individual or small-business customers
- Complex corporate accounts with subsidiaries, branches, projects, jobsites, authorized signatories, billing contacts, procurement contacts, and credit controls

The domain must provide a single, trusted customer record that can be used consistently across quotations, contracts, reservations, deliveries, invoices, payments, support cases, and reporting.

---

## 2. Core Domain Principle

The Customer Domain is the single source of truth for customer identity and account structure.

No other domain may independently create or maintain duplicate customer profiles.

Other domains may reference customer records, but they must not directly own or alter:

- Customer legal identity
- Customer hierarchy
- Customer contacts
- Authorized signatories
- Credit profile
- Billing profile
- Tax identity
- Customer status
- Customer compliance documents
- Portal access ownership
- Communication preferences
- Customer account relationships

All changes must go through controlled Customer Domain services and must be audited.

---

## 3. Business Context

Equipment rental businesses commonly deal with more than one type of customer.

Examples include:

- Walk-in individual customer
- Sole proprietor
- Small contractor
- Large construction company
- Industrial company
- Government contractor
- Oil and gas operator
- Event company
- Logistics provider
- Holding company with multiple subsidiaries
- Corporate customer with multiple projects and jobsites
- Customer using separate billing, operations, and procurement contacts
- Customer with different credit limits by legal entity or branch
- Customer requiring PO approval before dispatch
- Customer with different negotiated pricing by project

A generic “customer name and phone number” model is therefore insufficient.

---

## 4. Scope

### 4.1 In Scope

The domain shall support:

- Individual customers
- Corporate customers
- Customer account hierarchy
- Parent and subsidiary relationships
- Customer branches
- Customer contacts
- Contact roles
- Authorized signatories
- Customer legal identity
- Commercial Registration details
- VAT registration details
- National Address information
- Customer classification
- Account ownership
- Customer lifecycle
- Customer status
- Credit profile
- Credit limits
- Payment terms
- Billing preferences
- Tax treatment
- Insurance profile
- Customer documents
- Customer portal users
- Communication preferences
- Customer notes
- Customer activity timeline
- Customer risk flags
- Account holds
- Blacklist or restricted status
- Customer duplicate detection
- Account merge workflow
- Customer-specific commercial settings
- Customer-level approval rules
- Customer-level reporting

### 4.2 Out of Scope

The domain does not own:

- Rental contracts
- Reservations
- Pricing calculations
- Invoices
- Payments
- General ledger
- Project operational execution
- Dispatch
- Asset custody
- Maintenance
- Payroll
- HR records
- Full procurement management
- Full external CRM campaign automation

The domain may expose customer data to these domains through controlled APIs and events.

---

## 5. Customer Types

The system shall support configurable customer types.

Minimum initial types:

1. Individual
2. Sole Proprietorship
3. Small Business
4. Corporate
5. Government
6. Semi-Government
7. International Company
8. Internal Group Company
9. Partner
10. Vendor-Customer Hybrid

Customer type affects:

- Required fields
- credit rules
- tax requirements
- document requirements
- contract templates
- approval levels
- portal behavior
- reporting classification

---

## 6. Customer Lifecycle

### 6.1 Lifecycle States

The minimum customer lifecycle states are:

- Prospect
- Pending Verification
- Active
- Active — Cash Only
- Active — Credit Approved
- Credit Hold
- Compliance Hold
- Suspended
- Restricted
- Inactive
- Blacklisted
- Archived

### 6.2 State Rules

#### Prospect

A lead or potential customer not yet approved for rental.

Allowed actions:

- Create quote
- Capture contacts
- Store opportunity notes
- Request documents

Restricted actions:

- Contract activation
- equipment checkout
- credit account use

#### Pending Verification

Customer information exists but required identity, legal, tax, insurance, or approval checks are incomplete.

#### Active — Cash Only

Customer may rent only with approved advance payment or deposit conditions.

#### Active — Credit Approved

Customer may transact within approved credit limits and payment terms.

#### Credit Hold

New credit exposure is blocked.

Possible reasons:

- Credit limit exceeded
- Overdue invoices
- Payment default
- Expired credit approval
- Manual finance hold

#### Compliance Hold

Rental or contract activity is blocked due to missing or expired required documents.

#### Suspended

Temporary operational block requiring authorized reactivation.

#### Restricted

Customer may transact only under specific controls.

Examples:

- Specific branches only
- Specific equipment categories only
- Advance payment only
- Manager approval required
- No high-value equipment

#### Blacklisted

The customer is blocked from new business unless a formally approved exception is granted.

#### Archived

Historical record retained. No normal operational use.

---

## 7. Customer Identity Model

### 7.1 Core Fields

Each customer shall have:

- Customer ID
- Tenant ID
- Legal Entity ID
- Customer Type
- Customer Status
- Legal Name — English
- Legal Name — Arabic
- Trade Name — English
- Trade Name — Arabic
- Customer Display Name
- Parent Customer ID, where applicable
- Country of Registration
- Commercial Registration Number
- Commercial Registration Expiry Date
- VAT Registration Number
- National Identification Number, where applicable
- Unified Number, where applicable
- Industry
- Customer Segment
- Customer Tier
- Account Owner
- Primary Branch
- Preferred Language
- Preferred Currency
- Date Created
- Created By
- Last Updated
- Last Reviewed
- Review Status

### 7.2 Saudi Corporate Identity

For Saudi corporate customers, the system should support:

- Arabic legal name
- English legal name
- Commercial Registration number
- CR issue and expiry dates
- VAT registration number
- National Address
- building number
- street
- district
- city
- postal code
- additional number
- country
- registered phone
- registered email
- authorized signatory
- signatory authority basis
- uploaded legal documents

The exact mandatory fields must remain configurable by customer type and country adapter.

---

## 8. Customer Hierarchy

The system shall support hierarchical corporate structures.

Example:

```text
Holding Company
├── Saudi Operating Company
│   ├── Riyadh Branch
│   ├── Jeddah Branch
│   └── Dammam Branch
├── UAE Subsidiary
└── Project Joint Venture
```

### 8.1 Hierarchy Entities

- Parent Account
- Subsidiary
- Customer Branch
- Joint Venture
- Project Entity
- Billing Entity
- Contracting Entity
- Guarantor Entity

### 8.2 Hierarchy Rules

- Each customer record may have one direct parent.
- Circular hierarchy relationships are prohibited.
- Financial roll-up rules must be configurable.
- Credit may be managed at parent, subsidiary, or branch level.
- Pricing may be inherited or overridden.
- Documents may apply to one entity or the full group.
- Contacts may have access to one entity or multiple child entities.
- Portal visibility must follow explicit access grants.

---

## 9. Customer Contacts

### 9.1 Contact Roles

The system shall support multiple contacts per customer.

Minimum roles:

- Primary Contact
- Authorized Signatory
- Procurement Contact
- Project Manager
- Site Contact
- Billing Contact
- Accounts Payable Contact
- Finance Manager
- Safety Contact
- Compliance Contact
- Legal Contact
- Dispatch Contact
- Emergency Contact
- Portal Administrator
- Executive Sponsor

### 9.2 Contact Fields

- Contact ID
- Customer ID
- First Name
- Middle Name
- Last Name
- Arabic Name
- Job Title
- Department
- Email
- Mobile
- Alternate Phone
- Preferred Language
- Contact Role
- Branch Scope
- Project Scope
- Portal Access Status
- Signatory Status
- Active Status
- Communication Consent
- Notes
- Effective From
- Effective To

### 9.3 Contact Rules

- A customer may have multiple contacts with the same role.
- One contact may hold multiple roles.
- Signatory authority must be explicitly recorded.
- Expired signatory authority must block signature actions.
- Contacts must not automatically receive portal access.
- Portal access must be separately provisioned and permissioned.
- Contact deletion should be avoided where historical transactions exist; use deactivation.

---

## 10. Authorized Signatories

The system shall support authorized signatory control.

Required data:

- Signatory Contact
- Authority Type
- Authority Document
- Effective Date
- Expiry Date
- Maximum Contract Value
- Allowed Contract Types
- Allowed Legal Entity
- Allowed Projects
- Allowed Branches
- Signature Method
- Verification Status

Examples of authority type:

- Board Resolution
- Power of Attorney
- Commercial Registration Authority
- Delegation Letter
- Project-Specific Authorization
- Internal Customer Approval

The Contract Domain must verify signatory authority before accepting a legally binding signature.

---

## 11. Customer Classification and Segmentation

The system shall support configurable segmentation.

Possible dimensions:

- Industry
- Customer Size
- Strategic Account Status
- Revenue Tier
- Credit Risk Tier
- Utilization Tier
- Project Type
- Government Classification
- Geography
- Sales Region
- Account Owner
- Customer Profitability
- Payment Behavior
- Equipment Category Demand

Segmentation must support reporting and controlled pricing, but must not silently override signed agreements.

---

## 12. Credit Profile

### 12.1 Credit Fields

- Credit Status
- Credit Limit
- Temporary Credit Limit
- Temporary Limit Expiry
- Current Exposure
- Available Credit
- Payment Terms
- Credit Approval Date
- Credit Expiry Date
- Credit Review Frequency
- Credit Risk Rating
- Security or Guarantee Type
- Deposit Requirement
- Advance Payment Requirement
- Overdue Tolerance
- Maximum Days Past Due
- Credit Approver
- Hold Reason
- Hold Date
- Hold Owner

### 12.2 Credit Exposure

Credit exposure may include:

- Open invoices
- overdue invoices
- unbilled rental accrual
- active contract commitment
- pending damage claims
- approved but not invoiced extensions
- deposit offsets
- credit notes
- disputed amounts

The precise formula must be defined in the Finance and Credit specification.

### 12.3 Credit Controls

The system shall support:

- Automatic credit hold
- Manual credit hold
- Temporary override
- Manager override
- Finance override
- Project-specific limit
- Parent-account guarantee
- Cash-only restriction
- Advance-payment requirement
- Deposit requirement
- Equipment-category restrictions
- Contract-value threshold approval

Every override must record:

- User
- date/time
- reason
- original result
- override result
- approver
- expiry
- affected transaction

---

## 13. Payment Terms

Supported examples:

- Advance Payment
- Cash on Delivery
- Card Payment
- Net 7
- Net 15
- Net 30
- Net 45
- Net 60
- Milestone Billing
- Monthly Cycle Billing
- Project-Certified Billing
- Parent Guarantee
- Custom Terms

Payment terms may exist at:

- Customer level
- customer branch level
- project level
- master agreement level
- contract level

Priority and inheritance rules must be explicit.

---

## 14. Billing Profile

Each customer may have one or more billing profiles.

Fields include:

- Billing Profile ID
- Billing Entity
- Billing Address
- VAT Number
- Invoice Language
- Invoice Delivery Method
- Billing Contact
- PO Required
- PO Format Rules
- Project Code Required
- Cost Center Required
- Jobsite Required
- Consolidated Billing Preference
- Invoice Cycle
- Statement Frequency
- Invoice Supporting Documents
- Customer Reference Requirements
- E-Invoice Delivery Channel
- Credit Note Approval Contact

Examples of required supporting documents:

- Signed delivery note
- signed timesheet
- equipment usage report
- project manager approval
- return note
- maintenance report
- tax invoice XML
- contract copy
- purchase order copy

---

## 15. Purchase Order Controls

The Customer Domain shall maintain customer-level PO policy.

Possible rules:

- PO required before contract
- PO required before dispatch
- PO optional below threshold
- blanket PO allowed
- project PO required
- line-item matching required
- PO expiry enforcement
- PO ceiling enforcement
- PO amendment required for extension
- no invoice above remaining PO value

The Project or Contract Domain may own individual PO transactions, while the Customer Domain owns the customer’s PO policy and defaults.

---

## 16. Insurance Profile

The system shall support customer insurance information.

Fields:

- Insurance Status
- Insurance Provider
- Policy Number
- Coverage Type
- Coverage Limit
- Effective Date
- Expiry Date
- Covered Entity
- Covered Projects
- Covered Equipment Categories
- Deductible
- Certificate File
- Verification Status
- Verified By
- Verification Date

Rules:

- Expired insurance must trigger a compliance alert.
- Coverage limits may restrict high-value equipment.
- Customer may accept configured loss damage waiver where permitted.
- Insurance records must be versioned.
- Replaced policies must remain historically accessible.

---

## 17. Customer Documents

Document types may include:

- Commercial Registration
- VAT Certificate
- National Address
- Authorized Signatory Evidence
- Power of Attorney
- Credit Application
- Financial Statements
- Bank Letter
- Insurance Certificate
- Purchase Order
- Framework Agreement
- Government Classification
- Safety Prequalification
- Project Access Documents
- Customer ID
- Correspondence
- Tax Exemption Evidence

### 17.1 Document Metadata

- Document ID
- Customer ID
- Document Type
- File Name
- File Hash
- Version
- Issue Date
- Expiry Date
- Issuing Authority
- Verification Status
- Verified By
- Verified Date
- Rejection Reason
- Confidentiality Level
- Country
- Related Project
- Related Branch
- Active Version
- Retention Category

### 17.2 Document Rules

- Documents must be versioned.
- Historical versions must not be overwritten.
- Expiry alerts must be configurable.
- Sensitive documents must have restricted permissions.
- Uploaded files must be malware scanned.
- Document access must be audited.
- Required-document rules must be configurable by customer type and country.

---

## 18. Customer Portal Access

The Customer Domain owns customer portal account association.

### 18.1 Portal Roles

- Customer Portal Administrator
- Corporate Viewer
- Project Manager
- Procurement User
- Billing User
- Signatory
- Site User
- Requester
- Read-Only Auditor

### 18.2 Portal Access Scope

Access may be limited by:

- Customer entity
- subsidiary
- branch
- project
- jobsite
- contract
- invoice
- document category

### 18.3 Portal Rules

- Portal identity is separate from customer contact identity.
- A contact may exist without login access.
- Access must be approved.
- Multi-factor authentication should be configurable.
- Signatory actions require stronger verification.
- Access revocation must take effect promptly.
- All portal actions must be audited.
- Customer administrators must not grant access beyond their own authorized scope.

---

## 19. Communication Preferences

The system shall support:

- Preferred language
- Email
- SMS
- WhatsApp
- Portal notification
- Phone
- Printed document

Preferences may differ by communication type:

- Quote
- Contract
- Signature request
- Dispatch notice
- Delivery ETA
- Invoice
- Payment reminder
- Credit hold
- Maintenance update
- Certificate expiry
- Marketing

Transactional communications must remain separate from marketing consent.

---

## 20. Customer Notes and Interaction History

The system shall support controlled notes.

Note categories:

- General
- Sales
- Credit
- Compliance
- Operations
- Billing
- Dispute
- Legal
- Safety
- Internal Warning

Rules:

- Sensitive note categories require restricted permissions.
- Notes must record author and timestamp.
- Edited notes must retain revision history.
- Notes must not be used as an uncontrolled replacement for structured fields.
- Legal or credit notes may require elevated access.

---

## 21. Customer 360° View

The Customer 360° view shall consolidate:

- Customer identity
- hierarchy
- contacts
- status
- credit
- current exposure
- active contracts
- active projects
- rented assets
- overdue returns
- invoices
- overdue balances
- payment history
- documents
- insurance
- open disputes
- support cases
- upcoming expiries
- activity timeline
- account owner
- profitability summary
- alerts and holds

The screen must not duplicate ownership of records from other domains. It should retrieve and display governed summaries and drill-through links.

---

## 22. Duplicate Detection

The system shall detect potential duplicate customers using configurable matching rules.

Possible signals:

- VAT number
- Commercial Registration number
- national identifier
- legal name
- Arabic legal name
- phone
- email
- national address
- bank account
- parent company

### 22.1 Duplicate Workflow

- Warn on likely duplicate
- block on exact protected identifier match
- allow authorized review
- compare records
- merge approved duplicates
- preserve source IDs and history
- update references safely
- maintain merge audit record

Customer records with financial or contract history must never be casually deleted.

---

## 23. Customer Merge

Merge requirements:

- Select surviving customer record
- identify conflicting fields
- choose authoritative values
- transfer contacts
- transfer documents
- preserve contracts and invoices
- preserve audit history
- preserve legacy customer IDs
- record approver
- record reason
- prevent reversal without controlled restoration procedure

Merge permission must be highly restricted.

---

## 24. Customer Risk Flags

Possible flags:

- High Credit Risk
- Frequent Late Payment
- Legal Dispute
- Safety Violation
- Equipment Misuse
- Repeated Damage
- Missing Documents
- Expired Insurance
- Sanctions Review Required
- Fraud Concern
- Restricted Equipment
- Manual Review Required

Risk flags must have:

- reason
- severity
- owner
- effective date
- expiry
- evidence
- visibility scope
- review status

Risk flags must not be created or removed without audit.

---

## 25. Account Ownership

The domain shall support:

- Primary Sales Owner
- Secondary Sales Owner
- Account Manager
- Branch Owner
- Credit Manager
- Service Coordinator
- Executive Sponsor

Ownership changes must be effective-dated and audited.

---

## 26. RBAC Requirements

Example permissions:

- customer.view
- customer.create
- customer.edit
- customer.activate
- customer.suspend
- customer.blacklist
- customer.merge
- customer.view_sensitive
- customer.credit.view
- customer.credit.edit
- customer.credit.approve
- customer.credit.override
- customer.documents.view
- customer.documents.upload
- customer.documents.verify
- customer.signatory.manage
- customer.portal.manage
- customer.notes.general
- customer.notes.credit
- customer.notes.legal
- customer.export
- customer.audit.view

Permissions must support:

- Tenant scope
- legal entity scope
- branch scope
- customer scope
- project scope
- financial threshold
- role
- explicit delegation

---

## 27. Audit Requirements

The system shall audit:

- Customer creation
- identity changes
- status changes
- hierarchy changes
- contact changes
- signatory changes
- credit changes
- hold placement and release
- limit override
- document upload
- document verification
- document download where sensitive
- portal access grant/revoke
- account merge
- blacklist action
- export
- risk flag changes
- ownership changes

Audit entry fields:

- Event ID
- tenant
- user
- role
- action
- entity
- entity ID
- old value
- new value
- reason
- approver
- timestamp
- IP
- device/session
- correlation ID

Audit records must be immutable.

---

## 28. API Ownership

The Customer Domain owns APIs for:

- `/customers`
- `/customers/{id}`
- `/customers/{id}/contacts`
- `/customers/{id}/hierarchy`
- `/customers/{id}/documents`
- `/customers/{id}/credit-profile`
- `/customers/{id}/billing-profiles`
- `/customers/{id}/insurance`
- `/customers/{id}/portal-users`
- `/customers/{id}/risk-flags`
- `/customers/{id}/timeline`
- `/customers/{id}/holds`
- `/customers/duplicate-check`
- `/customers/merge`

All APIs must enforce tenant and authorization scope.

---

## 29. Domain Events

The domain may publish:

- CustomerCreated
- CustomerUpdated
- CustomerActivated
- CustomerSuspended
- CustomerRestricted
- CustomerBlacklisted
- CustomerMerged
- CustomerCreditApproved
- CustomerCreditChanged
- CustomerCreditHoldPlaced
- CustomerCreditHoldReleased
- CustomerDocumentUploaded
- CustomerDocumentVerified
- CustomerDocumentExpired
- CustomerInsuranceExpired
- AuthorizedSignatoryAdded
- AuthorizedSignatoryExpired
- PortalAccessGranted
- PortalAccessRevoked
- CustomerRiskFlagAdded
- CustomerRiskFlagResolved

Each event must include:

- Event ID
- event type
- event version
- tenant ID
- customer ID
- timestamp
- actor
- correlation ID
- relevant payload
- source domain

---

## 30. Reporting and KPIs

Customer reports may include:

- Customer count by status
- New customers
- Active customers
- Credit-approved customers
- Customers on hold
- Customer revenue
- Customer margin
- Customer utilization
- Customer concentration
- Customer payment behavior
- Average days to pay
- Outstanding exposure
- Contract renewal pipeline
- Project profitability
- Damage incidence
- Dispute rate
- Document expiry
- Portal adoption
- Customer lifetime value
- Churn risk

Every KPI must define its formula and source.

---

## 31. Dashboard Widgets

Possible widgets:

- Top Customers by Revenue
- Top Customers by Margin
- Customers on Credit Hold
- Overdue Exposure
- Documents Expiring
- Insurance Expiring
- Pending Customer Verification
- High-Risk Customers
- New Accounts
- Dormant Accounts
- Portal Adoption
- Contracts Expiring
- Unused Credit Capacity
- Customer Concentration Risk

Widgets must be role-specific and actionable.

---

## 32. Non-Functional Requirements

### 32.1 Performance

- Common customer search should return promptly under expected load.
- Customer 360° should use optimized summaries rather than unrestricted cross-domain queries.
- Duplicate detection may run asynchronously for complex matching.

### 32.2 Security

- Sensitive customer data must be encrypted at rest and in transit.
- Access must follow least privilege.
- Bulk export must require explicit permission.
- Sensitive document downloads must be audited.
- Portal access must be isolated by customer scope.

### 32.3 Availability

Customer identity and credit status are critical dependencies for contract and rental workflows.

### 32.4 Retention

Customer records with contracts, invoices, audits, or legal history must follow defined retention rules and must not be physically deleted without approved legal policy.

---

## 33. Acceptance Criteria

The Customer & Corporate Account Domain specification is considered complete when:

1. Each customer has one authoritative identity record.
2. Corporate hierarchy is represented without duplication.
3. Customer contacts and signatory authority are separately controlled.
4. Customer status transitions are defined.
5. Credit limits, holds, and overrides are governed.
6. Billing profiles support corporate requirements.
7. Customer documents are versioned and auditable.
8. Portal access is explicitly scoped.
9. Duplicate detection and merge are controlled.
10. Sensitive fields and actions have specific permissions.
11. All major changes produce immutable audit records.
12. Other domains reference customer data without owning duplicates.
13. Saudi identity, Arabic, VAT, and compliance fields are supported through configurable rules.
14. Customer 360° provides a consolidated view without violating domain ownership.
15. All unresolved commercial formulas remain clearly marked for later finance specification.

---

## 34. Dependencies

This domain depends on:

- Tenant Management
- Organization and Branch Management
- Authentication
- RBAC
- Audit
- Document Storage
- Localization
- Notification Service
- Search

This domain feeds:

- Contract
- Rental
- Pricing
- Project
- Dispatch
- Finance
- Customer Portal
- Reporting
- AI advisory services

---

## 35. Open Questions

1. Are individual customers supported in the first release?
2. Which customer types are mandatory at launch?
3. Is customer credit managed fully in ERMS or synchronized from accounting?
4. Are parent-level credit guarantees required?
5. Are customer POs mandatory for corporate contracts?
6. Is project-level credit control required?
7. Which Saudi identity fields are mandatory for each customer type?
8. Which documents must block contract activation when missing?
9. Is sanctions or adverse-party screening required?
10. Can customer portal administrators create other users?
11. Is customer hierarchy required across multiple countries?
12. Can one contact represent multiple customer entities?
13. What approval is required to blacklist or merge a customer?
14. Are WhatsApp notifications required at launch?
15. Is customer profitability visible to sales users or only management and finance?

---

## 36. Decision History

| Version | Date | Decision |
|---|---|---|
| 0.1 | 2026-07-29 | Initial Customer & Corporate Account Domain draft created |
