# 20 — Screen Inventory & Navigation Registry

**Document ID:** ERMS-UX-001  
**Version:** 0.1  
**Status:** Working Draft  
**Primary Market:** Saudi Arabia  
**Frontend:** React / Next.js / TypeScript  
**Purpose:** Define the complete first-pass application screen inventory, route ownership, role access, navigation behavior, major actions, API dependencies, mobile expectations, and RTL requirements before detailed UI design or frontend coding begins.

---

## 1. Purpose

This document defines the planned screen architecture for ERMS.

It establishes:

- Every major screen
- Route structure
- Domain ownership
- Primary users
- Entry points
- Main actions
- Permission requirements
- API dependencies
- Dashboard and KPI dependencies
- Mobile behavior
- Arabic and RTL expectations
- Navigation relationships
- Screen-level acceptance criteria

This document is not a visual design specification. It defines what screens must exist and how users move between them.

---

## 2. Navigation Philosophy

ERMS will not use a large permanent legacy ERP sidebar as the default experience.

The recommended navigation model is:

- Compact global header
- Workspace switcher
- Global search and command palette
- Role-based home dashboard
- Contextual tabs within records
- Temporary or collapsible navigation rail for deep modules
- Saved views
- Recently viewed records
- Quick-create actions
- Approval and notification center
- Mobile bottom navigation for key field roles where appropriate

The objective is to preserve information density without making the product difficult to navigate.

---

## 3. Route Standards

### 3.1 Route Prefix

```text
/app
```

### 3.2 Examples

```text
/app/dashboard
/app/assets
/app/assets/[assetId]
/app/customers
/app/contracts
/app/rentals
/app/dispatch
/app/maintenance
/app/finance
/app/reports
/app/admin
```

### 3.3 Route Rules

- Routes use lowercase kebab-case.
- Resource detail routes use stable IDs.
- User-facing numbers appear in the page, not as the primary internal route key.
- Nested routes are used only where context is necessary.
- Permission checks occur server-side and client-side.
- Unauthorized routes must not render protected data.
- Deep links must preserve tenant and role context through authenticated session state.
- Query parameters may store filters, tabs, date ranges, and saved-view references.

---

## 4. Global Application Shell

### 4.1 Global Header

Contains:

- Product logo
- workspace switcher
- global search
- command palette
- quick-create menu
- branch or scope selector
- notifications
- approvals
- help
- language switch
- user menu

### 4.2 Workspace Switcher

Potential workspaces:

- Executive
- Rental Operations
- Fleet
- Dispatch
- Maintenance
- Inventory
- Finance
- Sales
- Compliance
- Administration
- Customer Portal

Workspace availability is permission-controlled.

### 4.3 Command Palette

Suggested actions:

- Find asset
- Find customer
- Find contract
- Find invoice
- Create customer
- Create reservation
- Create contract
- Start checkout
- Start return
- Create work order
- Create dispatch
- Open approval queue
- Open current branch dashboard

### 4.4 Contextual Navigation

Record detail screens use contextual tabs.

Example asset tabs:

- Overview
- Availability
- Rentals
- Maintenance
- Inspections
- Documents
- Financials
- Timeline
- Audit

---

# 5. Dashboard Screens

## UX-001 — Executive Command Center

**Route:** `/app/dashboard/executive`  
**Owner:** Reporting  
**Primary Roles:** Executive, COO, CFO, Regional Director  
**Purpose:** Provide consolidated business performance and risk visibility.

Primary sections:

- Revenue and margin
- fleet utilization
- idle capital
- maintenance downtime
- branch performance
- project profitability
- accounts receivable
- customer concentration
- contract risk
- critical alerts

Primary actions:

- Change time range
- filter by legal entity, region, branch, project, customer, category
- drill into KPI
- save view
- export
- schedule report

Required APIs:

- dashboard summary
- KPI values
- alerts
- saved views
- drill-down endpoints

Mobile:

- Summary-only responsive mode
- full analytical work expected on tablet/desktop

RTL:

- Charts remain numerically consistent
- labels and filters mirror correctly
- mixed Arabic/English names render safely

---

## UX-002 — Rental Operations Command Center

