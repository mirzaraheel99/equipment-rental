# 21 — UI Design System & Interaction Standards

**Document ID:** ERMS-UX-002  
**Version:** 0.1  
**Status:** Working Draft  
**Primary Market:** Saudi Arabia  
**Frontend:** React / Next.js / TypeScript  
**Design Goal:** Dense, modern, modular, enterprise-grade, bilingual, accessible, and operationally efficient  
**Purpose:** Define the visual language, layout system, interaction model, component standards, responsive behavior, status semantics, data-density rules, accessibility requirements, and Arabic/RTL behavior for ERMS before UI implementation begins.

---

## 1. Purpose

This document defines the UI and interaction system for ERMS.

It establishes:

- Visual direction
- Layout philosophy
- Density standards
- Navigation behavior
- Typography
- Spacing
- Color semantics
- Status presentation
- Data tables
- Forms
- Cards and panels
- Dashboards
- Maps
- Charts
- Timelines
- Filters
- Drawers and dialogs
- Notifications
- Approvals
- Mobile behavior
- Arabic and RTL
- Accessibility
- Loading, empty, warning, and error states
- Component reuse rules
- Design governance

This document does not prescribe final brand colors, logo, or visual identity. Those will be finalized separately after the product brand is confirmed.

---

## 2. Design Vision

ERMS should feel like a modern enterprise operations command center.

It must not feel like:

- A legacy ERP with oversized menus
- A consumer application with excessive empty space
- A dashboard made only of large KPI cards
- A decorative analytics product with weak operational depth
- A generic admin template
- A mobile-first consumer app stretched onto desktop

The intended experience is:

> Dense enough for enterprise operations, simple enough to learn, and structured enough to support complex work without visual chaos.

---

## 3. Core UX Principles

### 3.1 Information Density with Hierarchy

Dense does not mean crowded.

Every screen should use hierarchy to distinguish:

- Primary facts
- Secondary context
- Warnings
- Actions
- Details
- Historical information

Density should come from efficient layout, not from shrinking everything.

### 3.2 Action-Oriented Design

Every dashboard and work queue should help the user take action.

Examples:

- Overdue return → Contact customer
- PPM due → Create work order
- Contract expiring → Start extension
- Credit hold → Review exposure
- Dispatch delayed → Reassign route
- Missing certificate → Upload replacement

### 3.3 Context Over Navigation

Users should remain in context while working.

Prefer:

- Contextual tabs
- Side sheets
- inline detail panels
- split views
- command palette
- quick actions

Avoid forcing users to repeatedly leave a record and navigate back.

### 3.4 Progressive Disclosure

Show the most important information first.

Advanced details should appear through:

- Expandable sections
- tabs
- drawers
- drill-down
- detail panels
- hover or focus states

### 3.5 One Visual Language

All modules must use the same:

- Status patterns
- form behavior
- table behavior
- spacing
- typography
- error handling
- modal behavior
- approval patterns
- mobile patterns

### 3.6 Bilingual by Design

Arabic and English are equal product modes.

Arabic is not a translated afterthought.

### 3.7 Performance Is UX

Fast interaction is part of the design standard.

The UI should avoid:

- unnecessary full-page reloads
- large blocking dialogs
- loading entire datasets
- excessive animation
- slow dashboard rendering
- oversized client bundles

---

## 4. Layout Architecture

### 4.1 Global Shell

The desktop shell should include:

- Compact top header
- Product/workspace switcher
- Global search
- Quick-create action
- Scope selector
- Notifications
- Approvals
- Language control
- User menu

### 4.2 Navigation

Default navigation should avoid a wide permanent sidebar.

Recommended pattern:

- Compact top navigation
- Workspace menu
- contextual secondary rail
- record-level tabs
- command palette
- saved views
- recent records

A collapsible rail may be used for complex modules.

### 4.3 Page Width

Use full-width enterprise layouts.

Recommended behavior:

- Dashboards: near full viewport width
- Tables: full width
- Detail pages: responsive content grid
- Forms: constrained content width where readability improves
- Large editing workflows: split panel or multi-column layout

### 4.4 Page Regions

Typical enterprise screen:

1. Page header
2. Context summary
3. Filters/actions
4. Main operational content
5. Supporting detail panel
6. Activity or audit context

