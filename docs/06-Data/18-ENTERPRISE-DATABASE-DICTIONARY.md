# 18 — Enterprise Database Dictionary

**Document ID:** ERMS-DATA-002  
**Version:** 0.1  
**Status:** Working Draft  
**Primary Database:** PostgreSQL  
**Primary Market:** Saudi Arabia  
**Depends On:** Product Scope, Module Map, Domain Specifications, System Architecture, Enterprise Data Model  
**Purpose:** Define the initial authoritative relational schema, table ownership, key columns, constraints, indexes, tenancy rules, audit behavior, and implementation standards for ERMS.

---

## 1. Purpose

This document defines the first complete database dictionary for ERMS.

It is intended to guide:

- PostgreSQL schema design
- Prisma or Drizzle schema generation
- Database migrations
- API contracts
- backend validation
- report modeling
- audit design
- tenant isolation
- test data
- data migration
- Claude Code and Codex implementation

This document is not permission to begin production coding. It remains a working draft until the Product Scope, Module Map, and domain specifications are approved.

---

## 2. Core Database Principles

1. Every business entity has one authoritative table.
2. Every transactional row is tenant-scoped.
3. Domain ownership is explicit.
4. Signed and financial records are immutable.
5. Historical data is retained through status and versioning.
6. Physical deletion is prohibited for records with legal, financial, operational, or audit history.
7. Monetary values use fixed-precision decimal types.
8. Time is stored in UTC with timezone-aware timestamps.
9. User-facing codes are separate from internal UUIDs.
10. Controlled statuses use reference data or validated enums.
11. Cross-domain updates occur through application services, not direct table access.
12. Critical integrity is enforced by foreign keys, unique constraints, and check constraints.
13. Audit records are append-only.
14. Tenant and scope filtering is enforced server-side.
15. Bilingual fields are modeled explicitly where legally or operationally required.

---

## 3. Naming and Type Standards

### 3.1 Table Naming

Use singular snake_case table names.

Examples:

- `tenant`
- `customer`
- `asset`
- `contract`
- `invoice`

### 3.2 Column Naming

Use snake_case.

Examples:

- `customer_id`
- `created_at`
- `legal_name_ar`

### 3.3 Primary Keys

Use UUID primary keys:

```sql
id uuid primary key
```

Prefer generated UUID version 7 when supported by the implementation stack. UUID version 4 is acceptable if version 7 support is unavailable.

### 3.4 User-Facing Codes

Use separate unique business identifiers.

Examples:

- `customer_code`
- `asset_code`
- `contract_number`
- `invoice_number`

### 3.5 Monetary Values

Use:

```sql
numeric(19,4)
```

Never use floating-point types for money.

### 3.6 Quantities and Meter Values

Use:

```sql
numeric(19,6)
```

where fractional precision is required.

### 3.7 Dates and Times

- Date only: `date`
- Timezone-aware event timestamp: `timestamptz`
- Never store local time without timezone context.
- Tenant timezone remains configuration, not stored event truth.

### 3.8 Common Audit Columns

Most mutable business tables should include:

- `id`
- `tenant_id`
- `created_at`
- `created_by`
- `updated_at`
- `updated_by`
- `row_version`
- `is_active`
- `deleted_at`, only where soft deletion is approved

Not all append-only tables need `updated_at`.

---

## 4. Multi-Tenant Data Rules

### 4.1 Mandatory Tenant Scope

Every operational and business table must include `tenant_id`.

Exceptions:

- global country reference data
- global currency reference data
- global language reference data
- platform-owned static standards

### 4.2 Tenant Isolation

- Every query must be tenant-scoped.
- Tenant ID must come from authenticated server context.
- The frontend must never be trusted to supply authoritative tenant scope.
- Cross-tenant foreign keys are prohibited.
- Composite unique constraints should include `tenant_id`.
- Row-level security may be used as defense in depth.
- Dedicated tenants may use separate databases while preserving the same logical schema.

### 4.3 Branch and Legal Entity Scope

Where operationally relevant, tables should also include:

- `legal_entity_id`
- `branch_id`
- `project_id`
- `jobsite_id`

These are not substitutes for `tenant_id`.

---

## 5. Domain Ownership Matrix

| Entity | Owning Domain |
|---|---|
| Tenant | Platform |
| Legal Entity | Platform |
| Branch | Platform |
| User | Identity & Security |
| Role | Identity & Security |
| Permission | Identity & Security |
| Customer | Customer |
| Customer Contact | Customer |
| Customer Credit Profile | Customer |
| Asset | Asset Registry |
| Asset Category | Asset Registry |
| Asset Location | Asset Registry |
| Project | Project |
| Contract | Contract |
| Contract Line | Contract |
| Reservation | Rental |
| Rental | Rental |
| Dispatch Order | Dispatch |
| Work Order | Maintenance |
| Inventory Item | Inventory |
| Rate Card | Pricing |
| Invoice | Finance |
| Payment | Finance |
| Dashboard Definition | Reporting |
| Audit Event | Governance |
| Integration Connection | Integration |

No other domain may write directly to an owned table except through the owning domain’s service contract.

---

# 6. Platform and Organization Tables

## 6.1 `tenant`

**Owner:** Platform  
**Purpose:** Represents one SaaS customer environment.