**Route:** `/app/dashboard/rental-operations`  
**Primary Roles:** Rental Manager, Branch Manager, Counter Agent  
**Purpose:** Manage reservations, checkouts, returns, overdue rentals, and ready-to-rent queues.

Key modules:

- Today’s reservations
- waiting allocation
- checkout queue
- return queue
- overdue rentals
- extension requests
- blocked transactions
- ready-to-rent queue
- branch availability

---

## UX-003 — Fleet Command Center

**Route:** `/app/dashboard/fleet`  
**Primary Roles:** Fleet Manager, Operations Manager  
**Purpose:** Show asset status, location, utilization, maintenance risk, and replacement candidates.

Key modules:

- Fleet status distribution
- asset map
- utilization heatmap
- idle days
- meter activity
- PPM risk
- certificate expiry
- economic performance
- replacement recommendations

---

## UX-004 — Dispatch Command Center

**Route:** `/app/dashboard/dispatch`  
**Primary Roles:** Dispatcher, Logistics Manager, Yard Manager  
**Purpose:** Control deliveries, pickups, transfers, drivers, trucks, and delays.

Key modules:

- Timeline board
- map
- delivery queue
- pickup queue
- route status
- driver availability
- truck availability
- proof-of-delivery pending
- failed or delayed dispatches

---

## UX-005 — Maintenance Command Center

**Route:** `/app/dashboard/maintenance`  
**Primary Roles:** Service Manager, Workshop Supervisor, Fleet Manager  
**Purpose:** Manage work orders, PPM, workshop load, parts constraints, and downtime.

---

## UX-006 — Finance Command Center

**Route:** `/app/dashboard/finance`  
**Primary Roles:** CFO, Finance Manager, Accountant, Collections Officer  
**Purpose:** Track billing, receivables, deposits, refunds, credit notes, and ZATCA status.

---

## UX-007 — Inventory Command Center

**Route:** `/app/dashboard/inventory`  
**Primary Roles:** Warehouse Manager, Parts Manager, Inventory Controller  
**Purpose:** Track stock, transfers, shortages, cycle counts, and reorder risk.

---

## UX-008 — Compliance Command Center

**Route:** `/app/dashboard/compliance`  
**Primary Roles:** Compliance Manager, Auditor, Security Administrator  
**Purpose:** Track expired documents, policy violations, audit exceptions, approval aging, and security events.

---

# 6. Asset Registry Screens

## UX-100 — Asset List

**Route:** `/app/assets`  
**Owner:** Asset Registry  
**Roles:** Fleet, Rental, Dispatch, Maintenance, Branch Manager, Auditor  
**Purpose:** Search, filter, compare, and manage assets.

Primary columns:

- Asset code
- category
- manufacturer
- model
- serial
- current status
- current location
- branch
- customer/project
- meter
- next reservation
- next PPM
- certificate status
- utilization
- profitability flag

Primary actions:

- Create asset
- bulk import
- export
- transfer
- assign tags
- open saved view
- scan QR/barcode
- open map
- compare assets

Permissions:

- `asset.view`
- `asset.create`
- `asset.export`
- `asset.transfer`

---

## UX-101 — Create Asset

**Route:** `/app/assets/new`  
**Purpose:** Onboard a new serialized asset.

Form sections:

- Identity
- ownership
- classification
- manufacturer/model
- category specifications
- branch/location
- financial values
- warranty
- meters
- tags
- documents
- photos

Validation:

- Unique asset code
- unique serial where required
- category-driven fields
- ownership rules
- required documents

---

## UX-102 — Asset Overview

**Route:** `/app/assets/[assetId]`  
**Purpose:** Asset 360° view.

Sections:

- Current status
- current location
- custodian
- active rental
- upcoming reservation
- open work orders
- PPM
- certificates
- utilization
- revenue and cost summary
- alerts
- recent activity

---

## UX-103 — Asset Availability

**Route:** `/app/assets/[assetId]/availability`

Displays:

- Reservation calendar
- active rental
- dispatch windows
- maintenance locks
- PPM windows
- inspection buffer
- future commitments

---

## UX-104 — Asset Maintenance History

**Route:** `/app/assets/[assetId]/maintenance`

---

## UX-105 — Asset Documents

**Route:** `/app/assets/[assetId]/documents`

