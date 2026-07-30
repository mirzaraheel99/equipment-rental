# 03 — Authentication and Access Governance Domain Specification

**Document ID:** ERMS-DOM-007
**Version:** 0.1
**Status:** Working Draft, Lite Pass — see §12 for explicit deferrals
**Primary Market:** Saudi Arabia
**Domain Owner:** Identity & Security
**Depends On:** Platform Core (Tenant, Branch, Legal Entity, Department, Audit, Domain Events — `docs/09-Implementation/24-CODEX-IMPLEMENTATION-ROADMAP.md` Phase 02)
**Feeds:** every later domain — no protected business endpoint may operate without the identity, authorization, and audit context this domain establishes (roadmap Phase 03 Definition of Done)

---

## 1. Purpose

This document defines the Authentication, RBAC/ABAC Authorization, and Approval Governance domain for ERMS — the identity and access-control foundation the roadmap's Phase 03 requires before any operational (business) module is built. It is seeded from `docs/09-Implementation/24-CODEX-IMPLEMENTATION-ROADMAP.md` §8 and reconciled against the identity tables already specified in `docs/06-Data/18-ENTERPRISE-DATABASE-DICTIONARY.md` §7.1–§7.7 (this document does not redefine those tables — see §3).

---

## 2. Core Domain Principle

Deny by default. A request is authorized only when an active, non-expired session identifies a user, that user holds a role granting the specific permission the endpoint requires, and no applicable scope or deny rule excludes the specific resource being acted on. Authorization is evaluated fresh on every request from the database — it is never trusted from a cached claim inside a token, so a revoked role or permission takes effect on the very next request, not at the token's next expiry.

---

## 3. Relationship to the Database Dictionary

`docs/06-Data/18-ENTERPRISE-DATABASE-DICTIONARY.md` §7.1–§7.7 already specifies `user_account`, `role`, `permission`, `role_permission`, `user_role_assignment`, `approval_request`, and `approval_action` at column level. This document does not duplicate those column lists — it defines the **behavior** built on top of them: how a session is established, how effective permissions are computed, how scope is enforced, and how approvals flow. Where this document needs a field the dictionary does not list, that gap is surfaced in §12/§13 rather than silently added to the schema.

