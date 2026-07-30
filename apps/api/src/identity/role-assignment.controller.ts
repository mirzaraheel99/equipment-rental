import { Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import type { AuthenticatedUser } from '../auth/auth.middleware.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { PermissionsGuard } from '../auth/permissions.guard.js';
import { RequirePermission } from '../auth/require-permission.decorator.js';

import { AssignRoleDto } from './dto/role-assignment.dto.js';
import { RoleAssignmentService } from './role-assignment.service.js';

@ApiTags('role-assignments')
@Controller('role-assignments')
@UseGuards(PermissionsGuard)
export class RoleAssignmentController {
  constructor(private readonly assignments: RoleAssignmentService) {}

  @Post()
  @RequirePermission('identity.role_assignment.manage')
  assign(@Body() dto: AssignRoleDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.assignments.assign(dto, actor.id);
  }

  @Get('user/:userId')
  @RequirePermission('identity.role_assignment.manage')
  findAllForUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.assignments.findAllForUser(userId);
  }

  @Delete(':id')
  @RequirePermission('identity.role_assignment.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revoke(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: AuthenticatedUser): Promise<void> {
    await this.assignments.revoke(id, actor.id);
  }
}
