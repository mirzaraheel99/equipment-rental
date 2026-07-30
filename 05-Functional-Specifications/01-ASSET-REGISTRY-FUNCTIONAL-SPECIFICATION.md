# Asset Registry Functional Specification

**Document ID:** `ERMS-FRD-001`

## 1. Module Overview

The Asset Registry module manages every rental asset throughout its operational lifecycle. It is the authoritative source for asset identity, current status, current location, current owner, specifications, documents, photos, QR identity, and business history.

Primary users:

- Fleet Manager
- Asset Administrator
- Operations
- Dispatch
- Workshop

## 2. Golden Functional Rule

Each asset has exactly:

- One master record
- One current status
- One current location
- One current owner

Historical changes are append-only and visible through the asset timeline.

## 3. Permissions

- `asset.view`
- `asset.create`
- `asset.update`
- `asset.archive`
- `asset.move`
- `asset.status.change`
- `asset.document.upload`
- `asset.qr.print`
- `asset.export`

All actions require tenant scope, RBAC validation, and audit logging.

## 4. Navigation

`Fleet > Assets > Asset List > Asset Details`

## 5. Screen Inventory

- Asset List
- Create Asset
- Edit Asset
- Asset Details
- Asset Timeline
- Documents and Photos
- QR and Labels
- Asset History

## 6. Asset List

Columns:

- Asset Number
- Asset Name
- Category
- Manufacturer
- Model
- Serial Number
- Current Status
- Current Branch
- Current Location
- Current Owner
- Utilization
- Last Inspection
- Next PPM Date

Actions:

- Open
- Edit
- Move
- Change Status
- Print QR
- Export
- Archive

Filters:

- Status
- Category
- Branch
- Location
- Manufacturer
- Warranty Status
- PPM Due

Search fields:

- Asset Number
- Serial Number
- Manufacturer
- Model
- QR Code
- RFID

## 7. Create Asset

Sections:

1. General Identity
2. Classification
3. Technical Specifications
4. Ownership and Branch
5. Warranty
6. Compliance
7. Documents and Photos

Required fields:

- Asset Number
- Asset Name
- Category
- Branch
- Current Location
- Current Owner
- Initial Status

Validation:

- Asset Number must be unique within the tenant.
- Serial Number must be unique when tenant policy requires it.
- Current location must belong to the selected tenant and permitted organization scope.
- Warranty end date cannot precede warranty start date.
- Initial status must be valid for a newly created asset.

## 8. Asset Details

Tabs:

- Overview
- Specifications
- Rentals
- Dispatch
- Inspections
- Maintenance
- Documents
- Photos
- Compliance
- Telematics
- Timeline

The overview displays the authoritative current status, location, owner, branch, availability, and operational restrictions.

## 9. Edit Asset

Editable fields depend on status and permissions.

Restricted fields include:

- Asset Number after activation, unless privileged correction workflow is approved
- Historical location values
- Historical status values
- Historical ownership values

Changes create audit records with before and after values.

## 10. Status and Movement

Status changes and movements are separate actions.

Examples:

- Available -> Reserved
- Reserved -> Rented
- Rented -> Returned
- Returned -> Inspection
- Inspection -> Available
- Available -> Maintenance
- Maintenance -> Available
- Available -> Retired

A movement records:

- Source Location
- Destination Location
- Effective Timestamp
- Reason
- Actor
- Related Business Reference

Invalid transitions must be rejected by the backend.

## 11. Documents and Photos

Supported actions:

- Upload
- Preview
- Download
- Create New Version
- View Version History

Published documents and submitted evidence are immutable. Replacements create new versions.

## 12. QR Code

The system generates:

- QR image
- Printable label
- Secure asset link

Scanning the QR opens the authorized asset experience and never bypasses authentication or RBAC.

## 13. Bulk Actions

- Export selected assets
- Print QR labels
- Assign category
- Initiate branch transfer
- Archive eligible assets

Bulk actions must validate every selected asset. Partial success must return item-level results.

## 14. API Mapping

- `GET /assets`
- `POST /assets`
- `GET /assets/{id}`
- `PATCH /assets/{id}`
- `POST /assets/{id}/status-transitions`
- `POST /assets/{id}/movements`
- `GET /assets/{id}/timeline`
- `GET /assets/{id}/documents`
- `POST /assets/{id}/documents`
- `POST /assets/{id}/qr`

## 15. Events

- `AssetCreated`
- `AssetUpdated`
- `AssetStatusChanged`
- `AssetMoved`
- `AssetOwnerChanged`
- `AssetArchived`
- `AssetDocumentUploaded`
- `AssetQRGenerated`

## 16. Error Handling

- Duplicate Asset Number
- Duplicate Serial Number
- Invalid Status Transition
- Invalid Location
- Asset Currently Rented
- Asset Has Active Dispatch
- Asset Under LOTO
- Asset Has Open Work Order
- Required Field Missing
- Unauthorized Action

## 17. Acceptance Criteria

- All asset screens, actions, permissions, fields, filters, and validations are defined.
- The single-status, single-location, single-owner rule is enforced by the backend.
- Status and movement history is immutable.
- API and event mappings are documented.
- Document versioning, QR generation, bulk actions, audit, RBAC, and tenant isolation are included.
- The specification is sufficient for implementation without additional functional clarification.