**Notable gap surfaced, not silently resolved:** `user_account` has no `password_hash` column (§7.1's key-column list has none), and no dedicated session/credential table exists elsewhere in the dictionary. Combined with `external_identity_id` being a first-class column, the dictionary's implicit design is **federated identity only** — ERMS never stores or verifies a password itself; an external OIDC-compliant issuer does, and ERMS trusts its signed ID tokens. See §5 for how this still yields a workable local-development flow without inventing a password column.

---

## 4. Scope

### 4.1 In Scope (this pass)

- OIDC ID-token verification and session exchange (`OidcProvider` interface)
- A local development identity provider — a stub OIDC issuer for seeded dev users, so the whole flow is testable without real Microsoft Entra ID tenant credentials
- Just-in-time user provisioning from verified OIDC claims
- Short-lived access tokens (identity only, no embedded permissions) + Redis-backed, rotating, revocable refresh tokens
- Role, Permission, Role-Permission, User-Role-Assignment CRUD and enforcement
- RBAC combining algorithm (deny overrides allow)
- ABAC scope enforcement: tenant, legal entity, branch, department scope types on `user_role_assignment.scope_type`/`scope_id`
- Generic multi-step Approval Request/Action engine, including delegation and expiry
- Privileged-action reauthentication ("step-up") for permissions flagged `is_privileged`
- Permission-change and auth-event audit logging (reusing Phase 02's `AuditService`)
- Permission Registry for every permission code introduced by this phase (§11)

### 4.2 Out of Scope (explicitly deferred — tracked in §12)

- Real Microsoft Entra ID tenant wiring (client ID/secret, redirect URIs) — the `EntraIdProvider` is written as real, functional OIDC/JWKS verification code, but cannot be exercised end-to-end without a real Azure AD tenant, which this environment does not have
- MFA factor enrollment and verification (TOTP/SMS/authenticator push) — only the policy **hook** is implemented (an OIDC `amr` claim check against `user_account.mfa_status`); no factor-management UI or verification service
- Customer Portal's own authentication surface — tracked as a Customer Portal Domain gap in `docs/00-Foundation/MASTER-INDEX.md`; this pass only reserves a distinct token `audience` claim (`erms-portal` vs `erms-internal`) so the two surfaces cannot cross-authenticate once the portal exists
- Any frontend login screen — Phase 04 (Design System and Application Shell) builds the app shell that would host it; this phase is API-only, matching how Phase 02 shipped with no frontend changes either
- SCIM or bulk user provisioning from Entra ID — deferred until a real tenant exists to provision from

---

## 5. Authentication Flow

### 5.1 Why OIDC exchange, not username/password

Per §3, `user_account` carries no password field. Rather than inventing one (which would contradict the dictionary and create a second, undocumented credential store), authentication is modeled as OIDC ID-token verification end to end, with two interchangeable issuers behind a single `OidcProvider` interface:

- **`EntraIdProvider`** (production) — verifies ID tokens against Microsoft Entra ID's published JWKS for the tenant's configured issuer URL.
- **`LocalDevProvider`** (`APP_ENV=local` only) — a minimal stub OIDC issuer seeded with fixed development users (from `.env`-driven seed data), signing its own ID tokens with a local-only key. It exists purely so the full session-exchange path is exercisable in this repository's development and CI environments without real Entra credentials.

### 5.2 Session exchange

1. Client obtains a signed ID token from whichever `OidcProvider` is configured (redirect flow for Entra ID; a simple "pick a seeded user" endpoint for the local dev provider).
2. Client calls `POST /api/v1/auth/session` with that ID token.
3. The API verifies the token's signature, issuer, audience, and expiry via the active `OidcProvider`.
4. `UserProvisioningService` resolves the matching `user_account` by `(tenant_id, external_identity_id)`, or by `(tenant_id, lower(email))` on first login, just-in-time provisioning the row if it does not yet exist. This pass provisions unconditionally rather than gating on a per-tenant setting — no `TenantSetting` key for "allow self-provisioning" exists yet; adding one is a natural follow-up once a real tenant needs it disabled, tracked as an assumption in §13.
5. If the resolved user's `status` is not active, or `locked_at` is set, the exchange is rejected.
6. If `mfa_status = 'required'` and the ID token's `amr` claim does not assert an MFA factor was used, the exchange is rejected with a distinct error code the client uses to re-trigger the IdP's MFA step (§4.2 — ERMS itself does not perform MFA verification).
7. On success, the API issues an ERMS access token and refresh token (§5.3) and records a `UserLoggedIn` domain event plus an audit entry.

### 5.3 Token model

- **Access token** — short-lived (15 minutes) signed JWT, payload limited to `{sub: userId, tenantId, audience}`. It carries **no roles or permissions** — those are always resolved fresh from the database per request (§2), so a revoked role is enforced immediately rather than at token expiry.
- **Refresh token** — an opaque random value, stored server-side in Redis (`refresh:{tokenId}` → `{userId, tenantId, expiresAt}`), never a JWT. Presenting a valid refresh token rotates it (the old value is deleted, a new one issued) and mints a new access token. Logout deletes the refresh token's Redis entry, immediately revoking it.
- **Tenant scope derivation** — the tenant context (`AsyncLocalStorage`, `apps/api/src/tenant/tenant-context.ts`) is now bound from the verified access token's `tenantId` claim on every authenticated request, not from a client-supplied header. This supersedes Decision Register #24's interim `x-tenant-id` mechanism (see updated Decision Register entry).

### 5.4 Privileged-action reauthentication

Permissions flagged `permission.is_privileged = true` additionally require a recent "step-up" grant: `POST /api/v1/auth/reauthenticate` re-verifies a fresh ID token and stores a short-lived (5-minute) grant in Redis (`stepup:{userId}`). A guard checks this grant exists before allowing a privileged-permission action; without it, the request is rejected with a distinct "reauthentication required" error rather than a generic 403.

---

## 6. RBAC Model

- A **Role** (`role`) is a named, tenant-scoped bundle of permissions. `is_system_role` roles are seeded and cannot be edited or deleted through the API, only assigned.
- A **Permission** (`permission`) is a fixed, tenant-independent registry entry, `domain.resource.action` coded (dictionary §7.3), each flagged with a `risk_level` and `is_privileged` bit. Permissions are seeded at deploy time (§11), never created through the API — matching the roadmap's "never create a new ... permission ... without updating its registry" rule; the registry **is** this document's §11 plus the seed script, kept in lockstep.
- **`role_permission`** links a role to a permission with an `effect` of `allow` or `deny`, optionally scoped further by `scope_policy_json`.
- **`user_role_assignment`** grants a role to a user, optionally scoped to a `scope_type` (`tenant` | `legal_entity` | `branch` | `department`) and `scope_id`, with an effective date range and optional `delegated_by`.
- **Combining algorithm** — for a given user, target permission code, and target resource's scope: collect every `allow` grant whose role assignment's scope covers the resource (or is tenant-wide) and effective window includes now; collect every `deny` grant the same way. **Deny always wins.** No allow grant makes the request authorized if any applicable deny grant also matches.

## 7. ABAC / Scope Model

Scope enforcement answers "does this role assignment's scope cover the resource being acted on," not just "does the user hold the permission at all":

- `scope_type = 'tenant'` — covers every resource in the tenant.
- `scope_type = 'legal_entity'` — covers only resources under that `legal_entity_id` (directly, or via a `branch`/`department` that belongs to it).
- `scope_type = 'branch'` — covers only resources tied to that `branch_id`.
- `scope_type = 'department'` — covers only resources tied to that `department_id`.

A guard resolves the target resource's own scope (e.g., a `Branch` update targets `scope_type='branch', scope_id=<that branch id>`, but also matches a `legal_entity`-scoped or `tenant`-scoped grant covering it) before checking allow/deny.

---

## 8. Approval Workflow

A generic, reusable engine — not wired to a specific business workflow yet (no domain that requires approvals, e.g. contract amendments, exists as of this phase), but built now per the roadmap's explicit Phase 03 scope so later domains only need to call it.

- `ApprovalService.request(...)` creates an `approval_request` row (`status='pending', current_step=1`), with an optional multi-step definition.
- `ApprovalService.act(...)` records an `approval_action` for the current step. An `approved` decision on the final step marks the request `approved`; on an intermediate step it advances `current_step`. A `rejected` decision at any step marks the whole request `rejected`.
- `ApprovalService.delegate(...)` lets an approver reassign their pending step to another user, recording `delegated_from_user_id` on the resulting action and `delegated_by` context for audit.
- Expiry — `approval_request.expires_at`, checked by a worker job (`apps/worker`) that marks overdue pending requests `expired`.

---

## 9. RBAC Requirements for This Domain's Own Endpoints

- `identity.user.manage` — create/update `user_account` rows (JIT provisioning aside)
- `identity.role.manage` — create/update `role`, assign/revoke `role_permission`
- `identity.role_assignment.manage` — assign/revoke `user_role_assignment` (itself `is_privileged` — granting access requires step-up, directly addressing the roadmap's "permission escalation attempt" required test)
- `identity.approval.act` — record an `approval_action`
- `identity.audit.view` — read audit history (no domain yet exposes an audit read API; reserved)

---

## 10. Audit Requirements

The system shall audit: login success/failure, logout, token refresh (only anomalies — e.g. reuse of a rotated/revoked refresh token — not every routine refresh, to avoid flooding `audit_event`), role creation/edit, role-permission grant/revoke, user-role-assignment grant/revoke/delegation, approval request/decision/delegation/expiry, and reauthentication (step-up) success/failure. All identity/RBAC mutations go through the existing Phase 02 `AuditService` — no second audit writer is introduced.

---

## 11. Permission Registry (this phase)

| Permission Code | Domain | Risk Level | Privileged | Notes |
|---|---|---|---|---|
| `platform.legal_entity.manage` | platform | medium | no | create/update Legal Entity (supersedes Phase 02's unguarded endpoint) |
| `platform.branch.manage` | platform | medium | no | create/update Branch |
| `platform.department.manage` | platform | medium | no | create/update Department |
| `identity.user.manage` | identity | high | no | create/update `user_account` |
| `identity.role.manage` | identity | high | no | create/update `role`, manage `role_permission` |
| `identity.role_assignment.manage` | identity | critical | **yes** | grant/revoke `user_role_assignment` — privilege escalation surface |
| `identity.approval.act` | identity | medium | no | approve/reject/delegate an `approval_request` |
| `identity.audit.view` | identity | medium | no | reserved; no read API yet |

Every new permission introduced by a later phase must be added to this table (or a successor Permission Registry document if this one is later split out) in the same change that adds it to the seed script — per the roadmap's "never create a new ... permission ... without updating its registry" rule.

---

## 12. Deferred Items and Open Questions

- **Real Entra ID tenant wiring** — needs a real Azure AD tenant ID, app registration client ID, and redirect URI from the business before `EntraIdProvider` can be exercised end-to-end. Tracked as Blocking-for-Production (not Blocking-for-MVP, since local dev auth unblocks continued build work) in `docs/00-Foundation/OPEN-QUESTIONS-REGISTER.md`.
- **MFA factor verification** — only the policy hook (§5.2 step 6) exists; actual TOTP/SMS enrollment and verification is a distinct, not-yet-scoped body of work.
- **Customer Portal authentication surface** — the `erms-portal` audience claim is reserved but no portal-specific login flow, scope model, or rate limiting exists yet; belongs to the Customer Portal Domain (currently a Master Index gap).
- **`approval_request.context_snapshot_json` consumers** — this phase builds the engine generically; no business domain calls it yet, so its exact snapshot shape per use case is unverified until a real caller (e.g. Contract Amendment approval) exists.

---

## 13. Assumptions Made This Pass

- Login's tenant disambiguation (a user's email may exist in more than one tenant) is resolved by having `POST /api/v1/auth/session` accept an optional `tenantId` hint; if omitted and more than one active tenant matches the verified identity, the API returns a distinct "tenant selection required" response listing the candidate tenants rather than guessing one. No screen for this exists yet in `docs/08-UX/20-SCREEN-INVENTORY-AND-NAVIGATION-REGISTRY.md`; flagged there as an open item for Phase 04.
- `mfa_status` is treated as a small controlled vocabulary (`not_enrolled | enrolled | required`) since the dictionary states the column exists but not its values.
- JIT provisioning (§5.2 step 4) is unconditional in this pass — no per-tenant "allow self-provisioning" setting exists to gate it against.
- `ApprovalRequest`/`ApprovalAction` have no `total_steps` column in the dictionary; the generic engine (§8) instead has each `act()` call state `isFinalStep` explicitly, since which step is final is a business-domain decision no consuming workflow has defined yet.