| Column | Type | Null | Notes |
|---|---|---:|---|
| id | uuid | No | Primary key |
| tenant_code | varchar(50) | No | Unique platform code |
| name_en | varchar(200) | No | English name |
| name_ar | varchar(200) | Yes | Arabic name |
| tenant_type | varchar(40) | No | shared, dedicated, government, sandbox, demo |
| status | varchar(30) | No | pending, active, suspended, archived |
| default_country_code | char(2) | No | ISO country code |
| default_currency_code | char(3) | No | ISO currency |
| default_language_code | varchar(10) | No | e.g. en, ar |
| default_timezone | varchar(100) | No | IANA timezone |
| data_residency_region | varchar(100) | Yes | Deployment region |
| created_at | timestamptz | No | |
| updated_at | timestamptz | No | |

**Constraints**

- Unique: `tenant_code`
- Check: supported `tenant_type`
- Check: supported `status`

**Indexes**

- `idx_tenant_status`

---

## 6.2 `tenant_setting`

**Purpose:** Stores controlled tenant configuration.

| Column | Type | Null | Notes |
|---|---|---:|---|
| id | uuid | No | PK |
| tenant_id | uuid | No | FK tenant |
| setting_key | varchar(150) | No | |
| setting_value_json | jsonb | No | Typed application validation required |
| effective_from | timestamptz | No | |
| effective_to | timestamptz | Yes | |
| version | integer | No | |
| created_at | timestamptz | No | |
| created_by | uuid | Yes | |

**Constraints**

- Unique: `(tenant_id, setting_key, version)`

---

## 6.3 `legal_entity`

**Purpose:** Represents the tenant’s registered companies.

Key columns:

- `id`
- `tenant_id`
- `legal_entity_code`
- `legal_name_en`
- `legal_name_ar`
- `trade_name_en`
- `trade_name_ar`
- `country_code`
- `commercial_registration_number`
- `vat_registration_number`
- `national_address_json`
- `invoice_language`
- `base_currency_code`
- `status`
- audit columns

**Unique**

- `(tenant_id, legal_entity_code)`
- `(tenant_id, country_code, commercial_registration_number)` where not null

---

## 6.4 `branch`

Key columns:

- `id`
- `tenant_id`
- `legal_entity_id`
- `branch_code`
- `name_en`
- `name_ar`
- `branch_type`
- `region_id`
- `city_id`
- `address_json`
- `timezone`
- `status`
- audit columns

**Branch types**

- rental_counter
- yard
- workshop
- warehouse
- office
- mixed

---

## 6.5 `department`

Key columns:

- `id`
- `tenant_id`
- `legal_entity_id`
- `branch_id`
- `parent_department_id`
- `department_code`
- `name_en`
- `name_ar`
- `status`

Circular parent relationships are prohibited.

---

# 7. Identity, RBAC, and Governance Tables

## 7.1 `user_account`

Key columns:

- `id`
- `tenant_id`
- `external_identity_id`
- `email`
- `mobile`
- `display_name`
- `preferred_language`
- `timezone`
- `status`
- `primary_branch_id`
- `department_id`
- `manager_user_id`
- `mfa_status`
- `last_login_at`
- `locked_at`
- audit columns

**Unique**

- `(tenant_id, lower(email))`

---

## 7.2 `role`

Key columns:

- `id`
- `tenant_id`
- `role_code`
- `name_en`
- `name_ar`
- `role_type`
- `is_system_role`
- `status`

---

## 7.3 `permission`

Key columns:

- `id`
- `permission_code`
- `domain_code`
- `action_code`
- `description`
- `risk_level`
- `is_privileged`

Permission codes follow:

```text
domain.resource.action
```

Example:

```text
contract.amendment.approve
```

---

## 7.4 `role_permission`

Columns:

- `id`
- `tenant_id`
- `role_id`
- `permission_id`
- `effect`
- `scope_policy_json`
- `effective_from`
- `effective_to`

`effect` is `allow` or `deny`.

---

## 7.5 `user_role_assignment`

Columns:

- `id`
- `tenant_id`
- `user_id`
- `role_id`
- `scope_type`
- `scope_id`
- `effective_from`
- `effective_to`
- `delegated_by`
- `assignment_reason`
- audit columns

---

## 7.6 `approval_request`

Columns:

- `id`
- `tenant_id`
- `domain_code`
- `entity_type`
- `entity_id`
- `approval_type`
- `status`
- `requested_by`
- `requested_at`
- `current_step`
- `expires_at`
- `context_snapshot_json`

---

## 7.7 `approval_action`

Columns:

- `id`
- `tenant_id`
- `approval_request_id`
- `step_number`
- `approver_user_id`
- `decision`
- `comments`
- `acted_at`
- `delegated_from_user_id`

---

## 7.8 `audit_event`

Append-only.

Columns:

- `id`
- `tenant_id`
- `occurred_at`
- `actor_user_id`
- `actor_type`
- `action_code`
- `domain_code`
- `entity_type`
- `entity_id`
- `previous_values_json`
- `new_values_json`
- `reason`
- `approval_request_id`
- `correlation_id`
- `request_id`
- `ip_address`
- `user_agent`
- `source_system`
- `integrity_hash`

**Indexes**

- `(tenant_id, occurred_at desc)`
- `(tenant_id, entity_type, entity_id, occurred_at)`
- `(tenant_id, actor_user_id, occurred_at)`

Partition by month or quarter when scale requires it.

---

# 8. Customer Domain Tables

## 8.1 `customer`

Key columns:

