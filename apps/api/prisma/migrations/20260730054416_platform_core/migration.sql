-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "tenant" (
    "id" UUID NOT NULL,
    "tenant_code" VARCHAR(50) NOT NULL,
    "name_en" VARCHAR(200) NOT NULL,
    "name_ar" VARCHAR(200),
    "tenant_type" VARCHAR(40) NOT NULL,
    "status" VARCHAR(30) NOT NULL,
    "default_country_code" CHAR(2) NOT NULL,
    "default_currency_code" CHAR(3) NOT NULL,
    "default_language_code" VARCHAR(10) NOT NULL,
    "default_timezone" VARCHAR(100) NOT NULL,
    "data_residency_region" VARCHAR(100),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_setting" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "setting_key" VARCHAR(150) NOT NULL,
    "setting_value_json" JSONB NOT NULL,
    "effective_from" TIMESTAMPTZ(3) NOT NULL,
    "effective_to" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "tenant_setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legal_entity" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "legal_entity_code" VARCHAR(50) NOT NULL,
    "legal_name_en" VARCHAR(300) NOT NULL,
    "legal_name_ar" VARCHAR(300),
    "trade_name_en" VARCHAR(300),
    "trade_name_ar" VARCHAR(300),
    "country_code" CHAR(2) NOT NULL,
    "commercial_registration_number" VARCHAR(50),
    "vat_registration_number" VARCHAR(50),
    "national_address_json" JSONB,
    "invoice_language" VARCHAR(10) NOT NULL,
    "base_currency_code" CHAR(3) NOT NULL,
    "status" VARCHAR(30) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" UUID,
    "row_version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "legal_entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "legal_entity_id" UUID NOT NULL,
    "branch_code" VARCHAR(50) NOT NULL,
    "name_en" VARCHAR(200) NOT NULL,
    "name_ar" VARCHAR(200),
    "branch_type" VARCHAR(30) NOT NULL,
    "region_id" UUID,
    "city_id" UUID,
    "address_json" JSONB,
    "timezone" VARCHAR(100) NOT NULL,
    "status" VARCHAR(30) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" UUID,
    "row_version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "legal_entity_id" UUID NOT NULL,
    "branch_id" UUID,
    "parent_department_id" UUID,
    "department_code" VARCHAR(50) NOT NULL,
    "name_en" VARCHAR(200) NOT NULL,
    "name_ar" VARCHAR(200),
    "status" VARCHAR(30) NOT NULL,

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_event" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor_user_id" UUID,
    "actor_type" VARCHAR(20) NOT NULL,
    "action_code" VARCHAR(100) NOT NULL,
    "domain_code" VARCHAR(60) NOT NULL,
    "entity_type" VARCHAR(100) NOT NULL,
    "entity_id" UUID NOT NULL,
    "previous_values_json" JSONB,
    "new_values_json" JSONB,
    "reason" VARCHAR(1000),
    "approval_request_id" UUID,
    "correlation_id" UUID,
    "request_id" UUID,
    "ip_address" VARCHAR(64),
    "user_agent" VARCHAR(500),
    "source_system" VARCHAR(60),
    "integrity_hash" VARCHAR(128),

    CONSTRAINT "audit_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domain_event" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "event_type" VARCHAR(150) NOT NULL,
    "event_version" INTEGER NOT NULL,
    "aggregate_type" VARCHAR(100) NOT NULL,
    "aggregate_id" UUID NOT NULL,
    "payload_json" JSONB NOT NULL,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMPTZ(3),
    "correlation_id" UUID,
    "causation_id" UUID,
    "status" VARCHAR(20) NOT NULL,

    CONSTRAINT "domain_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox_message" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "payload_json" JSONB NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "next_attempt_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMPTZ(3),

    CONSTRAINT "outbox_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "background_job_execution" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "job_type" VARCHAR(100) NOT NULL,
    "job_key" VARCHAR(200) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "started_at" TIMESTAMPTZ(3),
    "completed_at" TIMESTAMPTZ(3),
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "error_summary" VARCHAR(2000),
    "correlation_id" UUID,

    CONSTRAINT "background_job_execution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "document_type_code" VARCHAR(60) NOT NULL,
    "owner_domain" VARCHAR(60) NOT NULL,
    "owner_entity_type" VARCHAR(100) NOT NULL,
    "owner_entity_id" UUID NOT NULL,
    "current_version_id" UUID,
    "confidentiality_level" VARCHAR(20) NOT NULL,
    "retention_category" VARCHAR(60) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_version" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "version_number" INTEGER NOT NULL,
    "storage_key" VARCHAR(500) NOT NULL,
    "original_file_name" VARCHAR(300) NOT NULL,
    "content_type" VARCHAR(150) NOT NULL,
    "file_size_bytes" BIGINT NOT NULL,
    "sha256_hash" VARCHAR(64) NOT NULL,
    "encryption_key_reference" VARCHAR(200),
    "malware_scan_status" VARCHAR(20) NOT NULL,
    "uploaded_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploaded_by" UUID,

    CONSTRAINT "document_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_access_log" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "document_id" UUID NOT NULL,
    "document_version_id" UUID,
    "user_id" UUID,
    "action_code" VARCHAR(30) NOT NULL,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" VARCHAR(64),
    "correlation_id" UUID,

    CONSTRAINT "document_access_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "recipient_type" VARCHAR(30) NOT NULL,
    "recipient_id" UUID NOT NULL,
    "template_code" VARCHAR(100) NOT NULL,
    "channel" VARCHAR(20) NOT NULL,
    "language_code" VARCHAR(10) NOT NULL,
    "subject" VARCHAR(300),
    "body" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "scheduled_at" TIMESTAMPTZ(3),
    "sent_at" TIMESTAMPTZ(3),
    "failure_reason" VARCHAR(1000),
    "source_domain" VARCHAR(60),
    "source_entity_id" UUID,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_tenant_code_key" ON "tenant"("tenant_code");

-- CreateIndex
CREATE INDEX "idx_tenant_status" ON "tenant"("status");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_setting_tenant_id_setting_key_version_key" ON "tenant_setting"("tenant_id", "setting_key", "version");

-- CreateIndex
CREATE UNIQUE INDEX "legal_entity_tenant_id_legal_entity_code_key" ON "legal_entity"("tenant_id", "legal_entity_code");

-- CreateIndex
CREATE UNIQUE INDEX "legal_entity_tenant_id_country_code_commercial_registration_key" ON "legal_entity"("tenant_id", "country_code", "commercial_registration_number");

-- CreateIndex
CREATE UNIQUE INDEX "branch_tenant_id_branch_code_key" ON "branch"("tenant_id", "branch_code");

-- CreateIndex
CREATE UNIQUE INDEX "department_tenant_id_department_code_key" ON "department"("tenant_id", "department_code");

-- CreateIndex
CREATE INDEX "idx_audit_event_tenant_occurred" ON "audit_event"("tenant_id", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "idx_audit_event_entity" ON "audit_event"("tenant_id", "entity_type", "entity_id", "occurred_at");

-- CreateIndex
CREATE INDEX "idx_audit_event_actor" ON "audit_event"("tenant_id", "actor_user_id", "occurred_at");

-- CreateIndex
CREATE INDEX "idx_domain_event_tenant_status" ON "domain_event"("tenant_id", "status", "occurred_at");

-- CreateIndex
CREATE INDEX "idx_outbox_message_dispatch" ON "outbox_message"("tenant_id", "status", "next_attempt_at");

-- CreateIndex
CREATE INDEX "idx_background_job_tenant_type_status" ON "background_job_execution"("tenant_id", "job_type", "status");

-- CreateIndex
CREATE INDEX "idx_document_owner" ON "document"("tenant_id", "owner_domain", "owner_entity_type", "owner_entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "document_version_tenant_id_document_id_version_number_key" ON "document_version"("tenant_id", "document_id", "version_number");

-- CreateIndex
CREATE INDEX "idx_document_access_log_document" ON "document_access_log"("tenant_id", "document_id", "occurred_at");

-- CreateIndex
CREATE INDEX "idx_notification_dispatch" ON "notification"("tenant_id", "status", "scheduled_at");

-- AddForeignKey
ALTER TABLE "tenant_setting" ADD CONSTRAINT "tenant_setting_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legal_entity" ADD CONSTRAINT "legal_entity_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch" ADD CONSTRAINT "branch_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch" ADD CONSTRAINT "branch_legal_entity_id_fkey" FOREIGN KEY ("legal_entity_id") REFERENCES "legal_entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_legal_entity_id_fkey" FOREIGN KEY ("legal_entity_id") REFERENCES "legal_entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_parent_department_id_fkey" FOREIGN KEY ("parent_department_id") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_event" ADD CONSTRAINT "audit_event_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domain_event" ADD CONSTRAINT "domain_event_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outbox_message" ADD CONSTRAINT "outbox_message_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outbox_message" ADD CONSTRAINT "outbox_message_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "domain_event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "background_job_execution" ADD CONSTRAINT "background_job_execution_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_version" ADD CONSTRAINT "document_version_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_version" ADD CONSTRAINT "document_version_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_access_log" ADD CONSTRAINT "document_access_log_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_access_log" ADD CONSTRAINT "document_access_log_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_access_log" ADD CONSTRAINT "document_access_log_document_version_id_fkey" FOREIGN KEY ("document_version_id") REFERENCES "document_version"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CheckConstraint: controlled vocabularies called out explicitly in
-- docs/06-Data/18-ENTERPRISE-DATABASE-DICTIONARY.md (§6.1, §6.4) — Prisma's
-- schema DSL has no stable declarative syntax for CHECK constraints, so
-- these are hand-appended to the generated migration rather than expressed
-- in schema.prisma. Keep in sync if the schema's status/type comments change.
ALTER TABLE "tenant" ADD CONSTRAINT "tenant_tenant_type_check"
  CHECK ("tenant_type" IN ('shared', 'dedicated', 'government', 'sandbox', 'demo'));

ALTER TABLE "tenant" ADD CONSTRAINT "tenant_status_check"
  CHECK ("status" IN ('pending', 'active', 'suspended', 'archived'));

ALTER TABLE "legal_entity" ADD CONSTRAINT "legal_entity_status_check"
  CHECK ("status" IN ('pending', 'active', 'suspended', 'archived'));

ALTER TABLE "branch" ADD CONSTRAINT "branch_branch_type_check"
  CHECK ("branch_type" IN ('rental_counter', 'yard', 'workshop', 'warehouse', 'office', 'mixed'));

ALTER TABLE "branch" ADD CONSTRAINT "branch_status_check"
  CHECK ("status" IN ('pending', 'active', 'suspended', 'archived'));

ALTER TABLE "department" ADD CONSTRAINT "department_status_check"
  CHECK ("status" IN ('pending', 'active', 'suspended', 'archived'));

