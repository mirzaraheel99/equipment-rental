import { Module } from '@nestjs/common';

import { AuditModule } from '../audit/audit.module.js';
import { EventsModule } from '../events/events.module.js';

import { PermissionController } from './permission.controller.js';
import { RoleAssignmentController } from './role-assignment.controller.js';
import { RoleAssignmentService } from './role-assignment.service.js';
import { RoleController } from './role.controller.js';
import { RoleService } from './role.service.js';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';

@Module({
  imports: [AuditModule, EventsModule],
  controllers: [UserController, RoleController, RoleAssignmentController, PermissionController],
  providers: [UserService, RoleService, RoleAssignmentService],
})
export class IdentityModule {}