- `id`
- `tenant_id`
- `customer_code`
- `customer_type`
- `status`
- `legal_name_en`
- `legal_name_ar`
- `trade_name_en`
- `trade_name_ar`
- `display_name`
- `parent_customer_id`
- `country_of_registration`
- `commercial_registration_number`
- `commercial_registration_expiry_date`
- `vat_registration_number`
- `unified_number`
- `industry_code`
- `segment_code`
- `tier_code`
- `account_owner_user_id`
- `primary_branch_id`
- `preferred_language`
- `preferred_currency_code`
- `national_address_json`
- `last_reviewed_at`
- audit columns

**Unique**

- `(tenant_id, customer_code)`
- `(tenant_id, commercial_registration_number)` where applicable
- `(tenant_id, vat_registration_number)` where applicable

---

## 8.2 `customer_contact`

Key columns:

- `id`
- `tenant_id`
- `customer_id`
- `first_name`
- `middle_name`
- `last_name`
- `name_ar`
- `job_title`
- `department`
- `email`
- `mobile`
- `preferred_language`
- `status`
- `portal_access_status`
- `effective_from`
- `effective_to`

---

## 8.3 `customer_contact_role`

Columns:

- `id`
- `tenant_id`
- `customer_contact_id`
- `role_code`
- `branch_id`
- `project_id`
- `effective_from`
- `effective_to`

---

## 8.4 `customer_signatory_authority`

Columns:

- `id`
- `tenant_id`
- `customer_id`
- `customer_contact_id`
- `authority_type`
- `authority_document_id`
- `effective_from`
- `effective_to`
- `maximum_contract_value`
- `currency_code`
- `allowed_contract_types_json`
- `allowed_project_ids_json`
- `verification_status`
- `verified_by`
- `verified_at`

---

## 8.5 `customer_credit_profile`

Columns:

- `id`
- `tenant_id`
- `customer_id`
- `credit_status`
- `credit_limit`
- `temporary_credit_limit`
- `temporary_limit_expiry`
- `payment_terms_code`
- `risk_rating`
- `credit_approval_date`
- `credit_expiry_date`
- `deposit_rule_code`
- `overdue_tolerance_days`
- `maximum_days_past_due`
- `hold_reason`
- `hold_at`
- `approved_by`
- `row_version`

One active credit profile per customer and legal entity scope.

---

## 8.6 `customer_billing_profile`

Columns:

- `id`
- `tenant_id`
- `customer_id`
- `billing_entity_name`
- `billing_address_json`
- `vat_registration_number`
- `invoice_language`
- `invoice_delivery_method`
- `billing_contact_id`
- `po_required`
- `project_code_required`
- `cost_center_required`
- `consolidated_billing`
- `invoice_cycle_code`
- `supporting_document_rules_json`
- `is_default`

---

## 8.7 `customer_document`

Columns:

- `id`
- `tenant_id`
- `customer_id`
- `document_type_code`
- `current_document_version_id`
- `issue_date`
- `expiry_date`
- `issuing_authority`
- `verification_status`
- `verified_by`
- `verified_at`
- `confidentiality_level`
- `related_project_id`
- `status`

---

## 8.8 `customer_risk_flag`

Columns:

- `id`
- `tenant_id`
- `customer_id`
- `risk_type`
- `severity`
- `reason`
- `evidence_document_id`
- `effective_from`
- `effective_to`
- `status`
- `owner_user_id`
- `resolved_by`
- `resolved_at`

---

# 9. Asset Registry Tables

## 9.1 `asset_category`

Columns:

- `id`
- `tenant_id`
- `parent_category_id`
- `category_code`
- `name_en`
- `name_ar`
- `serialized_required`
- `meter_required`
- `telematics_supported`
- `operator_required`
- `transport_class_code`
- `risk_classification`
- `status`

---

## 9.2 `manufacturer`

Columns:

- `id`
- `tenant_id`
- `manufacturer_code`
- `name`
- `country_code`
- `status`

---

## 9.3 `equipment_model`

Columns:

- `id`
- `tenant_id`
- `manufacturer_id`
- `asset_category_id`
- `model_code`
- `model_name`
- `description_en`
- `description_ar`
- `standard_specification_json`
- `status`

---

## 9.4 `asset`

Columns:

- `id`
- `tenant_id`
- `asset_code`
- `serial_number`
- `manufacturer_id`
- `equipment_model_id`
- `asset_category_id`
- `ownership_type`
- `owning_legal_entity_id`
- `owning_branch_id`
- `current_status_code`
- `current_location_id`
- `current_custodian_type`
- `current_custodian_id`
- `purchase_date`
- `purchase_cost`
- `replacement_value`
- `book_value`
- `residual_value`
- `depreciation_method`
- `warranty_start_date`
- `warranty_end_date`
- `engine_number`
- `vin`
- `license_plate`
- `barcode`
- `qr_code`
- `rfid_tag`
- `specification_json`
- `commissioned_at`
- `decommissioned_at`
- `row_version`
- audit columns

**Unique**

- `(tenant_id, asset_code)`
- `(tenant_id, serial_number)` where serial number is not null
- `(tenant_id, barcode)` where not null
- `(tenant_id, qr_code)` where not null

---

## 9.5 `asset_status_history`

Append-only.

Columns:

- `id`
- `tenant_id`
- `asset_id`
- `previous_status_code`
- `new_status_code`
- `reason_code`
- `source_domain`
- `source_entity_type`
- `source_entity_id`
- `changed_by`
- `changed_at`
- `correlation_id`

---

## 9.6 `asset_location`

Columns:

