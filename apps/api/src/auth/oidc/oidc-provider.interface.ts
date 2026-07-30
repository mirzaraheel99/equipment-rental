/**
 * Claims ERMS actually needs from a verified OIDC ID token. Both providers
 * (Entra ID and the local dev stub) normalize to this shape so the rest of
 * the auth flow never branches on which issuer was used — see
 * docs/04-Domain/03-AUTHENTICATION-AND-ACCESS-GOVERNANCE-DOMAIN-SPECIFICATION.md §5.1.
 */
export interface OidcClaims {
  /** Stable subject identifier from the issuer — stored as user_account.external_identity_id. */
  subject: string;
  email: string;
  displayName: string;
  /** Authentication Methods References (RFC 8176) — checked for 'mfa' by the
   * MFA policy hook (§5.2 step 6). Empty when the issuer doesn't assert it. */
  amr: string[];
  /** Optional tenant hint carried by the issuer (e.g. an Entra ID tenant
   * claim mapped to an ERMS tenant); undefined for the local dev provider,
   * which relies on the caller-supplied tenant hint instead. */
  tenantHint: string | undefined;
}

export interface OidcProvider {
  verifyIdToken(idToken: string): Promise<OidcClaims>;
}