---

## UX-106 — Asset Timeline

**Route:** `/app/assets/[assetId]/timeline`

Chronological events:

- Created
- status changes
- movements
- rentals
- inspections
- work orders
- certificate changes
- sale/disposal events

---

## UX-107 — Asset Transfer

**Route:** `/app/assets/[assetId]/transfer`

Requires:

- Destination
- transfer reason
- effective date
- transport method
- approval if cross-branch or high-value
- source and destination verification

---

# 7. Customer Screens

## UX-200 — Customer List

**Route:** `/app/customers`

Columns:

- Customer code
- legal name
- type
- status
- parent company
- account owner
- credit status
- outstanding balance
- active contracts
- active projects
- documents status
- risk flag

---

## UX-201 — Create Customer

**Route:** `/app/customers/new`

Sections:

- Legal identity
- Arabic/English names
- CR/VAT
- National Address
- hierarchy
- contacts
- billing profile
- credit request
- documents
- portal preferences

---

## UX-202 — Customer 360°

**Route:** `/app/customers/[customerId]`

Tabs:

- Overview
- hierarchy
- contacts
- credit
- contracts
- projects
- rentals
- invoices
- payments
- documents
- risk
- portal users
- timeline
- audit

---

## UX-203 — Customer Credit Profile

**Route:** `/app/customers/[customerId]/credit`

Actions:

- Request approval
- place hold
- release hold
- temporary increase
- review exposure
- view aging

---

## UX-204 — Customer Documents

**Route:** `/app/customers/[customerId]/documents`

---

## UX-205 — Customer Portal Users

**Route:** `/app/customers/[customerId]/portal-users`

---

## UX-206 — Duplicate Review

**Route:** `/app/customers/duplicate-review`

---

# 8. Project and Jobsite Screens

## UX-250 — Project List

**Route:** `/app/projects`

---

## UX-251 — Create Project

**Route:** `/app/projects/new`

---

## UX-252 — Project Overview

**Route:** `/app/projects/[projectId]`

Sections:

- Contract
- jobsites
- equipment on site
- dispatch
- operators
- PO/ceiling
- billing
- profitability
- risks
- documents

---

## UX-253 — Jobsite Overview

**Route:** `/app/projects/[projectId]/jobsites/[jobsiteId]`

---

## UX-254 — Purchase Order Management

**Route:** `/app/projects/[projectId]/purchase-orders`

---

# 9. Contract Screens

## UX-300 — Contract List

**Route:** `/app/contracts`

Filters:

- Status
- customer
- project
- branch
- type
- value
- expiry
- signature status
- approval status
- PO risk
- insurance risk

---

## UX-301 — Create Contract

**Route:** `/app/contracts/new`

Wizard stages:

1. Contract type
2. Customer and project
3. Commercial terms
4. Equipment/services lines
5. Pricing
6. Insurance and deposit
7. Clauses
8. Approvals
9. Document preview
10. Signature routing

---

## UX-302 — Contract Overview

**Route:** `/app/contracts/[contractId]`

Tabs:

- Summary
- line items
- versions
- pricing
- parties
- signatures
- insurance
- deposits
- amendments
- documents
- billing
- timeline
- audit

---

## UX-303 — Contract Approval

**Route:** `/app/contracts/[contractId]/approvals`

---

## UX-304 — Contract Signature

**Route:** `/app/contracts/[contractId]/signatures`

---

## UX-305 — Contract Amendment

**Route:** `/app/contracts/[contractId]/amendments/new`

---

## UX-306 — Contract Extension

**Route:** `/app/contracts/[contractId]/extensions/new`

---

## UX-307 — Contract Closure

**Route:** `/app/contracts/[contractId]/close`

---

# 10. Rental Screens

## UX-400 — Availability Search

**Route:** `/app/rentals/availability`

Inputs:

- Date/time
- branch
- project/jobsite
- category
- model
- quantity
- operator requirement
- transport requirement

Results:

- Available now
- available with transfer
- conflicting
- PPM risk
- substitute suggestions
- estimated readiness

---

## UX-401 — Reservation List

**Route:** `/app/rentals/reservations`

---

## UX-402 — Create Reservation

**Route:** `/app/rentals/reservations/new`