- `id`
- `tenant_id`
- `location_type`
- `branch_id`
- `yard_id`
- `zone_id`
- `bay_code`
- `project_id`
- `jobsite_id`
- `latitude`
- `longitude`
- `address_json`
- `status`

---

## 9.7 `asset_location_history`

Append-only.

Columns:

- `id`
- `tenant_id`
- `asset_id`
- `from_location_id`
- `to_location_id`
- `movement_type`
- `source_domain`
- `source_entity_id`
- `moved_at`
- `moved_by`
- `verified_method`
- `gps_accuracy_meters`

---

## 9.8 `asset_meter`

Columns:

- `id`
- `tenant_id`
- `asset_id`
- `meter_type`
- `unit_code`
- `current_value`
- `lifetime_value`
- `last_reading_at`
- `last_reading_source`
- `row_version`

---

## 9.9 `asset_meter_reading`

Append-only.

Columns:

- `id`
- `tenant_id`
- `asset_meter_id`
- `reading_value`
- `reading_at`
- `source`
- `source_entity_id`
- `captured_by`
- `is_estimated`
- `quality_status`

---

## 9.10 `asset_document`

Columns:

- `id`
- `tenant_id`
- `asset_id`
- `document_type_code`
- `current_document_version_id`
- `issue_date`
- `expiry_date`
- `verification_status`
- `status`

---

# 10. Project and Jobsite Tables

## 10.1 `project`

Columns:

- `id`
- `tenant_id`
- `project_code`
- `customer_id`
- `contracting_customer_id`
- `name_en`
- `name_ar`
- `project_type`
- `status`
- `start_date`
- `expected_end_date`
- `actual_end_date`
- `project_manager_contact_id`
- `account_owner_user_id`
- `currency_code`
- `cost_center`
- `customer_reference`
- audit columns

---

## 10.2 `jobsite`

Columns:

- `id`
- `tenant_id`
- `project_id`
- `jobsite_code`
- `name_en`
- `name_ar`
- `address_json`
- `latitude`
- `longitude`
- `site_contact_id`
- `access_rules_json`
- `operating_hours_json`
- `status`

---

## 10.3 `customer_purchase_order`

Columns:

- `id`
- `tenant_id`
- `customer_id`
- `project_id`
- `po_number`
- `po_date`
- `expiry_date`
- `currency_code`
- `original_value`
- `amended_value`
- `committed_value`
- `billed_value`
- `remaining_value`
- `status`
- `document_id`
- `row_version`

---

# 11. Contract Domain Tables

## 11.1 `contract`

Columns:

- `id`
- `tenant_id`
- `contract_number`
- `contract_type`
- `parent_contract_id`
- `customer_id`
- `customer_legal_entity_id`
- `project_id`
- `jobsite_id`
- `purchase_order_id`
- `legal_entity_id`
- `branch_id`
- `status`
- `current_version_number`
- `currency_code`
- `language_code`
- `effective_date`
- `start_date`
- `expected_end_date`
- `actual_end_date`
- `contract_ceiling`
- `committed_amount`
- `signed_at`
- `activated_at`
- `closed_at`
- `account_owner_user_id`
- `row_version`
- audit columns

---

## 11.2 `contract_version`

Immutable after signature.

Columns:

- `id`
- `tenant_id`
- `contract_id`
- `version_number`
- `version_type`
- `status`
- `effective_from`
- `effective_to`
- `commercial_snapshot_json`
- `legal_snapshot_json`
- `tax_snapshot_json`
- `document_id`
- `document_hash`
- `created_at`
- `created_by`
- `signed_at`

**Unique**

- `(tenant_id, contract_id, version_number)`

---

## 11.3 `contract_line`

Columns:

- `id`
- `tenant_id`
- `contract_id`
- `contract_version_id`
- `line_number`
- `line_type`
- `asset_id`
- `asset_category_id`
- `equipment_model_id`
- `description_en`
- `description_ar`
- `quantity`
- `unit_code`
- `billing_frequency_code`
- `planned_start_date`
- `planned_end_date`
- `pricing_snapshot_json`
- `replacement_value`
- `deposit_amount`
- `tax_amount`
- `line_total`
- `status`

---

## 11.4 `contract_party`

Columns:

- `id`
- `tenant_id`
- `contract_id`
- `party_role`
- `customer_id`
- `legal_entity_id`
- `contact_id`
- `party_snapshot_json`
- `signature_required`
- `effective_from`
- `effective_to`

---

## 11.5 `contract_signature`

Columns:

- `id`
- `tenant_id`
- `contract_version_id`
- `contract_party_id`
- `signatory_contact_id`
- `signature_method`
- `signature_status`
- `provider_transaction_id`
- `signed_at`
- `ip_address`
- `device_metadata_json`
- `document_hash`
- `completion_certificate_document_id`

---

## 11.6 `contract_amendment`

Columns:

- `id`
- `tenant_id`
- `contract_id`
- `amendment_number`
- `source_version_id`
- `resulting_version_id`
- `amendment_type`
- `reason`
- `effective_date`
- `status`
- `approval_request_id`
- audit columns

---

# 12. Rental Domain Tables

## 12.1 `reservation`

Columns:

- `id`
- `tenant_id`
- `reservation_number`
- `customer_id`
- `project_id`
- `jobsite_id`
- `contract_id`
- `status`
- `reservation_type`
- `hold_expires_at`
- `planned_start_at`
- `planned_end_at`
- `branch_id`
- `priority_code`
- audit columns

---

