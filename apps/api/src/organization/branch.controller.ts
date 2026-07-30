import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

import { BranchService } from './branch.service.js';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto.js';

class BranchListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  legalEntityId?: string;
}

/** See legal-entity.controller.ts for the RBAC caveat — same applies here. */
@ApiTags('branches')
@Controller('branches')
export class BranchController {
  constructor(private readonly branches: BranchService) {}

  @Post()
  create(@Body() dto: CreateBranchDto) {
    return this.branches.create(dto);
  }

  @Get()
  findAll(@Query() query: BranchListQueryDto) {
    return this.branches.findAll(query.page, query.pageSize, query.legalEntityId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.branches.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBranchDto) {
    return this.branches.update(id, dto);
  }
}
