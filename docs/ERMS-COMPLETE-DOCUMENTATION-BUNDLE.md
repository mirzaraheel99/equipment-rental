# ERMS Complete Documentation Bundle

This file is the consolidated source of truth for the Enterprise Rental Management System (ERMS). It is intended for Claude Code, Codex, human engineers, architects, QA, and implementation teams.

## Product Direction

ERMS is a Saudi-first, GCC-ready, enterprise SaaS equipment rental management platform.

Core principles:

- Multi-tenant
- Modular monolith initially
- React / Next.js frontend
- NestJS backend
- PostgreSQL
- Redis
- S3-compatible object storage
- API-first
- Arabic and English
- ZATCA-ready
- Enterprise RBAC
- Full auditability
- Event-driven architecture
- Documentation-first delivery

Documentation is the source of truth. Implementation must not invent business rules outside the approved documentation.

---

# 02 Product

## 02 Product Strategy

### Vision

Build a modern enterprise equipment rental platform capable of serving small rental companies, regional operators, and multinational enterprise rental organizations through one configurable platform.

### Mission

Enable rental organizations to manage their complete business lifecycle from one integrated platform while increasing fleet utilization, reducing operational complexity, improving customer experience, and supporting data-driven decisions.

### Positioning

ERMS is:

- API-first
- Cloud-native
- Multi-tenant
- AI-ready
- Mobile-first
- Event-driven
- Configuration-driven

### Target Markets

Primary:

- Equipment rental companies

Secondary:

- Construction
- Oil and gas
- Mining
- Infrastructure
- Utilities
- Events
- Industrial equipment
- Government fleet operations

### Strategic Pillars

- Fleet excellence
- Operational excellence
- Customer experience
- Enterprise automation
- AI augmentation
- Open integration
- Global scalability

### Product Evolution

Core Rental Platform -> Enterprise Platform -> AI Platform -> Marketplace Platform -> Industry Ecosystem

### Initial Geographic Strategy

Saudi Arabia -> GCC -> Middle East -> Africa -> Europe -> North America -> Asia-Pacific

---

## 03 Product Scope

### In Scope

- Customer management
- CRM and sales
- Pricing
- Quotations
- Contracts
- Reservations
- Rental operations
- Asset registry
- Maintenance and workshop
- Dispatch and logistics
- Inventory and warehouse
- Finance and billing
- Customer portal
- Reporting and analytics
- Administration
- AI Copilot
- Workflow
- Notifications
- Documents
- Search
- Audit
- Localization
- Integrations

### Out of Scope

- Full ERP
- General ledger
- Payroll
- Human resources
- Manufacturing execution
- Banking systems
- Tax filing services
- CAD/BIM authoring

ERMS integrates with specialized ERP, accounting, HR, payroll, payment, identity, IoT, GPS, government, and BI platforms rather than replacing them.

### Product Editions

Starter:

- Customers
- Assets
- Rentals
- Basic invoicing
- Basic reports

Professional:

- CRM
- Dispatch
- Maintenance
- Inventory
- Customer Portal
- Workflow
- Dashboards

Enterprise:

- Multi-company
- Multi-branch
- AI Copilot
- Advanced workflow
- API platform
- Marketplace
- Advanced analytics
- IoT
- SSO
- Enterprise security
- Audit and compliance

---

## 04 Product Module Map

Top-level modules:

- Dashboard
- CRM
- Customers
- Pricing
- Contracts
- Rentals
- Assets
- Maintenance
- Dispatch
- Inventory
- Finance
- Customer Portal
- Reporting
- Administration
- AI Copilot

Shared services:

- Authentication
- Authorization
- RBAC
- Notifications
- Workflow
- Search
- Documents
- Audit
- Timeline
- Configuration
- Localization
- Event bus
- API gateway

Primary business flow:

Lead -> Opportunity -> Quotation -> Approval -> Contract -> Reservation -> Equipment Allocation -> Dispatch -> Checkout -> Active Rental -> Return -> Inspection -> Invoice -> Payment -> Analytics

---

# 05 Functional Specifications

## FRD-001 Asset Registry

Covers:

- Asset list
- Asset details
- Create and edit asset
- Asset categories
- Lifecycle
- QR, barcode, RFID
- Equipment passport
- Warranties
- Certifications
- Documents
- Photos
- Timeline
- Search and filters
- Bulk actions
- Validation
- State transitions
- APIs
- Events
- Errors

Core lifecycle:

Draft -> Registered -> Available -> Reserved -> Rented -> Returned -> Inspection -> Maintenance when required -> Available -> Retired -> Disposed

---

## FRD-002 Customer Management

