# CRM, Sales & Quotation Functional Specification

**Document ID:** `ERMS-FRD-003`

## 1. Module Overview

The CRM, Sales & Quotation module manages leads, opportunities, sales activities, quotations, revisions, negotiations, approvals, acceptance, and quote-to-contract conversion.

Primary users:

- Sales Representatives
- Sales Managers
- Commercial Managers
- Regional Managers
- Operations and Finance reviewers

## 2. Permissions

- `lead.view`
- `lead.create`
- `lead.update`
- `lead.qualify`
- `opportunity.view`
- `opportunity.create`
- `opportunity.update`
- `quotation.view`
- `quotation.create`
- `quotation.revise`
- `quotation.submit`
- `quotation.approve`
- `quotation.accept`
- `quotation.convert`

## 3. Navigation

`CRM > Sales > Pipeline > Opportunity > Quotation`

## 4. Screen Inventory

- Lead List
- Lead Details
- Opportunity List
- Opportunity Details
- Pipeline Board
- Sales Activity Calendar
- Quotation Wizard
- Quotation Details
- Revision Comparison
- Negotiation History
- Approval Queue
- Sales Dashboard

## 5. Lead Management

Lead list columns:

- Lead Number
- Company
- Contact
- Source
- Owner
- Stage
- Score
- Created Date

Actions:

- View
- Edit
- Assign
- Qualify
- Disqualify
- Archive

Lead qualification captures customer need, estimated value, expected timeline, equipment categories, and next action.

A lead may be converted only once. Conversion creates or links a customer/account and creates an opportunity.

## 6. Opportunity Management

Opportunity fields:

- Opportunity Number
- Customer or Prospect
- Sales Owner
- Stage
- Estimated Value
- Probability
- Expected Close Date
- Required Equipment
- Rental Period
- Delivery Region
- Competitors
- Forecast Category

Opportunity tabs:

- Overview
- Quotes
- Activities
- Contacts
- Competitors
- Notes
- Documents
- Timeline

## 7. Sales Pipeline

Views:

- Kanban
- Table
- Forecast

Default stages:

- Prospecting
- Qualification
- Needs Analysis
- Proposal
- Negotiation
- Won
- Lost

Drag-and-drop stage changes require validation. Moving to Lost requires a reason. Moving to Won requires an accepted quotation or approved exception.

## 8. Quotation Wizard

Steps:

1. Customer and Opportunity
2. Rental Dates and Delivery Location
3. Equipment and Quantities
4. Packages, Attachments, and Accessories
5. Services and Transportation
6. Pricing, Discounts, Deposits, and LDW
7. Taxes and Commercial Terms
8. Review and Submit

Draft progress is auto-saved.

## 9. Quote Line Items

Each line includes:

- Item Type
- Asset Category or Service
- Quantity
- Rental Period
- Billing Unit
- Base Rate
- Resolved Rate
- Discount
- Tax
- Line Total
- Availability Indicator

Actions:

- Add
- Remove
- Duplicate
- Reorder
- Replace with equivalent category

## 10. Pricing Integration

The quotation module never calculates pricing independently.

It requests a pricing result from the Pricing Engine and displays:

- Rate source
- Base rate
- Customer or project adjustment
- Discount
- Deposit
- LDW
- Tax
- Final total
- Pricing explanation

Manual overrides require permission, reason, and approval when thresholds are exceeded.

## 11. Quote Revisions

Changes after submission or customer negotiation create a new revision.

Capabilities:

- Create Revision
- Compare Revisions
- View Changed Fields
- Restore Values into a New Draft

Previous revisions remain read-only. Exactly one revision may be current.

## 12. Negotiation History

Record:

- Customer Request
- Internal Response
- Price or Term Change
- Discount Request
- Approval Note
- Communication Reference
- Actor and Timestamp

Negotiation history is immutable.

## 13. Approval Queue

Approval may be triggered by:

- Discount threshold
- Total value
- Special pricing
- Long rental duration
- Deposit waiver
- LDW override
- Credit exception

Approvers can:

- Approve
- Reject
- Return for Changes
- Add Comment
- Delegate according to policy

## 14. Quote Acceptance

Acceptance methods:

- Customer Portal
- Digital Signature
- Manual Confirmation with evidence
- Imported Acceptance

Expired quotations cannot be accepted without an approved extension or revision.

Accepted quotations become immutable.

## 15. Quote-to-Contract Conversion

Conversion creates:

- Contract draft
- Contract line items
- Pricing snapshot
- Customer and delivery references
- Planned rental schedule

Commercial data is copied from the accepted quote without re-entry. Conversion must be idempotent.

## 16. Sales Dashboard

Widgets:

- Pipeline Value
- Weighted Forecast
- Win Rate
- Lost Deals
- Quotes Awaiting Approval
- Quotes Expiring Soon
- Monthly Forecast
- Sales by Representative
- Sales by Branch

## 17. Validation Rules

- Customer or qualified prospect is required.
- Rental start must precede rental end.
- At least one line item is required.
- Pricing must be successfully resolved.
- Expiration date must be after issue date.
- Discounts must fall within user authority or enter approval.
- Accepted or expired quotes cannot be edited.

## 18. State Transitions

Lead:

- New -> Qualified -> Converted
- New or Qualified -> Disqualified

Opportunity:

- Open stages -> Won
- Open stages -> Lost

Quotation:

- Draft -> Submitted -> Pending Approval -> Approved -> Sent -> Accepted -> Converted
- Pending Approval -> Rejected or Returned
- Sent -> Expired
- Draft or Sent -> Revised

## 19. API Mapping

- `GET /leads`
- `POST /leads`
- `PATCH /leads/{id}`
- `POST /leads/{id}/qualify`
- `POST /leads/{id}/convert`
- `GET /opportunities`
- `POST /opportunities`
- `PATCH /opportunities/{id}`
- `POST /quotations`
- `GET /quotations/{id}`
- `POST /quotations/{id}/revisions`
- `POST /quotations/{id}/submit`
- `POST /quotations/{id}/approve`
- `POST /quotations/{id}/reject`
- `POST /quotations/{id}/accept`
- `POST /quotations/{id}/convert`

## 20. Events

- `LeadCreated`
- `LeadQualified`
- `LeadConverted`
- `OpportunityCreated`
- `OpportunityStageChanged`
- `OpportunityWon`
- `OpportunityLost`
- `QuoteCreated`
- `QuoteRevised`
- `QuoteSubmitted`
- `QuoteApproved`
- `QuoteRejected`
- `QuoteAccepted`
- `QuoteExpired`
- `ContractDraftGenerated`

## 21. Error Handling

- Lead Already Converted
- Opportunity Closed
- Customer on Credit Hold
- Invalid Rental Period
- Equipment Selection Missing
- Pricing Unavailable
- Unauthorized Discount
- Approval Required
- Quote Expired
- Quote Already Converted
- Invalid State Transition

## 22. Acceptance Criteria

- Lead, opportunity, pipeline, quotation, revision, negotiation, approval, acceptance, and conversion behavior is defined.
- Pricing remains owned by the Pricing Engine.
- Permissions, validation, state transitions, APIs, events, and errors are documented.
- Accepted quotes and historical revisions are immutable.
- Quote-to-contract conversion is idempotent and preserves commercial data.
- The specification is sufficient for implementation without additional functional clarification.
