import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

import type { AuthenticatedUser } from '../auth/auth.middleware.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { PermissionsGuard } from '../auth/permissions.guard.js';
import { RequirePermission } from '../auth/require-permission.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

import { CreateEquipmentModelDto, UpdateEquipmentModelDto } from './dto/equipment-model.dto.js';
import { EquipmentModelService } from './equipment-model.service.js';

class EquipmentModelListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  manufacturerId?: string;
}

@ApiTags('equipment-models')
@Controller('equipment-models')
@UseGuards(PermissionsGuard)
export class EquipmentModelController {
  constructor(private readonly models: EquipmentModelService) {}

  @Post()
  @RequirePermission('asset.master_data.manage')
  create(@Body() dto: CreateEquipmentModelDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.models.create(dto, actor.id);
  }

  @Get()
  @RequirePermission('asset.view')
  findAll(@Query() query: EquipmentModelListQueryDto) {
    return this.models.findAll(query.page, query.pageSize, query.manufacturerId);
  }

  @Get(':id')
  @RequirePermission('asset.view')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.models.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('asset.master_data.manage')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateEquipmentModelDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.models.update(id, dto, actor.id);
  }
}