Covers:

- Customer list and details
- Customer creation and editing
- Contacts
- Customer branches
- Billing profiles
- Credit management
- Documents
- Financial summary
- Timeline
- Search
- Filters
- Bulk actions

Core rules:

- Customer numbers are immutable.
- Customers with active rentals or contracts cannot be deleted.
- Credit holds can block new contracts.
- One primary contact per customer.
- Customer history is immutable.

---

## FRD-003 CRM, Sales and Quotation

Covers:

- Leads
- Opportunities
- Pipeline
- Quotation wizard
- Quote line items
- Pricing integration
- Revisions
- Negotiation
- Approvals
- Acceptance
- Quote-to-contract conversion
- Dashboards

Commercial flow:

Lead -> Opportunity -> Quote -> Approval -> Acceptance -> Contract

---

## FRD-004 Pricing Engine

Covers:

- Rate cards
- Pricing rules
- Customer-specific pricing
- Contract pricing
- Discounts
- Taxes
- Deposits
- Price simulation
- Approval thresholds
- Pricing audit

Calculation pipeline:

Validate Request -> Load Rate Card -> Apply Customer Pricing -> Apply Contract Pricing -> Evaluate Rules -> Apply Discounts -> Calculate Tax -> Calculate Deposit -> Approval Check -> Immutable Pricing Snapshot

---

## FRD-005 Contract Management

Covers:

- Contract list and details
- Create contract wizard
- Quote conversion
- Approval
- Digital signatures
- Amendments
- Extensions
- Renewals
- Documents
- Timeline
- Search and filters

Lifecycle:

Draft -> Submitted -> Approved -> Signed -> Active -> Extended/Amended/Renewed -> Completed -> Closed

Rules:

- Signed contracts are modified only through amendments.
- Pricing snapshots are immutable.
- Closed contracts are read-only.

---

## FRD-006 Rental Operations

Covers:

- Rental dashboard
- Reservations
- Equipment allocation
- Checkout
- Active rentals
- Returns
- Return inspection
- Damage recording
- Extensions
- Equipment swaps
- Timeline

Lifecycle:

Reserved -> Allocated -> Ready -> Checked Out -> Active -> Extended or Swapped when required -> Returned -> Inspected -> Completed -> Closed

Rules:

- Allocation is required before checkout.
- Inspection is required after return.
- Damaged assets trigger maintenance.

---

## FRD-007 Maintenance and Workshop

Covers:

- Workshop dashboard
- Preventive maintenance
- Corrective maintenance
- Work orders
- Technician assignment
- Labor tracking
- Spare parts
- Warranty repairs
- Quality inspection
- Timeline

Lifecycle:

Scheduled -> Assigned -> In Progress -> Waiting Parts when required -> Quality Inspection -> Completed -> Closed

Failed inspection returns the work order to rework.

---

## FRD-008 Dispatch and Logistics

Covers:

- Dispatch dashboard
- Delivery scheduling
- Pickup scheduling
- Driver assignment
- Vehicle assignment
- Route planning
- GPS tracking
- Proof of Delivery
- Exceptions
- Timeline

Lifecycle:

Scheduled -> Assigned -> Ready -> En Route -> Arrived -> Delivered or Picked Up -> Completed

Exceptions may cause rescheduling and reassignment.

---

## FRD-009 Inventory and Warehouse

Covers:

- Warehouse management
- Zones and bins
- Inventory items
- Receiving
- Reservations
- Transfers
- Issues
- Adjustments
- Cycle counting
- Valuation
- Timeline

Lifecycle:

Received -> Available -> Reserved -> Issued -> Returned -> Available

Transfers:

Available -> Transferred -> Received -> Available

Rules:

- Reserved stock cannot be issued elsewhere.
- Negative stock depends on tenant configuration.
- Adjustments and count variances require approval.

---

## FRD-010 Finance and Billing

Covers:

- Finance dashboard
- Invoices
- Payments
- Deposits
- Credit notes
- Debit notes
- Statements
- Collections
- ERP synchronization
- Timeline

Invoice lifecycle:

Draft -> Approved -> Issued -> Partially Paid -> Paid -> Closed

Alternative states include Overdue and Cancelled.

Rules:

- Approved invoice values are immutable.
- Payments may be allocated across invoices.
- ERP synchronization must be idempotent.

---

## FRD-011 Reporting and Analytics

Covers:

- Executive dashboards
- Operational dashboards
- KPI management
- Report library
- Ad hoc reporting
- Scheduled reports
- PDF, Excel, and CSV exports
- Analytics workspace
- BI integration

Lifecycle:

