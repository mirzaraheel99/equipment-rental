import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module.js';
import { EventsModule } from '../events/events.module.js';

import { BranchController } from './branch.controller.js';
import { BranchService } from './branch.service.js';
import { DepartmentController } from './department.controller.js';
import { DepartmentService } from './department.service.js';
import { LegalEntityController } from './legal-entity.controller.js';
import { LegalEntityService } from './legal-entity.service.js';

@Module({
  imports: [AuditModule, EventsModule],
  controllers: [LegalEntityController, BranchController, DepartmentController],
  providers: [LegalEntityService, BranchService, DepartmentService],
  exports: [LegalEntityService, BranchService, DepartmentService],
})
export class OrganizationModule {}
