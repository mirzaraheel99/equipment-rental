import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * `user_account.mfa_status = 'required'` but the verified ID token's `amr`
 * claim did not assert an MFA factor was used — ERMS does not perform MFA
 * verification itself (§4.2, §12); the client must re-trigger the identity
 * provider's MFA step and retry the session exchange.
 */
export class MfaRequiredException extends HttpException {
  constructor() {
    super({ error: 'mfa_required' }, HttpStatus.UNAUTHORIZED);
  }
}