---

## UX-403 — Reservation Detail

**Route:** `/app/rentals/reservations/[reservationId]`

---

## UX-404 — Allocation Workspace

**Route:** `/app/rentals/allocations`

Displays:

- Unallocated demand
- candidate assets
- conflicts
- branch alternatives
- maintenance risk
- dispatch readiness

---

## UX-405 — Checkout Queue

**Route:** `/app/rentals/checkouts`

---

## UX-406 — Checkout Workflow

**Route:** `/app/rentals/checkouts/[rentalAssetId]`

Steps:

- Contract validation
- asset confirmation
- inspection
- photos
- meter/fuel
- documents/certificates
- customer acknowledgment
- dispatch handoff
- completion

---

## UX-407 — Active Rentals

**Route:** `/app/rentals/active`

---

## UX-408 — Rental Detail

**Route:** `/app/rentals/[rentalId]`

---

## UX-409 — Extension Request

**Route:** `/app/rentals/[rentalId]/extension`

---

## UX-410 — Off-Hire Queue

**Route:** `/app/rentals/off-hire`

---

## UX-411 — Return Queue

**Route:** `/app/rentals/returns`

---

## UX-412 — Return Workflow

**Route:** `/app/rentals/returns/[rentalAssetId]`

---

## UX-413 — Damage Comparison

**Route:** `/app/rentals/returns/[rentalAssetId]/damage-comparison`

---

# 11. Dispatch and Yard Screens

## UX-500 — Dispatch Board

**Route:** `/app/dispatch`

Views:

- Timeline
- Kanban
- Map
- Calendar
- Driver
- Vehicle
- Project

---

## UX-501 — Create Dispatch Order

**Route:** `/app/dispatch/new`

---

## UX-502 — Dispatch Order Detail

**Route:** `/app/dispatch/[dispatchId]`

---

## UX-503 — Route Planner

**Route:** `/app/dispatch/routes/[routeId]`

---

## UX-504 — Driver Workspace

**Route:** `/app/mobile/driver`

Mobile-first.

Primary actions:

- Accept assignment
- navigate
- load confirmation
- departure
- arrival
- POD
- failed delivery
- collection evidence

---

## UX-505 — Yard Staging Board

**Route:** `/app/yard/staging`

---

## UX-506 — Yard Receiving Queue

**Route:** `/app/yard/receiving`

---

## UX-507 — Proof of Delivery

**Route:** `/app/dispatch/[dispatchId]/proof-of-delivery`

---

## UX-508 — Branch Transfer Queue

**Route:** `/app/dispatch/transfers`

---

# 12. Maintenance Screens

## UX-600 — Work Order List

**Route:** `/app/maintenance/work-orders`

---

## UX-601 — Create Work Order

**Route:** `/app/maintenance/work-orders/new`

---

## UX-602 — Work Order Detail

**Route:** `/app/maintenance/work-orders/[workOrderId]`

Tabs:

- Summary
- diagnosis
- labor
- parts
- inspections
- warranty
- documents
- cost
- timeline

---

## UX-603 — Technician Mobile Workspace

**Route:** `/app/mobile/technician`

---

## UX-604 — PPM Schedule

**Route:** `/app/maintenance/ppm`

Views:

- Calendar
- due list
- asset timeline
- branch capacity
- conflict view

---

## UX-605 — Workshop Board

**Route:** `/app/maintenance/workshop`

Columns:

- New
- assigned
- in progress
- waiting parts
- waiting approval
- testing
- inspection
- ready

---

## UX-606 — Inspection Workflow

**Route:** `/app/maintenance/inspections/[inspectionId]`

---

## UX-607 — Certificate Register

**Route:** `/app/maintenance/certificates`

---

# 13. Inventory Screens

## UX-700 — Inventory Item List

**Route:** `/app/inventory/items`

---

## UX-701 — Inventory Item Detail

**Route:** `/app/inventory/items/[itemId]`

---

## UX-702 — Warehouse Overview

**Route:** `/app/inventory/warehouses/[warehouseId]`

---

## UX-703 — Stock Transfer

**Route:** `/app/inventory/transfers/new`

---

## UX-704 — Goods Receipt

**Route:** `/app/inventory/receipts/new`

