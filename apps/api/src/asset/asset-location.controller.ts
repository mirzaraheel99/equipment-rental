import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PermissionsGuard } from '../auth/permissions.guard.js';
import { RequirePermission } from '../auth/require-permission.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

import { AssetLocationService } from './asset-location.service.js';
import { CreateAssetLocationDto } from './dto/asset-location.dto.js';

@ApiTags('asset-locations')
@Controller('asset-locations')
@UseGuards(PermissionsGuard)
export class AssetLocationController {
  constructor(private readonly locations: AssetLocationService) {}

  @Post()
  @RequirePermission('asset.master_data.manage')
  create(@Body() dto: CreateAssetLocationDto) {
    return this.locations.create(dto);
  }

  @Get()
  @RequirePermission('asset.view')
  findAll(@Query() query: PaginationQueryDto) {
    return this.locations.findAll(query.page, query.pageSize);
  }

  @Get(':id')
  @RequirePermission('asset.view')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.locations.findOne(id);
  }
}
