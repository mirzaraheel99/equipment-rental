import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import type { AuthenticatedUser } from '../auth/auth.middleware.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { PermissionsGuard } from '../auth/permissions.guard.js';
import { RequirePermission } from '../auth/require-permission.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

import { CreateLegalEntityDto, UpdateLegalEntityDto } from './dto/legal-entity.dto.js';
import { LegalEntityService } from './legal-entity.service.js';

/**
 * `platform.legal_entity.manage` has no narrower-than-tenant scope type in
 * the ABAC model (§7) — creating/editing whole legal entities is a
 * tenant-wide, headquarters-level action by design.
 */
@ApiTags('legal-entities')
@Controller('legal-entities')
@UseGuards(PermissionsGuard)
export class LegalEntityController {
  constructor(private readonly legalEntities: LegalEntityService) {}

  @Post()
  @RequirePermission('platform.legal_entity.manage')
  create(@Body() dto: CreateLegalEntityDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.legalEntities.create(dto, actor.id);
  }

  @Get()
  @RequirePermission('platform.legal_entity.manage')
  findAll(@Query() query: PaginationQueryDto) {
    return this.legalEntities.findAll(query.page, query.pageSize);
  }

  @Get(':id')
  @RequirePermission('platform.legal_entity.manage')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.legalEntities.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('platform.legal_entity.manage')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateLegalEntityDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.legalEntities.update(id, dto, actor.id);
  }
}