Draft -> Published -> Scheduled -> Executed -> Archived

All reporting follows RBAC and tenant visibility.

---

## FRD-012 Administration and Platform

Covers:

- Organizations
- Branches
- Users
- Roles
- Permissions
- Feature flags
- Configuration
- Lookups
- Number sequences
- Localization
- Audit history

Rules:

- Every user belongs to a tenant.
- Roles determine permissions.
- Feature flags and configuration are tenant-aware.
- All configuration changes are audited.

---

## FRD-013 Customer Portal

Covers:

- Customer authentication
- Dashboard
- Active rentals
- Rental history
- Contracts
- Invoices
- Payments
- Documents
- Notifications
- Service requests
- Profile and preferences

Rules:

- Customers access only their own organization.
- Contract and operational data is read-only except approved self-service requests.
- Downloads and portal actions are audited.

---

## FRD-014 AI Copilot

Covers:

- AI chat
- Natural-language search
- Recommendations
- Executive summaries
- Workflow assistance
- Tool execution
- Conversation history
- Feedback
- AI settings

Request lifecycle:

Prompt Submitted -> Context Retrieved -> Tools Executed when needed -> LLM Response -> Validation -> Delivered

Rules:

- AI may access only authorized tenant data.
- Recommendations remain advisory.
- Workflow actions require explicit user confirmation.
- Source references are required where applicable.
- Every interaction is audited.

---

# 06 API Registry

Base URL:

`/api/v1`

Standards:

- REST
- JSON
- HTTPS
- OpenAPI 3.1
- OAuth 2.0 / OIDC / JWT
- Tenant isolation
- RBAC
- Versioned APIs

Registered API domains:

- Leads
- Opportunities
- Quotations
- Customers
- Contacts
- Branches
- Pricing
- Rate cards
- Contracts
- Rentals
- Assets
- Work orders
- Dispatch
- Routes
- Warehouses
- Inventory
- Invoices
- Payments
- Reports
- Dashboards
- Users
- Roles
- Audit
- AI
- Internal platform services

---

# Route Registry

Every secured route applies:

- JWT authentication
- Tenant resolution
- RBAC
- Audit logging
- Request validation
- Exception handling
- Rate limiting
- Correlation ID

Key routes include:

### CRM

- `GET /api/v1/leads`
- `POST /api/v1/leads`
- `GET /api/v1/opportunities`
- `POST /api/v1/opportunities`
- `POST /api/v1/quotations`
- `POST /api/v1/quotations/{id}/approve`
- `POST /api/v1/quotations/{id}/accept`

### Customers

- `GET /api/v1/customers`
- `POST /api/v1/customers`
- `PATCH /api/v1/customers/{id}`
- `GET /api/v1/customers/{id}/contacts`
- `POST /api/v1/customers/{id}/contacts`
- `GET /api/v1/customers/{id}/timeline`

### Pricing

- `GET /api/v1/rate-cards`
- `POST /api/v1/rate-cards`
- `PATCH /api/v1/rate-cards/{id}`
- `GET /api/v1/pricing/rules`
- `POST /api/v1/pricing/calculate`
- `POST /api/v1/pricing/simulate`

### Contracts

- `GET /api/v1/contracts`
- `POST /api/v1/contracts`
- `PATCH /api/v1/contracts/{id}`
- `POST /api/v1/contracts/{id}/approve`
- `POST /api/v1/contracts/{id}/sign`
- `POST /api/v1/contracts/{id}/amend`
- `POST /api/v1/contracts/{id}/extend`
- `POST /api/v1/contracts/{id}/renew`
- `POST /api/v1/contracts/{id}/close`

### Rentals

- `GET /api/v1/rentals`
- `POST /api/v1/rentals`
- `POST /api/v1/rentals/{id}/allocate`
- `POST /api/v1/rentals/{id}/checkout`
- `POST /api/v1/rentals/{id}/return`
- `POST /api/v1/rentals/{id}/inspect`
- `POST /api/v1/rentals/{id}/extend`
- `POST /api/v1/rentals/{id}/swap`

### Assets

- `GET /api/v1/assets`
- `POST /api/v1/assets`
- `PATCH /api/v1/assets/{id}`
- `GET /api/v1/assets/{id}/documents`
- `GET /api/v1/assets/{id}/timeline`

### Maintenance

- `GET /api/v1/work-orders`
- `POST /api/v1/work-orders`
- `PATCH /api/v1/work-orders/{id}`
- `POST /api/v1/work-orders/{id}/assign`
- `POST /api/v1/work-orders/{id}/start`
- `POST /api/v1/work-orders/{id}/complete`
- `POST /api/v1/work-orders/{id}/inspection`

