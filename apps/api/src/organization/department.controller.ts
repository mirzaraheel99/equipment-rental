import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

import type { AuthenticatedUser } from '../auth/auth.middleware.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { PermissionsGuard } from '../auth/permissions.guard.js';
import { RequirePermission, ResourceScopeFrom } from '../auth/require-permission.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

import { DepartmentService } from './department.service.js';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto.js';

class DepartmentListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  legalEntityId?: string;
}

@ApiTags('departments')
@Controller('departments')
@UseGuards(PermissionsGuard)
export class DepartmentController {
  constructor(private readonly departments: DepartmentService) {}

  @Post()
  @RequirePermission('platform.department.manage')
  @ResourceScopeFrom((req) => ({ scopeType: 'legal_entity', scopeId: String(req.body.legalEntityId) }))
  create(@Body() dto: CreateDepartmentDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.departments.create(dto, actor.id);
  }

  @Get()
  @RequirePermission('platform.department.manage')
  findAll(@Query() query: DepartmentListQueryDto) {
    return this.departments.findAll(query.page, query.pageSize, query.legalEntityId);
  }

  @Get(':id')
  @RequirePermission('platform.department.manage')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.departments.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('platform.department.manage')
  @ResourceScopeFrom((req) => ({ scopeType: 'department', scopeId: String(req.params.id) }))
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDepartmentDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.departments.update(id, dto, actor.id);
  }
}