---

## UX-705 — Stock Issue

**Route:** `/app/inventory/issues/new`

---

## UX-706 — Cycle Count

**Route:** `/app/inventory/cycle-counts/[countId]`

---

## UX-707 — Reorder Queue

**Route:** `/app/inventory/reorder`

---

# 14. Pricing Screens

## UX-800 — Rate Card List

**Route:** `/app/pricing/rate-cards`

---

## UX-801 — Rate Card Editor

**Route:** `/app/pricing/rate-cards/[rateCardId]`

---

## UX-802 — Pricing Simulation

**Route:** `/app/pricing/simulator`

Purpose:

- Test rental duration
- customer
- project
- asset category
- operator
- transport
- discounts
- taxes
- margins

---

## UX-803 — Discount Approval Queue

**Route:** `/app/pricing/approvals`

---

## UX-804 — Pricing Exception Report

**Route:** `/app/pricing/exceptions`

---

# 15. Finance Screens

## UX-900 — Invoice List

**Route:** `/app/finance/invoices`

---

## UX-901 — Invoice Detail

**Route:** `/app/finance/invoices/[invoiceId]`

Tabs:

- Summary
- lines
- tax
- payments
- ZATCA
- documents
- timeline
- audit

---

## UX-902 — Cycle Billing Run

**Route:** `/app/finance/billing-runs`

---

## UX-903 — Payment Entry

**Route:** `/app/finance/payments/new`

---

## UX-904 — Payment Allocation

**Route:** `/app/finance/payments/[paymentId]/allocate`

---

## UX-905 — Deposit Register

**Route:** `/app/finance/deposits`

---

## UX-906 — Refund Queue

**Route:** `/app/finance/refunds`

---

## UX-907 — Credit and Debit Notes

**Route:** `/app/finance/adjustments`

---

## UX-908 — Accounts Receivable Aging

**Route:** `/app/finance/receivables`

---

## UX-909 — Collections Workspace

**Route:** `/app/finance/collections`

---

## UX-910 — ZATCA Submission Monitor

**Route:** `/app/finance/zatca`

---

# 16. Reporting Screens

## UX-1000 — Report Library

**Route:** `/app/reports`

---

## UX-1001 — Report Builder

**Route:** `/app/reports/builder`

---

## UX-1002 — KPI Registry

**Route:** `/app/reports/kpis`

---

## UX-1003 — Scheduled Reports

**Route:** `/app/reports/schedules`

---

## UX-1004 — Saved Views

**Route:** `/app/reports/saved-views`

---

## UX-1005 — Data Export Center

**Route:** `/app/reports/exports`

---

# 17. Approval and Notification Screens

## UX-1100 — Approval Inbox

**Route:** `/app/approvals`

Types:

- Contract
- pricing
- credit
- refund
- deposit
- stock adjustment
- asset disposal
- permission change

---

## UX-1101 — Notification Center

**Route:** `/app/notifications`

---

## UX-1102 — Task Center

**Route:** `/app/tasks`

---

# 18. Administration Screens

## UX-1200 — User Management

**Route:** `/app/admin/users`

---

## UX-1201 — Role Management

**Route:** `/app/admin/roles`

---

## UX-1202 — Permission Matrix

**Route:** `/app/admin/permissions`

---

## UX-1203 — Organization Structure

**Route:** `/app/admin/organization`

---

## UX-1204 — Branch Management

**Route:** `/app/admin/branches`

---

## UX-1205 — Master Data

**Route:** `/app/admin/master-data`

---

## UX-1206 — Workflow Configuration

**Route:** `/app/admin/workflows`

---

## UX-1207 — Approval Rules

**Route:** `/app/admin/approval-rules`

---

## UX-1208 — Document Templates

**Route:** `/app/admin/document-templates`

---

## UX-1209 — Notification Templates

**Route:** `/app/admin/notification-templates`

---

## UX-1210 — Integration Management

**Route:** `/app/admin/integrations`

---

## UX-1211 — Audit Explorer

**Route:** `/app/admin/audit`

---

## UX-1212 — Security Center

**Route:** `/app/admin/security`

---

## UX-1213 — Tenant Settings

**Route:** `/app/admin/settings`

---

