# Pricing Engine Functional Specification

**Document ID:** `ERMS-FRD-004`

## 1. Module Overview

The Pricing Engine is the authoritative source for all rental price calculations used by CRM, Quotations, Contracts, Rental Operations, Finance, and the Customer Portal.

It manages:

- Rate Cards
- Customer Pricing
- Project Pricing
- Contract Pricing
- Rental Periods
- Proration
- Deposits
- Loss Damage Waiver (LDW)
- Discounts
- Taxes
- Price Resolution
- Price Simulation
- Pricing Audit History

Explicitly deferred from this lite specification:

- Negotiation workflow
- Margin governance
- Deal desk
- AI-generated pricing

## 2. Golden Functional Rules

- The Pricing Engine alone calculates rental pricing.
- Consumer modules never independently recalculate prices.
- Every result includes a pricing snapshot and explanation.
- Historical pricing snapshots are immutable.
- Approved and effective rate-card versions are never edited in place.
- Changes create a new version with a future or immediate effective date.

## 3. Actors

| Actor | Functional Access |
|---|---|
| Pricing Administrator | Full rate-card and rule management |
| Commercial Manager | Review and approve pricing versions |
| Sales Representative | View and simulate permitted prices |
| Contract Manager | View resolved contract pricing |
| Finance | View pricing snapshots and charge breakdowns |
| Auditor | Read-only history and explanation access |

## 4. Permissions

- `pricing.view`
- `pricing.simulate`
- `pricing.rate-card.create`
- `pricing.rate-card.update`
- `pricing.rate-card.submit`
- `pricing.rate-card.approve`
- `pricing.rate-card.publish`
- `pricing.customer.manage`
- `pricing.project.manage`
- `pricing.discount.manage`
- `pricing.deposit.manage`
- `pricing.ldw.manage`
- `pricing.audit.view`

All operations require tenant scope, RBAC validation, and audit logging.

## 5. Navigation

`Commercial > Pricing`

Sub-navigation:

- Rate Cards
- Customer Pricing
- Project Pricing
- Contract Pricing
- Discounts
- Deposits
- LDW
- Price Simulator
- Pricing History

## 6. Screen Inventory

- Pricing Dashboard
- Rate Card List
- Rate Card Details
- Create Rate Card
- Rate Card Version Editor
- Customer Pricing List and Editor
- Project Pricing List and Editor
- Contract Pricing Viewer
- Discount Rules
- Deposit Rules
- LDW Rules
- Price Simulator
- Pricing Resolution Explanation
- Pricing Audit History

## 7. Pricing Dashboard

Widgets:

- Active Rate Cards
- Draft Versions
- Pending Approvals
- Rate Cards Expiring Soon
- Customer Overrides
- Project Overrides
- Recent Pricing Changes
- Failed Pricing Resolutions

## 8. Rate Card List

Columns:

- Rate Card Code
- Name
- Currency
- Scope
- Current Version
- Effective From
- Effective To
- Status
- Owner

Actions:

- View
- Create Version
- Clone
- Submit for Approval
- Publish Approved Version
- Archive Eligible Rate Card

Filters:

- Status
- Currency
- Branch
- Region
- Asset Category
- Effective Date

## 9. Rate Card Editor

Header fields:

- Rate Card Code
- Name
- Description
- Currency
- Applicable Company
- Applicable Branch or Region
- Effective From
- Effective To
- Priority

Rate lines:

- Asset Category or Product
- Hourly Rate
- Daily Rate
- Weekly Rate
- Monthly Rate
- Minimum Charge
- Included Usage
- Excess Usage Rate
- Billing Unit

Validation:

- Rate Card Code is unique within the tenant.
- Effective To must be after Effective From.
- Rates cannot be negative.
- Overlapping versions for the same scope and priority are rejected unless policy explicitly permits them.
- Currency must be active for the tenant.

## 10. Customer-Specific Pricing

A customer-pricing rule may define:

- Customer
- Applicable Categories
- Fixed Rate or Adjustment
- Effective Period
- Branch or Region Scope
- Priority
- Reason

Supported adjustments:

- Fixed replacement rate
- Percentage discount
- Percentage surcharge
- Amount discount
- Amount surcharge

Customer-specific pricing cannot modify the underlying standard rate card.

## 11. Project-Specific Pricing

Project pricing includes:

- Customer
- Project
- Site or Location
- Applicable Assets or Categories
- Rate Adjustment
- Effective Period
- Priority

Project pricing overrides customer pricing only according to the documented resolution hierarchy.

## 12. Contract Pricing

Contract pricing is a frozen pricing snapshot created when an approved quotation converts to a contract or when an authorized contract amendment is approved.

The viewer displays:

- Pricing source
- Rate-card version
- Applied customer or project rule
- Discounts
- Deposits
- LDW
- Taxes
- Final agreed rate
- Effective period

Contract pricing is read-only in this module.

## 13. Rental Periods and Proration

Supported billing units:

- Hour
- Day
- Week
- Month

The engine accepts:

- Rental start timestamp
- Rental end timestamp
- Billing calendar
- Grace period
- Minimum charge
- Proration policy

Supported proration policies:

- Exact elapsed duration
- Started unit
- Completed unit
- Calendar day
- Tenant-defined threshold rules

The result must show the duration calculation and applied proration rule.

## 14. Deposits

Deposit rules may be based on:

- Fixed amount
- Percentage of rental value
- Customer class
- Asset category
- Asset value
- Rental duration
- Contract terms

The engine returns:

- Required deposit
- Waiver eligibility
- Rule reference
- Explanation

A deposit waiver requires a permitted upstream approval; the Pricing Engine only evaluates and reports the rule outcome.

