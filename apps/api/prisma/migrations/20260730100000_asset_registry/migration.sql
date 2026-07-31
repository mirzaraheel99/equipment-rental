-- Phase 05 — Asset Registry Foundation
-- Implements docs/06-Data/18-ENTERPRISE-DATABASE-DICTIONARY.md §9 per
-- docs/04-Domain/05-ASSET-REGISTRY-DOMAIN-SPECIFICATION.md ("the Golden
-- Rule": exactly one authoritative status and one authoritative location
-- per asset). Generated via `prisma migrate diff --from-empty --to-schema`
-- against the full schema (no live database available in this environment
-- — see Decision Register), then hand-trimmed to only the tables this
-- migration adds, matching the technique used for prior phases' migrations.

-- CreateTable
CREATE TABLE "asset_category" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "parent_category_id" UUID,
    "category_code" VARCHAR(50) NOT NULL,
    "name_en" VARCHAR(200) NOT NULL,
    "name_ar" VARCHAR(200),
    "serialized_required" BOOLEAN NOT NULL DEFAULT true,
    "meter_required" BOOLEAN NOT NULL DEFAULT false,
    "telematics_supported" BOOLEAN NOT NULL DEFAULT false,
    "operator_required" BOOLEAN NOT NULL DEFAULT false,
    "transport_class_code" VARCHAR(50),
    "risk_classification" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL,

    CONSTRAINT "asset_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manufacturer" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "manufacturer_code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "country_code" CHAR(2),
    "status" VARCHAR(20) NOT NULL,

    CONSTRAINT "manufacturer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_model" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "manufacturer_id" UUID NOT NULL,
    "asset_category_id" UUID NOT NULL,
    "model_code" VARCHAR(50) NOT NULL,
    "model_name" VARCHAR(200) NOT NULL,
    "description_en" VARCHAR(2000),
    "description_ar" VARCHAR(2000),
    "standard_specification_json" JSONB,
    "status" VARCHAR(20) NOT NULL,

    CONSTRAINT "equipment_model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "asset_code" VARCHAR(50) NOT NULL,
    "serial_number" VARCHAR(100),
    "manufacturer_id" UUID,
    "equipment_model_id" UUID,
    "asset_category_id" UUID NOT NULL,
    "ownership_type" VARCHAR(20) NOT NULL,
    "owning_legal_entity_id" UUID NOT NULL,
    "owning_branch_id" UUID NOT NULL,
    "current_status_code" VARCHAR(40) NOT NULL,
    "current_location_id" UUID,
    "current_custodian_type" VARCHAR(20),
    "current_custodian_id" UUID,
    "purchase_date" DATE,
    "purchase_cost" DECIMAL(19,4),
    "replacement_value" DECIMAL(19,4),
    "book_value" DECIMAL(19,4),
    "residual_value" DECIMAL(19,4),
    "depreciation_method" VARCHAR(40),
    "warranty_start_date" DATE,
    "warranty_end_date" DATE,
    "engine_number" VARCHAR(100),
    "vin" VARCHAR(50),
    "license_plate" VARCHAR(30),
    "barcode" VARCHAR(100),
    "qr_code" VARCHAR(100),
    "rfid_tag" VARCHAR(100),
    "specification_json" JSONB,
    "commissioned_at" TIMESTAMPTZ(3),
    "decommissioned_at" TIMESTAMPTZ(3),
    "row_version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_status_history" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "previous_status_code" VARCHAR(40),
    "new_status_code" VARCHAR(40) NOT NULL,
    "reason_code" VARCHAR(60),
    "source_domain" VARCHAR(60) NOT NULL,
    "source_entity_type" VARCHAR(100),
    "source_entity_id" UUID,
    "changed_by" UUID,
    "changed_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "correlation_id" UUID,

    CONSTRAINT "asset_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_location" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "location_type" VARCHAR(20) NOT NULL,
    "branch_id" UUID,
    "yard_id" UUID,
    "zone_id" UUID,
    "bay_code" VARCHAR(50),
    "project_id" UUID,
    "jobsite_id" UUID,
    "latitude" DECIMAL(9,6),
    "longitude" DECIMAL(9,6),
    "address_json" JSONB,
    "status" VARCHAR(20) NOT NULL,

    CONSTRAINT "asset_location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_location_history" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "from_location_id" UUID,
    "to_location_id" UUID NOT NULL,
    "movement_type" VARCHAR(20) NOT NULL,
    "source_domain" VARCHAR(60) NOT NULL,
    "source_entity_id" UUID,
    "moved_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moved_by" UUID,
    "verified_method" VARCHAR(20),
    "gps_accuracy_meters" DECIMAL(6,2),

    CONSTRAINT "asset_location_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_meter" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "meter_type" VARCHAR(20) NOT NULL,
    "unit_code" VARCHAR(20) NOT NULL,
    "current_value" DECIMAL(19,6) NOT NULL DEFAULT 0,
    "lifetime_value" DECIMAL(19,6) NOT NULL DEFAULT 0,
    "last_reading_at" TIMESTAMPTZ(3),
    "last_reading_source" VARCHAR(20),
    "row_version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "asset_meter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_meter_reading" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "asset_meter_id" UUID NOT NULL,
    "reading_value" DECIMAL(19,6) NOT NULL,
    "reading_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" VARCHAR(20) NOT NULL,
    "source_entity_id" UUID,
    "captured_by" UUID,
    "is_estimated" BOOLEAN NOT NULL DEFAULT false,
    "quality_status" VARCHAR(20) NOT NULL,

    CONSTRAINT "asset_meter_reading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_document" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "asset_id" UUID NOT NULL,
    "document_type_code" VARCHAR(60) NOT NULL,
    "current_document_version_id" UUID,
    "issue_date" DATE,
    "expiry_date" DATE,
    "verification_status" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL,

    CONSTRAINT "asset_document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "asset_category_tenant_id_category_code_key" ON "asset_category"("tenant_id", "category_code");

