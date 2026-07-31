import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import type { AuthenticatedUser } from '../auth/auth.middleware.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { PermissionsGuard } from '../auth/permissions.guard.js';
import { RequirePermission } from '../auth/require-permission.decorator.js';

import { AssetMeterService } from './asset-meter.service.js';
import { CreateAssetMeterDto, RecordAssetMeterReadingDto } from './dto/asset-meter.dto.js';

@ApiTags('asset-meters')
@Controller()
@UseGuards(PermissionsGuard)
export class AssetMeterController {
  constructor(private readonly meters: AssetMeterService) {}

  @Post('assets/:assetId/meters')
  @RequirePermission('asset.meter.enter')
  create(@Param('assetId', ParseUUIDPipe) assetId: string, @Body() dto: CreateAssetMeterDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.meters.create(assetId, dto, actor.id);
  }

  @Get('assets/:assetId/meters')
  @RequirePermission('asset.view')
  findAllForAsset(@Param('assetId', ParseUUIDPipe) assetId: string) {
    return this.meters.findAllForAsset(assetId);
  }

  @Post('asset-meters/:meterId/readings')
  @RequirePermission('asset.meter.enter')
  recordReading(
    @Param('meterId', ParseUUIDPipe) meterId: string,
    @Body() dto: RecordAssetMeterReadingDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.meters.recordReading(meterId, dto, actor.id);
  }
}
