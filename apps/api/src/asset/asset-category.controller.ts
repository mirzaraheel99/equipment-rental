import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import type { AuthenticatedUser } from '../auth/auth.middleware.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { PermissionsGuard } from '../auth/permissions.guard.js';
import { RequirePermission } from '../auth/require-permission.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

import { AssetCategoryService } from './asset-category.service.js';
import { CreateAssetCategoryDto, UpdateAssetCategoryDto } from './dto/asset-category.dto.js';

@ApiTags('asset-categories')
@Controller('asset-categories')
@UseGuards(PermissionsGuard)
export class AssetCategoryController {
  constructor(private readonly categories: AssetCategoryService) {}

  @Post()
  @RequirePermission('asset.master_data.manage')
  create(@Body() dto: CreateAssetCategoryDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.categories.create(dto, actor.id);
  }

  @Get()
  @RequirePermission('asset.view')
  findAll(@Query() query: PaginationQueryDto) {
    return this.categories.findAll(query.page, query.pageSize);
  }

  @Get(':id')
  @RequirePermission('asset.view')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categories.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('asset.master_data.manage')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAssetCategoryDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.categories.update(id, dto, actor.id);
  }
}