---

## 5. Density Modes

ERMS should support configurable density.

### 5.1 Comfortable

Best for:

- New users
- customer portal
- mobile
- simple forms

### 5.2 Compact

Default for enterprise users.

Best for:

- Operational tables
- dashboards
- work queues
- dispatch
- finance
- maintenance

### 5.3 Dense

Optional for advanced users.

Best for:

- Large asset lists
- finance reconciliation
- inventory
- dispatch boards
- reporting

Density selection should be stored per user.

---

## 6. Grid System

Use a responsive 12-column grid.

Recommended breakpoints:

- Mobile: under 640 px
- Small tablet: 640–767 px
- Tablet: 768–1023 px
- Desktop: 1024–1439 px
- Large desktop: 1440 px and above

Dashboard widget grid:

- Minimum 2 columns on tablet
- 4–6 columns on desktop
- Resizable widget spans
- Snap-to-grid behavior
- Saved per user or role

---

## 7. Spacing System

Use a consistent spacing scale.

Recommended tokens:

```text
2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48
```

Rules:

- Use smaller spacing inside dense tables and filters.
- Use larger spacing between major page regions.
- Avoid arbitrary spacing values.
- Forms should use consistent vertical rhythm.
- Dense screens must still preserve clear grouping.

---

## 8. Typography

### 8.1 Font Strategy

Use fonts with strong Arabic and Latin support.

Recommended evaluation criteria:

- Arabic readability
- bilingual alignment
- tabular numerals
- multiple weights
- browser performance
- enterprise tone

Final font choice must be validated in both Arabic and English.

### 8.2 Type Scale

Recommended roles:

- Display: executive dashboard headline
- H1: page title
- H2: section title
- H3: panel title
- Body
- Small body
- Label
- Caption
- Data numeral
- Code/reference

### 8.3 Numeric Data

Use tabular numerals for:

- Currency
- meter readings
- hours
- quantities
- percentages
- invoice totals
- contract values

### 8.4 Typography Rules

- Avoid very large headings.
- Do not use excessive font weights.
- Use concise labels.
- Keep data-heavy pages readable at compact density.
- Arabic line height may require slight adjustment.
- Mixed Arabic/English content must not break alignment.

---

## 9. Color System

Brand colors remain TBD.

The design system should define semantic roles rather than hardcoded product meaning.

### 9.1 Semantic Color Roles

- Primary
- Secondary
- Neutral
- Success
- Warning
- Danger
- Information
- Disabled
- Focus
- Selected
- Interactive
- Background
- Surface
- Border
- Overlay

### 9.2 Status Colors

Status color is supplemental.

Every status must also include:

- Text
- icon
- shape or badge treatment
- tooltip where necessary

Never rely on color alone.

### 9.3 Financial Color Rules

Avoid treating all positive values as green and all negative values as red without context.

Examples:

- Cost reduction may be positive.
- Revenue decline may be negative.
- Refund may be neutral operationally.
- Credit balance may not be an error.

Context determines semantics.

---

## 10. Status System

All business statuses should use a standardized badge system.

### 10.1 Badge Categories

- Neutral
- Active
- Pending
- Warning
- Blocked
- Completed
- Cancelled
- Expired
- Critical
- Informational

### 10.2 Status Badge Content

A status badge may include:

- Icon
- text
- severity
- tooltip
- last changed time
- owner

### 10.3 Examples

- Available
- Reserved
- On Hire
- PPM Due
- PPM Locked
- Awaiting Approval
- Credit Hold
- Signed
- Active
- Overdue
- ZATCA Failed
- Ready to Rent

---

## 11. Cards and Panels

### 11.1 Card Usage

Use cards only when they improve grouping.

Do not wrap every element in a card.

### 11.2 Card Types

- KPI summary
- Operational queue
- Alert panel
- Record summary
- Chart panel
- Map panel
- Timeline panel
- Approval panel
- Configuration panel

### 11.3 Card Anatomy

- Title
- optional subtitle
- primary value or content
- contextual metadata
- actions
- drill-down link
- loading state
- error state

### 11.4 Density

Dashboard cards should be compact and modular.

Avoid excessive padding and oversized icons.

---

## 12. Data Tables

Data tables are a primary interaction surface in ERMS.