# 19. Customer Portal Screens

## UX-1300 — Customer Portal Home

**Route:** `/portal`

---

## UX-1301 — Customer Rentals

**Route:** `/portal/rentals`

---

## UX-1302 — Customer Projects

**Route:** `/portal/projects`

---

## UX-1303 — Customer Contracts

**Route:** `/portal/contracts`

---

## UX-1304 — Customer Signatures

**Route:** `/portal/signatures`

---

## UX-1305 — Customer Invoices

**Route:** `/portal/invoices`

---

## UX-1306 — Customer Payments

**Route:** `/portal/payments`

---

## UX-1307 — Request Extension

**Route:** `/portal/rentals/[rentalId]/extension`

---

## UX-1308 — Request Off-Hire

**Route:** `/portal/rentals/[rentalId]/off-hire`

---

## UX-1309 — Report Breakdown

**Route:** `/portal/rentals/[rentalId]/breakdown`

---

## UX-1310 — Customer Documents

**Route:** `/portal/documents`

---

## UX-1311 — Portal User Administration

**Route:** `/portal/admin/users`

---

# 20. Shared Record Patterns

Every detail screen should use a consistent shell:

- Record title
- business identifier
- status
- key alerts
- scope and ownership
- primary actions
- contextual tabs
- activity timeline
- audit access where permitted

Every list screen should support:

- Search
- filters
- saved views
- sorting
- column selection
- export
- bulk actions
- row actions
- keyboard navigation
- empty states
- error states
- loading states

---

# 21. Mobile Behavior

Mobile-first screens:

- Driver workspace
- Technician workspace
- Yard receiving
- Yard staging
- Checkout
- Return
- Inspection
- QR/barcode scanning
- Customer portal approvals and signatures

Desktop-first screens:

- Executive analytics
- complex contract authoring
- rate card configuration
- report builder
- permission matrix
- large finance reconciliations

---

# 22. Arabic and RTL Requirements

All screens must support:

- Arabic and English labels
- correct RTL layout
- mixed-direction content
- bilingual names
- Arabic document previews
- mirrored navigation where appropriate
- non-mirrored numeric charts where required
- locale-aware date, number, and currency formatting
- Arabic search aliases

RTL must be tested per component, not assumed globally.

---

# 23. Accessibility Requirements

Minimum requirements:

- Keyboard access
- visible focus
- semantic landmarks
- accessible forms
- screen-reader labels
- sufficient contrast
- non-color-only status indicators
- responsive zoom
- accessible tables and dialogs

Target standard should be WCAG 2.2 AA where practical.

---

# 24. Route Permission Registry Pattern

Each route must declare:

- Route ID
- required authentication
- required permission
- allowed scopes
- sensitive action flag
- mobile support
- audit behavior
- feature flag
- owning domain

Example:

| Route | Permission | Scope |
|---|---|---|
| `/app/assets` | `asset.view` | Tenant/Branch |
| `/app/contracts/new` | `contract.create` | Legal Entity/Branch |
| `/app/finance/refunds` | `finance.refund.view` | Legal Entity |
| `/app/admin/roles` | `security.role.manage` | Tenant |

---

# 25. Acceptance Criteria

This Screen Inventory and Navigation Registry is approved when:

1. Every major business capability has at least one owning screen.
2. Every route has a domain owner.
3. Role access is identifiable.
4. Mobile-first workflows are defined.
5. Customer portal routes are separated from internal routes.
6. Detail screens use consistent contextual navigation.
7. List screens follow shared data-grid standards.
8. Arabic and RTL requirements are explicit.
9. Route permissions can be mapped to RBAC.
10. API dependencies can be mapped to the API Registry.
11. No major screen is created during implementation without updating this registry.
12. The screen inventory is detailed enough to begin the visual design system and route registry.

---

# 26. Next Document

The next document should be:

**21 — UI Design System & Interaction Standards**

It will define:

- Visual direction
- dense enterprise layout
- typography
- spacing
- color roles
- status system
- cards
- tables
- filters
- forms
- drawers
- dialogs
- maps
- charts
- timelines
- mobile components
- command palette
- accessibility
- Arabic and RTL behavior
- responsive patterns
- loading, empty, error, and approval states