-- CreateIndex
CREATE UNIQUE INDEX "manufacturer_tenant_id_manufacturer_code_key" ON "manufacturer"("tenant_id", "manufacturer_code");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_model_tenant_id_model_code_key" ON "equipment_model"("tenant_id", "model_code");

-- CreateIndex
CREATE INDEX "idx_asset_tenant_status" ON "asset"("tenant_id", "current_status_code");

-- CreateIndex
CREATE INDEX "idx_asset_tenant_branch" ON "asset"("tenant_id", "owning_branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "asset_tenant_id_asset_code_key" ON "asset"("tenant_id", "asset_code");

-- CreateIndex
CREATE UNIQUE INDEX "asset_tenant_id_serial_number_key" ON "asset"("tenant_id", "serial_number");

-- CreateIndex
CREATE UNIQUE INDEX "asset_tenant_id_barcode_key" ON "asset"("tenant_id", "barcode");

-- CreateIndex
CREATE UNIQUE INDEX "asset_tenant_id_qr_code_key" ON "asset"("tenant_id", "qr_code");

-- CreateIndex
CREATE INDEX "idx_asset_status_history_asset" ON "asset_status_history"("tenant_id", "asset_id", "changed_at");

-- CreateIndex
CREATE INDEX "idx_asset_location_tenant_type" ON "asset_location"("tenant_id", "location_type");

-- CreateIndex
CREATE INDEX "idx_asset_location_history_asset" ON "asset_location_history"("tenant_id", "asset_id", "moved_at");

-- CreateIndex
CREATE UNIQUE INDEX "asset_meter_tenant_id_asset_id_meter_type_key" ON "asset_meter"("tenant_id", "asset_id", "meter_type");

-- CreateIndex
CREATE INDEX "idx_asset_meter_reading_meter" ON "asset_meter_reading"("tenant_id", "asset_meter_id", "reading_at");

-- CreateIndex
CREATE INDEX "idx_asset_document_asset_type" ON "asset_document"("tenant_id", "asset_id", "document_type_code");

-- AddForeignKey
ALTER TABLE "asset_category" ADD CONSTRAINT "asset_category_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_category" ADD CONSTRAINT "asset_category_parent_category_id_fkey" FOREIGN KEY ("parent_category_id") REFERENCES "asset_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manufacturer" ADD CONSTRAINT "manufacturer_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_model" ADD CONSTRAINT "equipment_model_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_model" ADD CONSTRAINT "equipment_model_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_model" ADD CONSTRAINT "equipment_model_asset_category_id_fkey" FOREIGN KEY ("asset_category_id") REFERENCES "asset_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset" ADD CONSTRAINT "asset_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset" ADD CONSTRAINT "asset_manufacturer_id_fkey" FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset" ADD CONSTRAINT "asset_equipment_model_id_fkey" FOREIGN KEY ("equipment_model_id") REFERENCES "equipment_model"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset" ADD CONSTRAINT "asset_asset_category_id_fkey" FOREIGN KEY ("asset_category_id") REFERENCES "asset_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset" ADD CONSTRAINT "asset_owning_legal_entity_id_fkey" FOREIGN KEY ("owning_legal_entity_id") REFERENCES "legal_entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset" ADD CONSTRAINT "asset_owning_branch_id_fkey" FOREIGN KEY ("owning_branch_id") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset" ADD CONSTRAINT "asset_current_location_id_fkey" FOREIGN KEY ("current_location_id") REFERENCES "asset_location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_status_history" ADD CONSTRAINT "asset_status_history_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_status_history" ADD CONSTRAINT "asset_status_history_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_location" ADD CONSTRAINT "asset_location_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_location" ADD CONSTRAINT "asset_location_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_location_history" ADD CONSTRAINT "asset_location_history_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_location_history" ADD CONSTRAINT "asset_location_history_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_location_history" ADD CONSTRAINT "asset_location_history_from_location_id_fkey" FOREIGN KEY ("from_location_id") REFERENCES "asset_location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_location_history" ADD CONSTRAINT "asset_location_history_to_location_id_fkey" FOREIGN KEY ("to_location_id") REFERENCES "asset_location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_meter" ADD CONSTRAINT "asset_meter_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_meter" ADD CONSTRAINT "asset_meter_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_meter_reading" ADD CONSTRAINT "asset_meter_reading_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_meter_reading" ADD CONSTRAINT "asset_meter_reading_asset_meter_id_fkey" FOREIGN KEY ("asset_meter_id") REFERENCES "asset_meter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_document" ADD CONSTRAINT "asset_document_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_document" ADD CONSTRAINT "asset_document_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_document" ADD CONSTRAINT "asset_document_current_document_version_id_fkey" FOREIGN KEY ("current_document_version_id") REFERENCES "document_version"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Hand-appended CHECK constraints — Prisma's schema DSL has no stable CHECK
-- syntax as of Prisma 7 (see Decision Register #25, applied here the same way).
ALTER TABLE "asset_category" ADD CONSTRAINT "asset_category_risk_classification_check"
  CHECK ("risk_classification" IN ('low', 'medium', 'high'));
ALTER TABLE "asset_category" ADD CONSTRAINT "asset_category_status_check"
  CHECK ("status" IN ('active', 'inactive'));
ALTER TABLE "manufacturer" ADD CONSTRAINT "manufacturer_status_check"
  CHECK ("status" IN ('active', 'inactive'));
ALTER TABLE "equipment_model" ADD CONSTRAINT "equipment_model_status_check"
  CHECK ("status" IN ('active', 'inactive'));
ALTER TABLE "asset" ADD CONSTRAINT "asset_ownership_type_check"
  CHECK ("ownership_type" IN ('owned', 'leased', 'consigned'));
ALTER TABLE "asset" ADD CONSTRAINT "asset_current_status_code_check"
  CHECK ("current_status_code" IN (
    'Available', 'Reserved', 'Rented', 'InTransit', 'InInspection', 'InService',
    'PpmDue', 'PpmLocked', 'DamagedUnderClaimReview', 'MissingLost',
    'ForSale', 'Sold', 'Decommissioned'
  ));
ALTER TABLE "asset" ADD CONSTRAINT "asset_current_custodian_type_check"
  CHECK ("current_custodian_type" IN ('internal', 'customer', 'employee', 'vendor'));
ALTER TABLE "asset_location" ADD CONSTRAINT "asset_location_location_type_check"
  CHECK ("location_type" IN ('branch', 'yard', 'jobsite', 'in_transit', 'with_customer'));
ALTER TABLE "asset_location" ADD CONSTRAINT "asset_location_status_check"
  CHECK ("status" IN ('active', 'inactive'));
ALTER TABLE "asset_location_history" ADD CONSTRAINT "asset_location_history_movement_type_check"
  CHECK ("movement_type" IN ('transfer', 'delivery', 'pickup', 'return', 'initial'));
ALTER TABLE "asset_location_history" ADD CONSTRAINT "asset_location_history_verified_method_check"
  CHECK ("verified_method" IN ('manual', 'gps', 'scan'));
ALTER TABLE "asset_meter" ADD CONSTRAINT "asset_meter_meter_type_check"
  CHECK ("meter_type" IN ('engine_hours', 'mileage', 'cycles'));
ALTER TABLE "asset_meter" ADD CONSTRAINT "asset_meter_last_reading_source_check"
  CHECK ("last_reading_source" IN ('manual', 'telematics'));
ALTER TABLE "asset_meter_reading" ADD CONSTRAINT "asset_meter_reading_source_check"
  CHECK ("source" IN ('manual', 'telematics'));
ALTER TABLE "asset_meter_reading" ADD CONSTRAINT "asset_meter_reading_quality_status_check"
  CHECK ("quality_status" IN ('ok', 'anomaly'));
ALTER TABLE "asset_document" ADD CONSTRAINT "asset_document_verification_status_check"
  CHECK ("verification_status" IN ('pending', 'verified', 'rejected'));
ALTER TABLE "asset_document" ADD CONSTRAINT "asset_document_status_check"
  CHECK ("status" IN ('active', 'superseded', 'archived'));
