import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import type { AuthenticatedUser } from '../auth/auth.middleware.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { PermissionsGuard } from '../auth/permissions.guard.js';
import { RequirePermission } from '../auth/require-permission.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

import { CreateManufacturerDto, UpdateManufacturerDto } from './dto/manufacturer.dto.js';
import { ManufacturerService } from './manufacturer.service.js';

@ApiTags('manufacturers')
@Controller('manufacturers')
@UseGuards(PermissionsGuard)
export class ManufacturerController {
  constructor(private readonly manufacturers: ManufacturerService) {}

  @Post()
  @RequirePermission('asset.master_data.manage')
  create(@Body() dto: CreateManufacturerDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.manufacturers.create(dto, actor.id);
  }

  @Get()
  @RequirePermission('asset.view')
  findAll(@Query() query: PaginationQueryDto) {
    return this.manufacturers.findAll(query.page, query.pageSize);
  }

  @Get(':id')
  @RequirePermission('asset.view')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.manufacturers.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('asset.master_data.manage')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateManufacturerDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.manufacturers.update(id, dto, actor.id);
  }
}