## 15. Loss Damage Waiver (LDW)

LDW rules may define:

- Percentage of rental charge
- Fixed daily charge
- Asset-category rate
- Customer eligibility
- Exclusions
- Minimum and maximum amount

The result includes:

- LDW offered
- LDW selected
- LDW charge
- Rule reference
- Exclusions or warning messages

Insurance coverage management remains outside this module.

## 16. Discounts

Discount rules may apply by:

- Customer
- Customer type
- Project
- Asset category
- Rental duration
- Campaign
- Contract

The engine validates:

- Effective dates
- Eligibility
- Maximum permitted discount
- Combinability
- Priority

Stacked discounts are allowed only when the active rule explicitly permits combination.

## 17. Taxes

The Pricing Engine calls the approved tax service using:

- Tenant
- Legal entity
- Branch
- Customer tax profile
- Delivery or service location
- Charge type
- Tax date

The pricing result stores the returned tax breakdown. Tax policy ownership remains with the tax and regional configuration services.

## 18. Price Resolution Hierarchy

Default precedence:

1. Approved Contract Pricing
2. Approved Project Pricing
3. Approved Customer Pricing
4. Active Standard Rate Card

Within the selected source, the engine applies:

1. Base rate
2. Rental-period and proration logic
3. Eligible discounts or surcharges
4. Deposit calculation
5. LDW calculation
6. Taxes
7. Final total

Any tenant-specific variation must be configuration-driven and versioned.

## 19. Price Simulator

Inputs:

- Customer
- Project
- Contract, when applicable
- Branch
- Asset Category or Product
- Quantity
- Rental Start and End
- Currency
- Delivery Location
- LDW Selection
- Approved Discount Request, when applicable

Outputs:

- Pricing source
- Base rate
- Duration
- Proration
- Discounts and surcharges
- Deposit
- LDW
- Tax
- Line total
- Grand total
- Explanation
- Warnings

Simulation never creates a contract, quote, rental, or invoice.

## 20. Pricing Resolution Response

Every successful resolution returns:

- Resolution ID
- Calculated At
- Currency
- Source Type and Source ID
- Source Version
- Input Summary
- Charge Breakdown
- Final Amount
- Applied Rule IDs and Versions
- Human-readable Explanation
- Warnings
- Pricing Snapshot Hash or Integrity Reference

## 21. Version and Approval Lifecycle

Rate-card version states:

- Draft
- Pending Approval
- Approved
- Published
- Expired
- Archived

Transitions:

- Draft -> Pending Approval
- Pending Approval -> Approved or Rejected
- Approved -> Published
- Published -> Expired
- Expired -> Archived

Published versions are immutable.

## 22. API Mapping

- `GET /pricing/rate-cards`
- `POST /pricing/rate-cards`
- `GET /pricing/rate-cards/{id}`
- `POST /pricing/rate-cards/{id}/versions`
- `PATCH /pricing/rate-card-versions/{versionId}`
- `POST /pricing/rate-card-versions/{versionId}/submit`
- `POST /pricing/rate-card-versions/{versionId}/approve`
- `POST /pricing/rate-card-versions/{versionId}/publish`
- `GET /pricing/customer-rules`
- `POST /pricing/customer-rules`
- `GET /pricing/project-rules`
- `POST /pricing/project-rules`
- `GET /pricing/discount-rules`
- `GET /pricing/deposit-rules`
- `GET /pricing/ldw-rules`
- `POST /pricing/resolve`
- `POST /pricing/simulate`
- `GET /pricing/resolutions/{id}`
- `GET /pricing/audit-history`

## 23. Events

- `RateCardCreated`
- `RateCardVersionCreated`
- `RateCardSubmitted`
- `RateCardApproved`
- `RateCardRejected`
- `RateCardPublished`
- `CustomerPricingCreated`
- `ProjectPricingCreated`
- `DiscountRuleUpdated`
- `DepositRuleUpdated`
- `LDWRuleUpdated`
- `PriceResolved`
- `PriceResolutionFailed`

## 24. Error Handling

- No Applicable Rate Found
- Rate Card Expired
- Overlapping Rate Card Version
- Invalid Rental Period
- Unsupported Currency
- Invalid Discount Combination
- Discount Exceeds Permitted Limit
- Customer Not Eligible
- Project Pricing Not Active
- Contract Pricing Not Active
- Tax Service Unavailable
- Invalid Deposit Rule
- Invalid LDW Rule
- Unauthorized Pricing Change
- Invalid State Transition

Failure responses must include a stable error code, user-safe message, correlation ID, and field-level details where applicable.

## 25. Business Rules

- Pricing calculations originate only from the Pricing Engine.
- Consumer modules store the returned pricing snapshot and never recreate the calculation.
- Published rate-card versions are immutable.
- Historical resolutions retain all applied rule versions.
- Pricing simulations do not create transactional business records.
- Contract pricing overrides project, customer, and standard pricing when active and applicable.
- Project pricing overrides customer and standard pricing when active and applicable.
- Customer pricing overrides standard pricing when active and applicable.
- Negotiation workflow, margin governance, deal desk, and AI pricing remain explicitly deferred.

## 26. Acceptance Criteria

- Rate cards, versions, customer pricing, project pricing, contract pricing, discounts, deposits, LDW, taxes, and proration are functionally defined.
- Price resolution hierarchy and calculation order are documented.
- All pricing outputs include a snapshot, applied rule versions, and explanation.
- Permissions, screens, validations, lifecycle transitions, APIs, events, and errors are specified.
- Published and historical pricing data is immutable and auditable.
- Deferred capabilities are explicitly identified and excluded.
- The specification is sufficient for implementation without additional functional clarification.
