import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

import { DepartmentService } from './department.service.js';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto.js';

class DepartmentListQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  legalEntityId?: string;
}

/** See legal-entity.controller.ts for the RBAC caveat — same applies here. */
@ApiTags('departments')
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departments: DepartmentService) {}

  @Post()
  create(@Body() dto: CreateDepartmentDto) {
    return this.departments.create(dto);
  }

  @Get()
  findAll(@Query() query: DepartmentListQueryDto) {
    return this.departments.findAll(query.page, query.pageSize, query.legalEntityId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.departments.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDepartmentDto) {
    return this.departments.update(id, dto);
  }
}