### Dispatch

- `GET /api/v1/dispatch`
- `POST /api/v1/dispatch`
- `POST /api/v1/dispatch/{id}/assign-driver`
- `POST /api/v1/dispatch/{id}/assign-vehicle`
- `POST /api/v1/dispatch/{id}/route`
- `POST /api/v1/dispatch/{id}/start`
- `POST /api/v1/dispatch/{id}/complete`
- `POST /api/v1/dispatch/{id}/pod`

### Inventory

- `GET /api/v1/warehouses`
- `POST /api/v1/warehouses`
- `GET /api/v1/inventory`
- `POST /api/v1/receiving`
- `POST /api/v1/reservations`
- `POST /api/v1/transfers`
- `POST /api/v1/adjustments`
- `POST /api/v1/cycle-counts`

### Finance

- `GET /api/v1/invoices`
- `POST /api/v1/invoices`
- `POST /api/v1/payments`
- `POST /api/v1/deposits`
- `POST /api/v1/credit-notes`
- `GET /api/v1/statements`
- `POST /api/v1/erp/export`

### Reporting

- `GET /api/v1/dashboards`
- `GET /api/v1/reports`
- `POST /api/v1/reports`
- `POST /api/v1/reports/export`
- `POST /api/v1/reports/schedule`
- `GET /api/v1/kpis`

### Administration

- `GET /api/v1/users`
- `POST /api/v1/users`
- `GET /api/v1/roles`
- `POST /api/v1/roles`
- `GET /api/v1/organizations`
- `POST /api/v1/organizations`
- `GET /api/v1/configuration`
- `PATCH /api/v1/configuration`

### AI

- `POST /api/v1/ai/chat`
- `POST /api/v1/ai/search`
- `POST /api/v1/ai/summarize`
- `POST /api/v1/ai/recommend`
- `POST /api/v1/ai/workflow`
- `POST /api/v1/ai/tools`
- `GET /api/v1/ai/history`
- `POST /api/v1/ai/feedback`

---

# 07 Implementation Packs

## IMP-001 Repository Bootstrap

Defines the initial monorepo, common package layout, shared tooling, local development setup, CI foundation, and documentation-first execution sequence.

## IMP-002 Customer Management

Implementation order:

1. Customer CRUD
2. Contacts and branches
3. Billing and credit
4. Documents, timeline, search, export

Required layers:

- Controllers
- Services
- Repositories
- DTOs
- Entities
- Validators
- Events
- Policies
- Tests

## IMP-003 CRM, Sales and Quotation

Implementation order:

1. Leads
2. Opportunities
3. Quotations
4. Pricing integration
5. Approval
6. Acceptance
7. Conversion to contract

## IMP-004 Pricing Engine

Implementation order:

1. Rate cards
2. Pricing rules
3. Calculation and simulation
4. Discount and override approvals
5. Pricing history

Performance targets:

- Standard calculation <= 250 ms
- Cached lookup <= 50 ms

## IMP-005 Contract Management

Implementation order:

1. Contract CRUD
2. Approval, signature, activation
3. Amendments, extensions, renewals
4. Closure, history, documents

## IMP-006 Rental Operations

Implementation order:

1. Rental CRUD
2. Reservation and allocation
3. Checkout
4. Return and inspection
5. Damage
6. Extension and swap
7. Completion

## IMP-007 Asset Registry

Implementation order:

1. Asset CRUD
2. Categories
3. Passport, documents, and photos
4. Retirement, disposal, and timeline

## IMP-008 Maintenance and Workshop

Implementation order:

1. Work orders
2. Assignment and lifecycle
3. Labor and parts
4. Inspection
5. Warranty
6. History and schedule

## IMP-009 Dispatch and Logistics

Implementation order:

1. Dispatch CRUD
2. Driver and vehicle assignment
3. Route generation
4. Execution
5. POD and exceptions
6. History

## IMP-010 Inventory and Warehouse

Implementation order:

1. Warehouses and inventory
2. Receiving, reservations, transfers
3. Counts and adjustments
4. Valuation and history

## IMP-011 Finance and Billing

Implementation order:

1. Invoices
2. Payments, deposits, and credit notes
3. Statements, aging, collections
4. ERP export and financial dashboards

## IMP-012 Reporting and Analytics

Implementation order:

1. Dashboards and reports
2. KPIs and analytics
3. Export and scheduling
4. Executive, operations, and finance dashboards

## IMP-013 Administration and Platform

Implementation order:

1. Users
2. Roles and permissions
3. Organizations and branches
4. Configuration and feature flags
5. Lookups, numbering, localization

