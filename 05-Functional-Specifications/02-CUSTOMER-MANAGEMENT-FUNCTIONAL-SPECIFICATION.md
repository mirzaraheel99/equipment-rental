# Customer Management Functional Specification

**Document ID:** `ERMS-FRD-002`

## 1. Module Overview

The Customer Management module manages customer organizations, contacts, branches, billing profiles, credit settings, documents, portal access, and customer history.

Primary users:

- Sales
- Customer Service
- Finance
- Operations
- Branch Managers

## 2. Permissions

- `customer.view`
- `customer.create`
- `customer.update`
- `customer.archive`
- `customer.contact.manage`
- `customer.branch.manage`
- `customer.credit.view`
- `customer.credit.manage`
- `customer.document.upload`
- `customer.export`

All actions require tenant scope, RBAC validation, and audit logging.

## 3. Navigation

`CRM > Customers > Customer List > Customer Details`

## 4. Screen Inventory

- Customer List
- Create Customer
- Edit Customer
- Customer Details
- Contacts
- Customer Locations
- Billing Profiles
- Credit Management
- Documents
- Financial Summary
- Customer Timeline

## 5. Customer List

Columns:

- Customer Number
- Company Name
- Customer Type
- Branch
- Sales Representative
- Credit Status
- Active Contracts
- Active Rentals
- Outstanding Balance
- Status
- Created Date

Actions:

- View
- Edit
- Change Status
- Place Credit Hold
- Export
- Archive

Search fields:

- Customer Number
- Company Name
- Tax Number
- Contact Name
- Email
- Phone

Filters:

- Status
- Branch
- Region
- Customer Type
- Credit Status
- Industry
- Sales Representative

## 6. Create Customer

Sections:

1. General Information
2. Legal and Tax Information
3. Addresses
4. Contacts
5. Billing Profile
6. Credit Profile
7. Portal Access
8. Documents

Required fields:

- Company Name
- Customer Type
- Primary Branch
- Country
- Billing Currency
- Primary Contact when required by tenant policy

Validation:

- Customer Number must be unique.
- Tax Number must be unique when configured.
- Email and phone formats must match the selected locale.
- Credit Limit must be zero or greater.
- Payment Terms must be an active reference value.

## 7. Customer Details

Tabs:

- Overview
- Contacts
- Locations
- Quotes
- Contracts
- Rentals
- Invoices
- Payments
- Documents
- Cases
- Notes
- Timeline

The overview displays customer status, credit state, available credit, outstanding balance, active contracts, active rentals, and key contacts.

## 8. Contacts

Fields:

- Name
- Job Title
- Department
- Email
- Mobile
- Office Phone
- Preferred Channel
- Primary Contact
- Billing Contact
- Operational Contact

Rules:

- Only one active primary contact is allowed per configured contact category.
- Disabled contacts remain in historical transactions.
- Contact changes are audited.

## 9. Customer Locations

Each customer may have multiple locations.

Fields:

- Location Name
- Address
- Region
- GPS Coordinates
- Site Contact
- Delivery Instructions
- Default Delivery Location
- Active Status

Locations referenced by historical transactions cannot be deleted.

## 10. Billing Profile

Fields:

- Billing Address
- Currency
- Payment Terms
- Tax Profile
- Invoice Delivery Method
- Consolidated Billing Flag
- Purchase Order Requirement
- Statement Schedule

## 11. Credit Management

Displays:

- Credit Limit
- Outstanding Balance
- Available Credit
- Aging Summary
- Credit Hold Status
- Credit Review Date

Actions:

- Request Credit Limit Change
- Approve Credit Limit Change
- Place Credit Hold
- Release Credit Hold

Credit holds may prevent new quotes, contracts, reservations, or rentals according to tenant policy.

## 12. Documents

Supported categories:

- Trade License
- Tax Certificate
- Insurance
- Credit Application
- Signed Agreement
- Identification
- Other Attachment

Actions:

- Upload
- Preview
- Download
- Create Version
- View History

## 13. Customer Timeline

The immutable timeline includes:

- Customer Created
- Contact Added or Updated
- Quote Created
- Contract Signed
- Rental Started or Completed
- Invoice Issued
- Payment Received
- Credit Hold Applied or Released
- Support Case Created or Closed

## 14. Bulk Actions

- Export customers
- Assign Sales Representative
- Change permitted status
- Send approved communication
- Archive eligible customers

Bulk operations return item-level validation results.

## 15. State Transitions

- Draft -> Active
- Active -> Credit Hold
- Credit Hold -> Active
- Active -> Suspended
- Suspended -> Active
- Active or Suspended -> Archived

Customers with active rentals or contracts cannot be deleted.

## 16. API Mapping

- `GET /customers`
- `POST /customers`
- `GET /customers/{id}`
- `PATCH /customers/{id}`
- `POST /customers/{id}/status-transitions`
- `GET /customers/{id}/contacts`
- `POST /customers/{id}/contacts`
- `PATCH /customers/{id}/contacts/{contactId}`
- `GET /customers/{id}/locations`
- `POST /customers/{id}/locations`
- `GET /customers/{id}/credit`
- `POST /customers/{id}/credit-actions`
- `GET /customers/{id}/timeline`

## 17. Events

- `CustomerCreated`
- `CustomerUpdated`
- `CustomerStatusChanged`
- `CustomerArchived`
- `ContactAdded`
- `ContactUpdated`
- `CustomerLocationAdded`
- `CreditLimitChanged`
- `CreditHoldApplied`
- `CreditHoldReleased`

## 18. Error Handling

- Duplicate Customer Number
- Duplicate Tax Number
- Invalid Contact Details
- Invalid Credit Limit
- Customer Has Active Contract
- Customer Has Active Rental
- Customer on Credit Hold
- Invalid Status Transition
- Required Field Missing
- Unauthorized Action

## 19. Acceptance Criteria

- Customer list, details, create, edit, contact, location, billing, credit, document, and timeline functions are defined.
- Permissions, validations, status transitions, APIs, events, and errors are documented.
- Historical records remain available after deactivation or archival.
- Tenant isolation, RBAC, audit, and document versioning are enforced.
- The specification is sufficient for implementation without additional functional clarification.
