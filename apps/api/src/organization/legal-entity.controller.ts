import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';

import { CreateLegalEntityDto, UpdateLegalEntityDto } from './dto/legal-entity.dto.js';
import { LegalEntityService } from './legal-entity.service.js';

/**
 * No RBAC guard yet — authorization is Phase 03 (Authentication, RBAC, and
 * Governance). These endpoints are reachable by anyone holding a valid
 * tenant header today; tracked as Blocking-for-MVP in
 * docs/00-Foundation/OPEN-QUESTIONS-REGISTER.md before this can ship.
 */
@ApiTags('legal-entities')
@Controller('legal-entities')
export class LegalEntityController {
  constructor(private readonly legalEntities: LegalEntityService) {}

  @Post()
  create(@Body() dto: CreateLegalEntityDto) {
    return this.legalEntities.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.legalEntities.findAll(query.page, query.pageSize);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.legalEntities.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateLegalEntityDto) {
    return this.legalEntities.update(id, dto);
  }
}