### 12.1 Required Capabilities

- Search
- filters
- sorting
- column resize
- column reorder
- column pinning
- saved views
- density setting
- bulk selection
- bulk actions
- inline actions
- export
- pagination or virtualization
- row expansion
- keyboard navigation
- loading state
- empty state
- error state

### 12.2 Table Header

Should support:

- Page title
- result count
- active filter count
- saved view
- quick filters
- export
- primary create action

### 12.3 Frozen Columns

Useful for:

- Asset code
- customer name
- contract number
- invoice number
- status
- row actions

### 12.4 Row Actions

Prefer:

- Primary inline action
- overflow menu
- keyboard shortcut
- context menu where appropriate

Avoid excessive icon-only actions.

### 12.5 Table Performance

Use virtualization for large datasets.

Do not render thousands of rows into the DOM.

---

## 13. Filters

### 13.1 Filter Types

- Quick filters
- advanced filters
- date ranges
- branch scope
- project scope
- status
- category
- owner
- customer
- risk
- numeric range
- saved filters

### 13.2 Filter Behavior

- Active filters visible
- one-click reset
- removable chips
- shareable URL state where appropriate
- saved views
- role-aware options
- filter count visible

### 13.3 Dense Filter Bar

Use compact horizontal filters for common operations.

Advanced filters may open in a drawer.

---

## 14. Forms

### 14.1 Form Principles

- Group by business context
- show required fields clearly
- validate early
- preserve user input
- support keyboard use
- avoid unnecessary steps
- show why a field is required
- use sensible defaults

### 14.2 Form Layout

Use:

- Single-column for simple forms
- Two-column for structured enterprise forms
- Multi-step wizard for long contractual workflows
- Section navigation for large records
- Sticky action footer for long forms

### 14.3 Validation

Validation messages must be:

- Specific
- actionable
- near the field
- summarized at the top where needed
- available in Arabic and English

### 14.4 Unsaved Changes

Warn users before losing unsaved work.

Draft autosave may be used for long forms.

---

## 15. Wizards

Use wizards only for workflows that have a clear sequence.

Examples:

- Customer onboarding
- Contract creation
- Asset onboarding
- Checkout
- Return
- ZATCA correction
- Integration setup

Wizards must include:

- Step indicator
- completed steps
- validation state
- save draft
- back navigation
- review step
- final confirmation

---

## 16. Drawers and Side Sheets

Use side sheets for:

- Quick details
- editing a small subset
- approval review
- filters
- history preview
- related record preview
- quick create

Avoid side sheets for highly complex workflows requiring full-page context.

---

## 17. Dialogs

Dialogs should be reserved for:

- Confirmation
- destructive action
- small focused input
- legal acknowledgment
- approval or rejection
- permission change
- warning escalation

Never place a large multi-step form in a small dialog.

---

## 18. Command Palette

The command palette should support:

- Global search
- quick navigation
- recent records
- create actions
- operational actions
- keyboard shortcuts
- user-scoped commands
- role-scoped commands

Examples:

```text
Create reservation
Open asset A-1024
Go to finance dashboard
Show overdue returns
Start checkout
Open approval inbox
```

---

## 19. Search

### 19.1 Global Search

Search across:

- Assets
- customers
- contracts
- reservations
- rentals
- projects
- invoices
- work orders
- documents

### 19.2 Search Results

Results should display:

- Entity type
- primary identifier
- name/description
- status
- branch
- relevant context
- recent history

### 19.3 Search Behavior

- Keyboard accessible
- type-ahead
- typo tolerant
- Arabic and English aliases
- barcode and QR support
- recent searches
- permission-filtered

---

## 20. Dashboard Widgets

### 20.1 Widget Requirements

Each widget should define:

- Purpose
- data source
- refresh interval
- permissions
- filters
- drill-down
- actions
- loading state
- empty state
- error state
- mobile behavior

### 20.2 Widget Types

- KPI
- trend
- bar chart
- line chart
- donut
- heatmap
- table
- queue
- map
- timeline
- alert feed
- approval list
- progress
- ranking
- utilization matrix

### 20.3 Widget Configuration

Users may:

- Resize
- reorder
- hide
- duplicate
- save layout
- share
- set default filters
- set refresh behavior

