import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import type { AuthenticatedUser } from '../auth/auth.middleware.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { PermissionsGuard } from '../auth/permissions.guard.js';
import { RequirePermission } from '../auth/require-permission.decorator.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

import { CreateUserDto, UpdateUserDto } from './dto/user.dto.js';
import { UserService } from './user.service.js';

@ApiTags('users')
@Controller('users')
@UseGuards(PermissionsGuard)
export class UserController {
  constructor(private readonly users: UserService) {}

  @Post()
  @RequirePermission('identity.user.manage')
  create(@Body() dto: CreateUserDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.users.create(dto, actor.id);
  }

  @Get()
  @RequirePermission('identity.user.manage')
  findAll(@Query() query: PaginationQueryDto) {
    return this.users.findAll(query.page, query.pageSize);
  }

  @Get(':id')
  @RequirePermission('identity.user.manage')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('identity.user.manage')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.users.update(id, dto, actor.id);
  }
}
