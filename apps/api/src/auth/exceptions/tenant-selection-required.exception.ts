import { HttpException, HttpStatus } from '@nestjs/common';

import type { CandidateTenant } from '../user-provisioning.service.js';

/**
 * The verified identity is an active user of more than one tenant and no
 * `tenantId` hint was supplied — the client must resubmit with one of the
 * listed candidates rather than the API guessing (§13).
 */
export class TenantSelectionRequiredException extends HttpException {
  constructor(candidates: CandidateTenant[]) {
    super({ error: 'tenant_selection_required', candidates }, HttpStatus.CONFLICT);
  }
}