Role templates should define default dashboards.

---

## 21. Charts

### 21.1 Chart Rules

- Always show title and meaning
- Show units
- Avoid decorative 3D charts
- Avoid excessive color
- Use tooltips
- support drill-down
- show comparison where useful
- include accessible alternatives
- handle no-data state

### 21.2 Recommended Chart Types

- Line: trends
- Bar: comparison
- Stacked bar: composition
- Heatmap: utilization
- Scatter: cost vs. revenue
- Waterfall: financial movement
- Donut: limited category split
- Gauge: use sparingly
- Table: when exact values matter

---

## 22. Maps

Maps may show:

- Asset location
- dispatch routes
- jobsite
- branch
- workshop
- customer
- geofence
- delivery ETA
- GPS freshness

Map markers should encode:

- Asset type
- status
- alert
- last update
- cluster count

Maps must always have a list or table alternative.

---

## 23. Timelines

Timelines are important for:

- Asset lifecycle
- contract history
- rental events
- dispatch events
- approval history
- maintenance
- audit

Timeline events should include:

- Event
- actor
- timestamp
- source
- status
- related record
- evidence

---

## 24. Notifications

### 24.1 Notification Types

- Informational
- action required
- approval required
- warning
- critical

### 24.2 Notification Center

Should support:

- Read/unread
- filter
- search
- mark all read
- dismiss where allowed
- open related record
- assign
- snooze
- escalation

Critical notifications must not disappear silently.

---

## 25. Approval UI

Approval cards should show:

- Request type
- amount or risk
- requester
- reason
- policy triggered
- supporting evidence
- deadline
- previous approvals
- approve
- reject
- request changes
- delegate

Approvals must display the impact of the decision.

---

## 26. Loading States

Use:

- Skeletons
- inline progress
- background refresh indicators
- optimistic updates only where safe
- queued-action indicators

Avoid generic full-screen spinners for normal page loads.

---

## 27. Empty States

Empty states should explain:

- Why no data exists
- What the user can do
- Whether filters caused the result
- Whether permission limits apply

Examples:

- No reservations today
- No assets match these filters
- No credit profile exists
- No work orders assigned

---

## 28. Error States

Error states must include:

- Clear message
- error code where useful
- retry action
- support path
- correlation ID
- preserved user input where possible

Do not expose technical stack traces.

---

## 29. Warning and Confirmation States

High-risk actions require explicit confirmation.

Examples:

- Void contract
- release deposit
- override credit hold
- dispose asset
- change role permissions
- approve below-floor pricing
- mark asset ready despite warning
- export sensitive data

Confirmation should state:

- What will happen
- What cannot be undone
- Who will be affected
- Required reason
- Approval requirement

---

## 30. Mobile Design

### 30.1 Mobile Priorities

Mobile should prioritize:

- Scanning
- photos
- signatures
- checklists
- location
- short task workflows
- offline queue
- notifications
- task completion

### 30.2 Mobile Navigation

Possible bottom navigation:

- Home
- Tasks
- Scan
- Notifications
- Profile

### 30.3 Mobile Components

- Large touch targets
- sticky primary action
- camera integration
- offline state
- sync status
- minimal typing
- location capture
- signature pad

---

## 31. Offline Behavior

Potential offline workflows:

- Technician work order
- Driver delivery
- Yard inspection
- Checkout
- Return
- Inventory count

Offline UI must show:

- Offline status
- pending sync count
- last sync
- conflicts
- failed sync
- manual retry

Offline support should be implemented only for approved workflows.

---

## 32. Arabic and RTL Standards

### 32.1 Layout

RTL should mirror:

- Navigation
- panel alignment
- form labels
- drawers
- directional icons
- table flow where appropriate

### 32.2 Non-Mirrored Elements

Do not mirror:

- Charts whose axes rely on conventional numeric direction
- maps
- media controls
- brand marks
- universal symbols where mirroring changes meaning

### 32.3 Mixed Content

Support mixed Arabic and English in:

- Names
- model numbers
- asset codes
- invoice numbers
- email
- addresses
- technical specifications

### 32.4 Arabic Form Behavior

- Right-aligned labels where appropriate
- correct cursor behavior
- Arabic validation messages
- bilingual document preview
- Arabic numerals configurable

