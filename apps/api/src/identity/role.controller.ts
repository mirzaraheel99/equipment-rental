import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import type { AuthenticatedUser } from '../auth/auth.middleware.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { PermissionsGuard } from '../auth/permissions.guard.js';
import { RequirePermission } from '../auth/require-permission.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

import { CreateRoleDto, GrantRolePermissionDto, UpdateRoleDto } from './dto/role.dto.js';
import { RoleService } from './role.service.js';

@ApiTags('roles')
@Controller('roles')
@UseGuards(PermissionsGuard)
export class RoleController {
  constructor(private readonly roles: RoleService) {}

  @Post()
  @RequirePermission('identity.role.manage')
  create(@Body() dto: CreateRoleDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.roles.create(dto, actor.id);
  }

  @Get()
  @RequirePermission('identity.role.manage')
  findAll(@Query() query: PaginationQueryDto) {
    return this.roles.findAll(query.page, query.pageSize);
  }

  @Get(':id')
  @RequirePermission('identity.role.manage')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.roles.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('identity.role.manage')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRoleDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.roles.update(id, dto, actor.id);
  }

  @Post(':id/permissions')
  @RequirePermission('identity.role.manage')
  grantPermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: GrantRolePermissionDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.roles.grantPermission(id, dto, actor.id);
  }

  @Delete(':id/permissions/:rolePermissionId')
  @RequirePermission('identity.role.manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokePermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('rolePermissionId', ParseUUIDPipe) rolePermissionId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<void> {
    await this.roles.revokePermission(id, rolePermissionId, actor.id);
  }
}
