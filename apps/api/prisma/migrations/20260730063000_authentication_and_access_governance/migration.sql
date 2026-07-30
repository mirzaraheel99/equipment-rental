-- Phase 03 — Authentication and Access Governance
-- Implements docs/06-Data/18-ENTERPRISE-DATABASE-DICTIONARY.md §7.1-7.7 per
-- docs/04-Domain/03-AUTHENTICATION-AND-ACCESS-GOVERNANCE-DOMAIN-SPECIFICATION.md.
-- Generated via `prisma migrate diff --from-empty --to-schema` against the
-- full schema (no live database available in this environment — see
-- Decision Register), then hand-trimmed to only the tables this migration
-- adds, matching the same technique used for the Phase 02 migration.

-- CreateTable
CREATE TABLE "user_account" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "external_identity_id" VARCHAR(200),
    "email" VARCHAR(320) NOT NULL,
    "mobile" VARCHAR(30),
    "display_name" VARCHAR(200) NOT NULL,
    "preferred_language" VARCHAR(10) NOT NULL,
    "timezone" VARCHAR(100) NOT NULL,
    "status" VARCHAR(30) NOT NULL,
    "primary_branch_id" UUID,
    "department_id" UUID,
    "manager_user_id" UUID,
    "mfa_status" VARCHAR(20) NOT NULL DEFAULT 'not_enrolled',
    "last_login_at" TIMESTAMPTZ(3),
    "locked_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" UUID,
    "row_version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "user_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "role_code" VARCHAR(60) NOT NULL,
    "name_en" VARCHAR(200) NOT NULL,
    "name_ar" VARCHAR(200),
    "role_type" VARCHAR(20) NOT NULL,
    "is_system_role" BOOLEAN NOT NULL DEFAULT false,
    "status" VARCHAR(20) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission" (
    "id" UUID NOT NULL,
    "permission_code" VARCHAR(150) NOT NULL,
    "domain_code" VARCHAR(60) NOT NULL,
    "action_code" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "risk_level" VARCHAR(20) NOT NULL,
    "is_privileged" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "effect" VARCHAR(10) NOT NULL,
    "scope_policy_json" JSONB,
    "effective_from" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_to" TIMESTAMPTZ(3),

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_role_assignment" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "scope_type" VARCHAR(20) NOT NULL,
    "scope_id" UUID,
    "effective_from" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effective_to" TIMESTAMPTZ(3),
    "delegated_by" UUID,
    "assignment_reason" VARCHAR(500),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "user_role_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_request" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "domain_code" VARCHAR(60) NOT NULL,
    "entity_type" VARCHAR(100) NOT NULL,
    "entity_id" UUID NOT NULL,
    "approval_type" VARCHAR(60) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "requested_by" UUID NOT NULL,
    "requested_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "current_step" INTEGER NOT NULL DEFAULT 1,
    "expires_at" TIMESTAMPTZ(3),
    "context_snapshot_json" JSONB,

    CONSTRAINT "approval_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_action" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "approval_request_id" UUID NOT NULL,
    "step_number" INTEGER NOT NULL,
    "approver_user_id" UUID NOT NULL,
    "decision" VARCHAR(20) NOT NULL,
    "comments" VARCHAR(1000),
    "acted_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delegated_from_user_id" UUID,

    CONSTRAINT "approval_action_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_user_account_tenant_status" ON "user_account"("tenant_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_tenant_id_email_key" ON "user_account"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "role_tenant_id_role_code_key" ON "role"("tenant_id", "role_code");

-- CreateIndex
CREATE UNIQUE INDEX "permission_permission_code_key" ON "permission"("permission_code");

-- CreateIndex
CREATE INDEX "idx_role_permission_lookup" ON "role_permission"("tenant_id", "role_id", "permission_id");

-- CreateIndex
CREATE INDEX "idx_user_role_assignment_user" ON "user_role_assignment"("tenant_id", "user_id", "effective_from", "effective_to");

-- CreateIndex
CREATE INDEX "idx_user_role_assignment_scope" ON "user_role_assignment"("tenant_id", "scope_type", "scope_id");

-- CreateIndex
CREATE INDEX "idx_approval_request_pending_expiry" ON "approval_request"("tenant_id", "status", "expires_at");

-- CreateIndex
CREATE INDEX "idx_approval_request_entity" ON "approval_request"("tenant_id", "entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "idx_approval_action_request" ON "approval_action"("tenant_id", "approval_request_id", "step_number");

-- AddForeignKey
ALTER TABLE "user_account" ADD CONSTRAINT "user_account_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_account" ADD CONSTRAINT "user_account_primary_branch_id_fkey" FOREIGN KEY ("primary_branch_id") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_account" ADD CONSTRAINT "user_account_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_account" ADD CONSTRAINT "user_account_manager_user_id_fkey" FOREIGN KEY ("manager_user_id") REFERENCES "user_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role" ADD CONSTRAINT "role_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role_assignment" ADD CONSTRAINT "user_role_assignment_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role_assignment" ADD CONSTRAINT "user_role_assignment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role_assignment" ADD CONSTRAINT "user_role_assignment_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_role_assignment" ADD CONSTRAINT "user_role_assignment_delegated_by_fkey" FOREIGN KEY ("delegated_by") REFERENCES "user_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_request" ADD CONSTRAINT "approval_request_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_request" ADD CONSTRAINT "approval_request_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_action" ADD CONSTRAINT "approval_action_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_action" ADD CONSTRAINT "approval_action_approval_request_id_fkey" FOREIGN KEY ("approval_request_id") REFERENCES "approval_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_action" ADD CONSTRAINT "approval_action_approver_user_id_fkey" FOREIGN KEY ("approver_user_id") REFERENCES "user_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_action" ADD CONSTRAINT "approval_action_delegated_from_user_id_fkey" FOREIGN KEY ("delegated_from_user_id") REFERENCES "user_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Hand-appended CHECK constraints — Prisma's schema DSL has no stable CHECK
-- syntax as of Prisma 7 (see Decision Register #25, applied here the same way).
ALTER TABLE "user_account" ADD CONSTRAINT "user_account_status_check"
  CHECK ("status" IN ('pending', 'active', 'suspended', 'deprovisioned'));
ALTER TABLE "user_account" ADD CONSTRAINT "user_account_mfa_status_check"
  CHECK ("mfa_status" IN ('not_enrolled', 'enrolled', 'required'));
ALTER TABLE "role" ADD CONSTRAINT "role_role_type_check"
  CHECK ("role_type" IN ('system', 'custom'));
ALTER TABLE "role" ADD CONSTRAINT "role_status_check"
  CHECK ("status" IN ('active', 'inactive'));
ALTER TABLE "permission" ADD CONSTRAINT "permission_risk_level_check"
  CHECK ("risk_level" IN ('low', 'medium', 'high', 'critical'));
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_effect_check"
  CHECK ("effect" IN ('allow', 'deny'));
ALTER TABLE "user_role_assignment" ADD CONSTRAINT "user_role_assignment_scope_type_check"
  CHECK ("scope_type" IN ('tenant', 'legal_entity', 'branch', 'department'));
ALTER TABLE "approval_request" ADD CONSTRAINT "approval_request_status_check"
  CHECK ("status" IN ('pending', 'approved', 'rejected', 'expired', 'cancelled'));
ALTER TABLE "approval_action" ADD CONSTRAINT "approval_action_decision_check"
  CHECK ("decision" IN ('approved', 'rejected', 'delegated'));

-- Case-insensitive email uniqueness per tenant (dictionary §7.1's
-- `(tenant_id, lower(email))` requirement) — Prisma's schema DSL cannot
-- express a functional unique index, so the plain-column unique index
-- generated above is replaced with the case-insensitive equivalent.
DROP INDEX "user_account_tenant_id_email_key";
CREATE UNIQUE INDEX "user_account_tenant_id_lower_email_key" ON "user_account"("tenant_id", (lower("email")));