## IMP-014 Customer Portal

Implementation order:

1. Authentication and dashboard
2. Rentals and contracts
3. Invoices, payments, and documents
4. Service requests, notifications, profile

## IMP-015 AI Copilot

Implementation order:

1. Chat, search, summarize
2. Recommendations, workflows, reports
3. Tools, context, and history
4. Feedback and retention

Mandatory AI controls:

- RBAC
- Tenant isolation
- Prompt validation
- Tool authorization
- Response validation
- Source references
- Audit logging

---

# 08 Engineering Standards

## Coding Standards

- TypeScript strict mode
- No `any` without documented justification
- Controllers handle transport only
- Services contain business logic
- Repositories contain persistence logic
- DTOs contain request validation
- Guards handle authorization
- Interceptors handle logging, metrics, and response formatting
- No business logic in controllers or SQL
- UUID primary keys
- Foreign key constraints
- Created and updated timestamps
- Soft deletes only where business history requires them
- Immutable audit records

Testing coverage targets:

- Business logic: 95%
- Services: 90%
- Controllers: 80%
- Utilities: 95%
- Overall: at least 85%

## Development Workflow

Planning -> Architecture Review -> Implementation -> Local Testing -> Pull Request -> Code Review -> CI -> QA -> UAT -> Production -> Monitoring

AI agents must read documentation before code generation and must not invent architecture or business rules.

## Git Conventions

Branches:

- `main`
- `develop`
- `feature/*`
- `bugfix/*`
- `hotfix/*`
- `release/*`

Conventional commits:

- `feat(customer): add customer creation`
- `fix(pricing): correct tax calculation`
- `docs(api): update route registry`
- `test(dispatch): add route planner tests`

Preferred merge strategy: squash merge.

## CI/CD Standards

Pipeline:

Checkout -> Install -> Lint -> Type Check -> Unit Tests -> Build -> Integration Tests -> Security Scan -> Docker Build -> Publish Artifact -> Deploy -> Smoke Tests -> Monitoring

Production is blocked by high or critical vulnerabilities.

## Testing and Quality Standards

Required testing:

- Unit
- Integration
- API
- UI
- Security
- Performance
- Regression

Every defect must include reproduction steps, root cause, resolution, and regression coverage.

## Security Standards

Principles:

- Zero trust
- Least privilege
- Defense in depth
- Secure by default
- Privacy by design
- Fail secure

Controls:

- OIDC / OAuth 2.0 / SAML where required
- MFA for administrators
- Short-lived tokens
- Refresh token rotation
- RBAC at API and service layers
- Tenant-aware queries, cache keys, file storage, search indexes, and audit logs
- TLS 1.2 minimum; TLS 1.3 preferred
- AES-256 encryption at rest
- Centralized secrets and key management
- No secrets in source control
- Parameterized database queries
- File validation
- Security logging and alerting

Compliance targets:

- ISO 27001
- SOC 2
- Saudi PDPL
- GDPR where applicable
- OWASP ASVS
- OWASP Top 10

## AI and Codex Development Standards

Required reading order:

Product -> Architecture -> Domain -> Functional Specification -> API Registry -> Route Registry -> Implementation Pack -> Engineering Standards -> Code

AI must generate:

- Typed implementation
- DTO validation
- RBAC enforcement
- Tenant isolation
- Audit logging
- Events
- Unit tests
- Integration tests
- API documentation

Human approval is mandatory for:

- Architecture changes
- Database schema changes
- Authentication and authorization
- Security-sensitive code
- Infrastructure changes
- Public API changes
- Breaking changes

---

# Claude Code Execution Rules

Claude Code must:

1. Read this file before implementation.
2. Inspect existing repository files before generating replacements.
3. Use documentation as the source of truth.
4. Never invent undocumented business rules.
5. Implement one module or coherent slice at a time.
6. Generate tests with implementation.
7. Preserve tenant isolation, RBAC, audit, events, and validation.
8. Keep architecture modular and avoid circular dependencies.
9. Update documentation when implementation decisions are approved.
10. Stop and request clarification when documentation conflicts or is missing.

Recommended implementation sequence:

1. Repository bootstrap
2. Identity, tenancy, RBAC, audit, configuration
3. Customer Management
4. Asset Registry
5. CRM and Quotation
6. Pricing Engine
7. Contract Management
8. Rental Operations
9. Maintenance and Workshop
10. Dispatch and Logistics
11. Inventory and Warehouse
12. Finance and Billing
13. Reporting and Analytics
14. Customer Portal
15. AI Copilot

This bundle is authoritative until split into individual version-controlled documents.