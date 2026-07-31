import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import type { AuthenticatedUser } from '../auth/auth.middleware.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { PermissionsGuard } from '../auth/permissions.guard.js';
import { RequirePermission } from '../auth/require-permission.decorator.js';

import { AssetDocumentService } from './asset-document.service.js';
import { LinkAssetDocumentDto, VerifyAssetDocumentDto } from './dto/asset-document.dto.js';

@ApiTags('asset-documents')
@Controller()
@UseGuards(PermissionsGuard)
export class AssetDocumentController {
  constructor(private readonly documents: AssetDocumentService) {}

  @Post('assets/:assetId/documents')
  @RequirePermission('asset.document.upload')
  link(@Param('assetId', ParseUUIDPipe) assetId: string, @Body() dto: LinkAssetDocumentDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.documents.link(assetId, dto, actor.id);
  }

  @Get('assets/:assetId/documents')
  @RequirePermission('asset.view')
  findAllForAsset(@Param('assetId', ParseUUIDPipe) assetId: string) {
    return this.documents.findAllForAsset(assetId);
  }

  @Get('assets/:assetId/documents/valid-certificates')
  @RequirePermission('asset.view')
  findValidCertificates(@Param('assetId', ParseUUIDPipe) assetId: string) {
    return this.documents.findValidCertificates(assetId);
  }

  @Post('asset-documents/:assetDocumentId/verify')
  @RequirePermission('asset.document.verify')
  verify(
    @Param('assetDocumentId', ParseUUIDPipe) assetDocumentId: string,
    @Body() dto: VerifyAssetDocumentDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.documents.verify(assetDocumentId, dto, actor.id);
  }
}