## 12.2 `reservation_line`

Columns:

- `id`
- `tenant_id`
- `reservation_id`
- `asset_id`
- `asset_category_id`
- `equipment_model_id`
- `quantity`
- `planned_start_at`
- `planned_end_at`
- `allocation_status`
- `status`

---

## 12.3 `rental`

Columns:

- `id`
- `tenant_id`
- `rental_number`
- `contract_id`
- `customer_id`
- `project_id`
- `jobsite_id`
- `status`
- `actual_start_at`
- `expected_return_at`
- `actual_end_at`
- `branch_id`
- `off_hire_requested_at`
- `closed_at`
- audit columns

---

## 12.4 `rental_asset`

Columns:

- `id`
- `tenant_id`
- `rental_id`
- `contract_line_id`
- `asset_id`
- `status`
- `allocated_at`
- `checked_out_at`
- `expected_return_at`
- `returned_at`
- `billing_stop_at`
- `substituted_from_rental_asset_id`
- `substituted_to_rental_asset_id`

---

## 12.5 `rental_checkout`

Columns:

- `id`
- `tenant_id`
- `rental_asset_id`
- `checkout_at`
- `checkout_location_id`
- `meter_reading_json`
- `fuel_level`
- `condition_status`
- `checklist_response_json`
- `customer_contact_id`
- `completed_by`
- `signature_document_id`
- `status`

---

## 12.6 `rental_return`

Columns:

- `id`
- `tenant_id`
- `rental_asset_id`
- `returned_at`
- `return_location_id`
- `meter_reading_json`
- `fuel_level`
- `condition_status`
- `damage_detected`
- `checklist_response_json`
- `received_by`
- `customer_contact_id`
- `status`

---

## 12.7 `rental_extension`

Columns:

- `id`
- `tenant_id`
- `rental_id`
- `rental_asset_id`
- `previous_end_at`
- `requested_end_at`
- `approved_end_at`
- `status`
- `reason`
- `contract_amendment_id`
- `approval_request_id`

---

# 13. Dispatch and Logistics Tables

## 13.1 `dispatch_order`

Columns:

- `id`
- `tenant_id`
- `dispatch_number`
- `dispatch_type`
- `rental_id`
- `contract_id`
- `project_id`
- `jobsite_id`
- `source_location_id`
- `destination_location_id`
- `planned_departure_at`
- `planned_arrival_at`
- `actual_departure_at`
- `actual_arrival_at`
- `status`
- `priority_code`
- audit columns

---

## 13.2 `dispatch_item`

Columns:

- `id`
- `tenant_id`
- `dispatch_order_id`
- `asset_id`
- `inventory_item_id`
- `quantity`
- `load_sequence`
- `status`
- `loaded_at`
- `unloaded_at`

---

## 13.3 `transport_vehicle`

Columns:

- `id`
- `tenant_id`
- `vehicle_code`
- `vehicle_type`
- `license_plate`
- `capacity_weight`
- `capacity_volume`
- `home_branch_id`
- `status`
- `current_location_id`

---

## 13.4 `trailer`

Columns:

- `id`
- `tenant_id`
- `trailer_code`
- `trailer_type`
- `license_plate`
- `capacity_weight`
- `status`
- `home_branch_id`

---

## 13.5 `driver`

Columns:

- `id`
- `tenant_id`
- `user_id`
- `employee_code`
- `license_number`
- `license_class`
- `license_expiry_date`
- `home_branch_id`
- `status`

---

## 13.6 `dispatch_assignment`

Columns:

- `id`
- `tenant_id`
- `dispatch_order_id`
- `transport_vehicle_id`
- `trailer_id`
- `driver_id`
- `assigned_at`
- `assignment_status`

---

## 13.7 `proof_of_delivery`

Columns:

- `id`
- `tenant_id`
- `dispatch_order_id`
- `delivered_at`
- `latitude`
- `longitude`
- `customer_contact_id`
- `signature_document_id`
- `photo_document_group_id`
- `notes`
- `verified_by`

---

# 14. Maintenance and PPM Tables

## 14.1 `maintenance_request`

Columns:

- `id`
- `tenant_id`
- `asset_id`
- `request_type`
- `source_domain`
- `source_entity_id`
- `reported_at`
- `reported_by`
- `severity`
- `description`
- `status`

---

## 14.2 `work_order`

Columns:

- `id`
- `tenant_id`
- `work_order_number`
- `asset_id`
- `maintenance_request_id`
- `work_order_type`
- `priority`
- `status`
- `workshop_id`
- `assigned_technician_id`
- `planned_start_at`
- `planned_end_at`
- `actual_start_at`
- `actual_end_at`
- `downtime_start_at`
- `downtime_end_at`
- `diagnosis`
- `resolution`
- `warranty_eligible`
- `ready_to_rent_status`
- audit columns

---

## 14.3 `ppm_plan`

Columns:

- `id`
- `tenant_id`
- `asset_id`
- `equipment_model_id`
- `plan_code`
- `time_interval_days`
- `meter_interval_value`
- `meter_type`
- `lookahead_days`
- `last_completed_at`
- `next_due_at`
- `next_due_meter_value`
- `status`

---

## 14.4 `work_order_labor`

Columns:

- `id`
- `tenant_id`
- `work_order_id`
- `technician_id`
- `labor_type`
- `started_at`
- `ended_at`
- `hours`
- `labor_cost`
- `notes`

---

## 14.5 `work_order_part`

Columns:

- `id`
- `tenant_id`
- `work_order_id`
- `inventory_item_id`
- `quantity`
- `unit_cost`
- `total_cost`
- `inventory_transaction_id`

---

## 14.6 `inspection`

Columns:

- `id`
- `tenant_id`
- `asset_id`
- `inspection_type`
- `source_domain`
- `source_entity_id`
- `inspection_template_id`
- `inspected_at`
- `inspected_by`
- `result`
- `response_json`
- `photo_document_group_id`
- `next_action_code`

---

## 14.7 `certificate`

Columns:

- `id`
- `tenant_id`
- `asset_id`
- `certificate_type`
- `certificate_number`
- `issue_date`
- `expiry_date`
- `issuing_authority`
- `verification_status`
- `document_id`
- `status`

---

# 15. Inventory Tables

## 15.1 `warehouse`

Columns:

- `id`
- `tenant_id`
- `branch_id`
- `warehouse_code`
- `name_en`
- `name_ar`
- `warehouse_type`
- `status`

---

## 15.2 `warehouse_bin`

Columns:

- `id`
- `tenant_id`
- `warehouse_id`
- `zone_code`
- `aisle_code`
- `rack_code`
- `shelf_code`
- `bin_code`
- `status`

Unique: `(tenant_id, warehouse_id, bin_code)`

---

## 15.3 `inventory_item`

Columns:

- `id`
- `tenant_id`
- `sku`
- `item_type`
- `name_en`
- `name_ar`
- `unit_code`
- `manufacturer_id`
- `preferred_vendor_id`
- `barcode`
- `qr_code`
- `minimum_quantity`
- `maximum_quantity`
- `reorder_quantity`
- `cost_method`
- `standard_cost`
- `status`

---

## 15.4 `inventory_balance`

Columns:

- `id`
- `tenant_id`
- `inventory_item_id`
- `warehouse_id`
- `warehouse_bin_id`
- `lot_id`
- `quantity_on_hand`
- `quantity_reserved`
- `quantity_available`
- `quantity_in_transit`
- `row_version`

Unique by item/location/lot.

---

## 15.5 `inventory_transaction`

Append-only.

Columns:

- `id`
- `tenant_id`
- `transaction_number`
- `transaction_type`
- `inventory_item_id`
- `quantity`
- `unit_code`
- `unit_cost`
- `source_warehouse_id`
- `source_bin_id`
- `destination_warehouse_id`
- `destination_bin_id`
- `source_domain`
- `source_entity_id`
- `occurred_at`
- `performed_by`
- `reversal_of_transaction_id`
- `reason_code`

---

## 15.6 `inventory_reservation`

Columns:

- `id`
- `tenant_id`
- `inventory_item_id`
- `warehouse_id`
- `quantity`
- `source_domain`
- `source_entity_id`
- `reserved_at`
- `expires_at`
- `status`

---

## 15.7 `cycle_count`

Columns:

- `id`
- `tenant_id`
- `warehouse_id`
- `count_number`
- `scope_json`
- `status`
- `scheduled_at`
- `started_at`
- `completed_at`
- `approved_by`

---

## 15.8 `cycle_count_line`

Columns:

- `id`
- `tenant_id`
- `cycle_count_id`
- `inventory_item_id`
- `warehouse_bin_id`
- `system_quantity`
- `counted_quantity`
- `variance_quantity`
- `adjustment_transaction_id`
- `status`

---

# 16. Pricing Tables

## 16.1 `rate_card`

Columns:

- `id`
- `tenant_id`
- `rate_card_code`
- `name`
- `scope_type`
- `scope_id`
- `currency_code`
- `effective_from`
- `effective_to`
- `status`
- `version`

---

## 16.2 `rate_card_line`

Columns:

- `id`
- `tenant_id`
- `rate_card_id`
- `asset_category_id`
- `equipment_model_id`
- `item_type`
- `billing_unit_code`
- `minimum_quantity`
- `minimum_duration`
- `base_rate`
- `floor_rate`
- `target_rate`
- `maximum_rate`
- `included_usage`
- `overage_rate`
- `deposit_rule_id`
- `tax_code`
- `effective_from`
- `effective_to`

---

## 16.3 `discount_rule`

Columns:

- `id`
- `tenant_id`
- `discount_code`
- `discount_type`
- `scope_type`
- `scope_id`
- `value`
- `maximum_value`
- `minimum_margin`
- `approval_threshold`
- `effective_from`
- `effective_to`
- `status`

---

## 16.4 `pricing_calculation`

Append-only calculation evidence.

Columns:

- `id`
- `tenant_id`
- `calculation_context`
- `source_entity_type`
- `source_entity_id`
- `input_snapshot_json`
- `rule_snapshot_json`
- `result_snapshot_json`
- `currency_code`
- `subtotal`
- `discount_total`
- `tax_total`
- `grand_total`
- `calculated_at`
- `calculation_version`

---

# 17. Finance Tables

## 17.1 `invoice`

Columns:

- `id`
- `tenant_id`
- `invoice_number`
- `invoice_type`
- `customer_id`
- `contract_id`
- `project_id`
- `billing_profile_id`
- `currency_code`
- `status`
- `invoice_date`
- `due_date`
- `billing_period_start`
- `billing_period_end`
- `subtotal`
- `discount_total`
- `tax_total`
- `grand_total`
- `amount_paid`
- `amount_outstanding`
- `zatca_status`
- `zatca_uuid`
- `issued_at`
- `closed_at`
- `row_version`
- audit columns

