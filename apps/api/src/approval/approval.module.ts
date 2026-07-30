import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module.js';
import { EventsModule } from '../events/events.module.js';

import { ApprovalController } from './approval.controller.js';
import { ApprovalService } from './approval.service.js';

@Module({
  imports: [AuditModule, EventsModule],
  controllers: [ApprovalController],
  providers: [ApprovalService],
  exports: [ApprovalService],
})
export class ApprovalModule {}
