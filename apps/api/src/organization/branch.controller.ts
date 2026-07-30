import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

import type { AuthenticatedUser } from '../auth/auth.middleware.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { PermissionsGuard } from '../auth/permissions.guard.js';
import { RequirePermission, ResourceScopeFrom } from '../auth/require-permission.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

import { BranchService } from './branch.service.js';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto.js';

class BranchListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  legalEntityId?: string;
}

@ApiTags('branches')
@Controller('branches')
@UseGuards(PermissionsGuard)
export class BranchController {
  constructor(private readonly branches: BranchService) {}

  @Post()
  @RequirePermission('platform.branch.manage')
  @ResourceScopeFrom((req) => ({ scopeType: 'legal_entity', scopeId: String(req.body.legalEntityId) }))
  create(@Body() dto: CreateBranchDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.branches.create(dto, actor.id);
  }

  @Get()
  @RequirePermission('platform.branch.manage')
  findAll(@Query() query: BranchListQueryDto) {
    return this.branches.findAll(query.page, query.pageSize, query.legalEntityId);
  }

  @Get(':id')
  @RequirePermission('platform.branch.manage')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.branches.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('platform.branch.manage')
  @ResourceScopeFrom((req) => ({ scopeType: 'branch', scopeId: String(req.params.id) }))
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBranchDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.branches.update(id, dto, actor.id);
  }
}
