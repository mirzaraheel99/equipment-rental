import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import type { AuthenticatedUser } from '../auth/auth.middleware.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { PermissionsGuard } from '../auth/permissions.guard.js';
import { RequirePermission } from '../auth/require-permission.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

import { ApprovalService } from './approval.service.js';
import { ActOnApprovalDto, CreateApprovalRequestDto, DelegateApprovalDto } from './dto/approval.dto.js';

@ApiTags('approvals')
@Controller('approvals')
@UseGuards(PermissionsGuard)
export class ApprovalController {
  constructor(private readonly approvals: ApprovalService) {}

  @Post()
  @RequirePermission('identity.approval.act')
  request(@Body() dto: CreateApprovalRequestDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.approvals.request(dto, actor.id);
  }

  @Get()
  @RequirePermission('identity.approval.act')
  findAll(@Query() query: PaginationQueryDto, @Query('status') status?: string) {
    return this.approvals.findAll(query.page, query.pageSize, status);
  }

  @Get(':id')
  @RequirePermission('identity.approval.act')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.approvals.findOne(id);
  }

  @Post(':id/act')
  @RequirePermission('identity.approval.act')
  act(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ActOnApprovalDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.approvals.act(id, actor.id, dto);
  }

  @Post(':id/delegate')
  @RequirePermission('identity.approval.act')
  delegate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DelegateApprovalDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.approvals.delegate(id, actor.id, dto);
  }
}