---

## 17.2 `invoice_line`

Columns:

- `id`
- `tenant_id`
- `invoice_id`
- `line_number`
- `source_domain`
- `source_entity_id`
- `contract_line_id`
- `description_en`
- `description_ar`
- `quantity`
- `unit_code`
- `unit_price`
- `discount_amount`
- `tax_code`
- `tax_amount`
- `line_total`
- `pricing_calculation_id`

---

## 17.3 `payment`

Columns:

- `id`
- `tenant_id`
- `payment_number`
- `customer_id`
- `payment_method`
- `currency_code`
- `amount`
- `payment_date`
- `status`
- `external_transaction_id`
- `bank_reference`
- `received_by`
- `reversed_payment_id`
- audit columns

---

## 17.4 `payment_allocation`

Columns:

- `id`
- `tenant_id`
- `payment_id`
- `invoice_id`
- `allocated_amount`
- `allocated_at`
- `allocated_by`
- `reversed_at`
- `reversal_reason`

---

## 17.5 `deposit`

Columns:

- `id`
- `tenant_id`
- `contract_id`
- `customer_id`
- `required_amount`
- `collected_amount`
- `applied_amount`
- `released_amount`
- `forfeited_amount`
- `currency_code`
- `method`
- `status`
- `external_transaction_id`

---

## 17.6 `credit_note`

Columns:

- `id`
- `tenant_id`
- `credit_note_number`
- `customer_id`
- `original_invoice_id`
- `reason_code`
- `currency_code`
- `amount`
- `tax_amount`
- `status`
- `issued_at`
- `approval_request_id`

---

## 17.7 `debit_note`

Same core structure as credit note, with charge reason and source references.

---

## 17.8 `refund`

Columns:

- `id`
- `tenant_id`
- `refund_number`
- `customer_id`
- `payment_id`
- `deposit_id`
- `amount`
- `currency_code`
- `reason_code`
- `status`
- `approval_request_id`
- `external_transaction_id`
- `processed_at`

---

## 17.9 `collection_case`

Columns:

- `id`
- `tenant_id`
- `customer_id`
- `assigned_to`
- `status`
- `total_outstanding`
- `oldest_due_date`
- `risk_level`
- `promise_to_pay_date`
- `next_action_at`
- `legal_escalation_status`

---

# 18. Document and File Tables

## 18.1 `document`

Columns:

- `id`
- `tenant_id`
- `document_type_code`
- `owner_domain`
- `owner_entity_type`
- `owner_entity_id`
- `current_version_id`
- `confidentiality_level`
- `retention_category`
- `status`
- `created_at`
- `created_by`

---

## 18.2 `document_version`

Immutable.

Columns:

- `id`
- `tenant_id`
- `document_id`
- `version_number`
- `storage_key`
- `original_file_name`
- `content_type`
- `file_size_bytes`
- `sha256_hash`
- `encryption_key_reference`
- `malware_scan_status`
- `uploaded_at`
- `uploaded_by`

---

## 18.3 `document_access_log`

Append-only.

Columns:

- `id`
- `tenant_id`
- `document_id`
- `document_version_id`
- `user_id`
- `action_code`
- `occurred_at`
- `ip_address`
- `correlation_id`

---

# 19. Notification and Integration Tables

## 19.1 `notification`

Columns:

- `id`
- `tenant_id`
- `recipient_type`
- `recipient_id`
- `template_code`
- `channel`
- `language_code`
- `subject`
- `body`
- `status`
- `scheduled_at`
- `sent_at`
- `failure_reason`
- `source_domain`
- `source_entity_id`

---

## 19.2 `integration_connection`

Columns:

- `id`
- `tenant_id`
- `integration_type`
- `provider_code`
- `status`
- `configuration_reference`
- `credential_secret_reference`
- `last_success_at`
- `last_failure_at`

Never store raw secrets in this table.

---

## 19.3 `integration_message`

Append-only.

Columns:

- `id`
- `tenant_id`
- `integration_connection_id`
- `direction`
- `message_type`
- `external_message_id`
- `payload_hash`
- `status`
- `attempt_count`
- `next_retry_at`
- `received_or_sent_at`
- `correlation_id`

---

# 20. Reporting Tables

## 20.1 `kpi_definition`

Columns:

- `id`
- `tenant_id`
- `kpi_code`
- `name`
- `description`
- `formula_definition_json`
- `source_definition_json`
- `refresh_frequency`
- `owner_role_code`
- `status`
- `version`

---

## 20.2 `dashboard_definition`

Columns:

- `id`
- `tenant_id`
- `dashboard_code`
- `name`
- `dashboard_type`
- `owner_user_id`
- `visibility_scope`
- `layout_json`
- `filter_definition_json`
- `status`

---

## 20.3 `saved_view`

Columns:

- `id`
- `tenant_id`
- `user_id`
- `entity_type`
- `name`
- `filter_json`
- `sort_json`
- `column_json`
- `visibility_scope`
- `is_default`

---

# 21. Event and Job Tables

## 21.1 `domain_event`

Append-only.

Columns:

- `id`
- `tenant_id`
- `event_type`
- `event_version`
- `aggregate_type`
- `aggregate_id`
- `payload_json`
- `occurred_at`
- `published_at`
- `correlation_id`
- `causation_id`
- `status`

---

## 21.2 `outbox_message`

Used for transactional event publishing.

Columns:

