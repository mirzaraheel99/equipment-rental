import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

import type { AuthenticatedUser } from '../auth/auth.middleware.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { PermissionsGuard } from '../auth/permissions.guard.js';
import { RequirePermission, ResourceScopeFrom } from '../auth/require-permission.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

import { AssetService } from './asset.service.js';
import { TransferAssetLocationDto } from './dto/asset-location.dto.js';
import { TransitionAssetStatusDto } from './dto/asset-status-transition.dto.js';
import { CreateAssetDto, UpdateAssetDto } from './dto/asset.dto.js';

class AssetListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @IsOptional()
  @IsString()
  statusCode?: string;
}

/**
 * `asset.status.transition` and `asset.location.transfer` are only checked
 * for the permission itself here — narrowing by branch/legal-entity scope
 * would need the guard to resolve `owningBranchId` from the existing asset
 * row, which `ResourceScopeFrom`'s synchronous resolver can't do (it only
 * reads the request, not the database). Tracked as an Open Questions
 * Register follow-up rather than silently assumed correct. Creation *can*
 * be scope-checked, since `owningBranchId` is right there in the body.
 */
@ApiTags('assets')
@Controller('assets')
@UseGuards(PermissionsGuard)
export class AssetController {
  constructor(private readonly assets: AssetService) {}

  @Post()
  @RequirePermission('asset.create')
  @ResourceScopeFrom((req) => ({ scopeType: 'branch', scopeId: String(req.body.owningBranchId) }))
  create(@Body() dto: CreateAssetDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.assets.create(dto, actor.id);
  }

  @Get()
  @RequirePermission('asset.view')
  findAll(@Query() query: AssetListQueryDto) {
    return this.assets.findAll(query.page, query.pageSize, { branchId: query.branchId, statusCode: query.statusCode });
  }

  @Get(':id')
  @RequirePermission('asset.view')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.assets.findOne(id);
  }

  /** Asset 360° view (domain doc §14). */
  @Get(':id/360')
  @RequirePermission('asset.view')
  findOne360(@Param('id', ParseUUIDPipe) id: string) {
    return this.assets.findOneWithHistory(id);
  }

  @Patch(':id')
  @RequirePermission('asset.edit')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAssetDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.assets.update(id, dto, actor.id);
  }

  @Post(':id/status-transitions')
  @RequirePermission('asset.status.transition')
  transitionStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransitionAssetStatusDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.assets.transitionStatus(id, dto, actor.id);
  }

  @Post(':id/location-transfers')
  @RequirePermission('asset.location.transfer')
  transferLocation(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: TransferAssetLocationDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.assets.transferLocation(id, dto, actor.id);
  }
}