---

## 33. Accessibility

Target: WCAG 2.2 AA where practical.

Requirements:

- Keyboard navigation
- visible focus
- semantic HTML
- proper labels
- accessible dialogs
- accessible tables
- screen-reader announcements
- reduced motion support
- color contrast
- non-color-only status
- text resizing
- skip links
- error summaries
- chart alternatives

---

## 34. Theming

Support:

- Light mode
- dark mode
- system mode

Enterprise default should be light unless user or organization preference differs.

Tenant branding may configure:

- Logo
- accent color
- document branding
- customer portal branding

Tenant customization must not break accessibility or semantic status colors.

---

## 35. Design Tokens

Token categories:

- Color
- typography
- spacing
- radius
- shadow
- border
- z-index
- motion
- breakpoints
- density
- chart palette
- status palette

No component should use arbitrary visual values outside the token system unless approved.

---

## 36. Component Governance

Every shared component must have:

- Name
- purpose
- variants
- props
- states
- accessibility behavior
- RTL behavior
- responsive behavior
- examples
- tests

Shared components should be documented in Storybook or equivalent.

Do not duplicate components inside modules.

---

## 37. Initial Shared Component Inventory

- App shell
- Global header
- Workspace switcher
- Command palette
- Scope selector
- Page header
- Status badge
- KPI card
- Data table
- Filter bar
- Advanced filter drawer
- Saved view selector
- Form field
- Date range picker
- Currency input
- Quantity input
- Meter input
- File uploader
- Image capture
- Signature pad
- Approval card
- Timeline
- Activity feed
- Map panel
- Chart panel
- Empty state
- Error state
- Skeleton
- Toast
- Dialog
- Drawer
- Tabs
- Stepper
- Split view
- Record link
- Audit viewer
- Permission guard
- Mobile task card

---

## 38. Interaction Standards

### 38.1 Keyboard Shortcuts

Potential shortcuts:

- `/` — Search
- `Ctrl/Cmd + K` — Command palette
- `C` — Quick create
- `G then A` — Assets
- `G then C` — Customers
- `G then R` — Rentals
- `G then D` — Dispatch

Shortcuts must not conflict with browser or accessibility behavior.

### 38.2 Feedback

Every action should provide clear feedback:

- Saved
- Submitted
- queued
- approved
- failed
- needs attention

### 38.3 Optimistic UI

Use only when:

- Reversal is safe
- conflict risk is low
- backend validation remains authoritative

Do not use optimistic updates for:

- Payments
- contract signature
- asset status changes
- approvals
- credit overrides
- inventory adjustments

---

## 39. Performance Standards

UI performance targets:

- Initial shell loads quickly
- Common navigation feels immediate
- Tables use virtualization
- Widgets lazy-load
- Charts defer non-critical rendering
- Images use optimized thumbnails
- Large files upload in chunks where needed
- Background refresh does not block user actions

Performance budgets should be set during technical implementation.

---

## 40. Security UX

The UI should clearly communicate:

- Permission denied
- approval required
- sensitive data
- restricted action
- session expiry
- MFA challenge
- secure download
- export watermark
- audit presence

Security must not rely on hiding buttons alone.

---

## 41. Acceptance Criteria

This UI Design System is approved when:

1. The visual direction supports dense enterprise operations.
2. Navigation avoids a wasteful legacy layout.
3. Shared layout and component rules are defined.
4. Tables, forms, dashboards, maps, and timelines follow consistent standards.
5. Arabic and RTL behavior is explicit.
6. Accessibility expectations are defined.
7. Mobile and offline patterns are identified.
8. Loading, empty, warning, and error states are standardized.
9. Status semantics are reusable across domains.
10. Design tokens and component governance are defined.
11. No module creates a parallel visual language.
12. The design system is detailed enough to support visual mockups, Storybook, and frontend implementation.

---

## 42. Next Document

The next document should be:

**22 — Detailed Route Registry & Page Contracts**

It will convert the screen inventory into a precise route-by-route implementation reference containing:

- Route ID
- URL
- page title
- owning domain
- required permission
- scope
- data loaders
- APIs
- actions
- feature flags
- query parameters
- mobile support
- breadcrumb behavior
- error states
- audit requirements
- acceptance criteria