- `id`
- `tenant_id`
- `event_id`
- `payload_json`
- `status`
- `attempt_count`
- `next_attempt_at`
- `created_at`
- `published_at`

---

## 21.3 `background_job_execution`

Columns:

- `id`
- `tenant_id`
- `job_type`
- `job_key`
- `status`
- `started_at`
- `completed_at`
- `attempt_count`
- `error_summary`
- `correlation_id`

---

# 22. Indexing Strategy

## 22.1 Required Index Classes

- Primary-key indexes
- Foreign-key indexes
- Tenant-scoped unique indexes
- Status and date indexes
- Search indexes
- Partial indexes
- Composite operational indexes

## 22.2 Examples

```sql
create index idx_asset_tenant_status
on asset (tenant_id, current_status_code);

create index idx_contract_tenant_customer_status
on contract (tenant_id, customer_id, status);

create index idx_invoice_tenant_due_status
on invoice (tenant_id, due_date, status);

create index idx_work_order_tenant_asset_status
on work_order (tenant_id, asset_id, status);
```

## 22.3 Search

Use PostgreSQL trigram and full-text search initially for:

- Asset code
- serial number
- customer names
- contract number
- invoice number
- project name

OpenSearch should be introduced only when justified by scale or search requirements.

---

# 23. Constraint Strategy

Critical business integrity must use database constraints where practical.

Examples:

- Non-negative money
- non-negative quantities
- end date not before start date
- expiry date not before issue date
- unique contract version number
- one current asset status
- one active customer credit profile per scope
- one active inventory balance per item/location/lot
- no circular customer or department hierarchy

Application services remain responsible for complex workflow rules.

---

# 24. Soft Delete and Retention

## 24.1 Never Physically Delete

Do not physically delete:

- Customers with history
- Assets
- Contracts
- Contract versions
- Rentals
- Dispatch records
- Work orders
- Invoices
- Payments
- Audit events
- Documents with legal history
- Inventory transactions

## 24.2 Soft Delete Candidates

Potentially:

- Draft configuration records
- unused saved views
- inactive templates without usage
- unsubmitted draft records

Even soft deletion requires audit.

---

# 25. Partitioning Candidates

Future partitioning candidates:

- `audit_event`
- `domain_event`
- `integration_message`
- `asset_meter_reading`
- `asset_location_history`
- `inventory_transaction`
- `notification`
- `background_job_execution`

Partition by tenant and/or time depending on deployment scale.

---

# 26. Data Migration Requirements

Every migrated record should preserve:

- Source system
- source record ID
- migration batch ID
- migration timestamp
- validation status
- exception status
- source hash where useful

Recommended shared columns or mapping table:

## `migration_record_map`

- `id`
- `tenant_id`
- `migration_batch_id`
- `source_system`
- `source_entity`
- `source_record_id`
- `target_entity`
- `target_record_id`
- `status`
- `error_message`

---

# 27. Database Security

- Encrypt storage and backups.
- Use TLS for connections.
- Separate application, migration, reporting, and administrative roles.
- Application accounts must not own the database.
- Production access must be time-limited and audited.
- Raw secrets must never be stored in business tables.
- Sensitive columns may require application-level encryption.
- Reporting access should use governed views or replicas.
- Tenant scope must be enforced consistently.

---

# 28. Database Testing Requirements

Required test categories:

- Foreign-key integrity
- unique constraints
- tenant isolation
- concurrency
- optimistic locking
- immutable record protection
- financial precision
- time-zone behavior
- hierarchy cycle prevention
- status transition coordination
- idempotency
- migration rollback
- large-volume query performance

---

# 29. Open Questions

1. Prisma or Drizzle as the ORM?
2. UUID version 7 or version 4?
3. Is PostgreSQL row-level security mandatory at launch?
4. Should dedicated enterprise tenants use separate databases?
5. Which tables require legal-entity scope in addition to tenant scope?
6. Is customer credit managed fully in ERMS?
7. Are operators employees, vendors, or both?
8. Should attachments be modeled as assets, inventory, or configurable hybrid entities?
9. Which telemetry fields require separate normalized tables?
10. Which ZATCA fields must be included directly in invoice tables?
11. Which accounting platform is integrated first?
12. What retention periods apply by document and country?
13. What exact rate-card inheritance model is approved?
14. Are project entities shared across customer subsidiaries?
15. Is consolidated cross-legal-entity billing permitted?

---

# 30. Acceptance Criteria

This database dictionary is approved when:

1. Every major entity has one owner.
2. Every table is tenant-scoped where required.
3. Primary and foreign keys are defined.
4. Key uniqueness rules are defined.
5. Financial precision is standardized.
6. Signed and financial records are immutable.
7. Asset status and location history are preserved.
8. Customer hierarchy and credit are represented.
9. Contract versioning is explicit.
10. Rental and dispatch records preserve line-level timelines.
11. Maintenance and inventory consumption are traceable.
12. Invoice, payment, deposit, and adjustment relationships are defined.
13. Audit, events, documents, and integrations are append-only where required.
14. Index and partitioning strategies are documented.
15. No developer must invent a core table without updating this document.

---

# 31. Next Engineering Document

The next document should be:

**19 — API Registry and Contract Standards**

It will define:

- Every API domain
- endpoint naming
- request and response conventions
- permissions
- tenant enforcement
- pagination
- filtering
- idempotency
- errors
- events
- webhook standards
- versioning
- OpenAPI requirements
- endpoint registry by module

The API Registry should be completed before detailed UI route and screen contracts are locked.
