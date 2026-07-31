import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { Prisma } from '../../generated/prisma/client.js';
import { generateId } from '../common/id.js';
import { requireTenantId } from '../tenant/tenant-context.js';
import { TENANT_SCOPED_PRISMA, type TenantScopedPrismaClient } from '../tenant/tenant-scoped-prisma.token.js';

import type { CreateAssetLocationDto } from './dto/asset-location.dto.js';

/**
 * CRUD for the `asset_location` dimension table (domain doc §8) — a shared
 * reference of known places (branch yards, jobsites, in-transit, with-
 * customer) that assets and movements point to. Assigning a location to a
 * specific asset is `AssetService.transferLocation`'s job, not this one's.
 */
@Injectable()
export class AssetLocationService {
  constructor(@Inject(TENANT_SCOPED_PRISMA) private readonly prisma: TenantScopedPrismaClient) {}

  async create(dto: CreateAssetLocationDto) {
    return this.prisma.assetLocation.create({
      data: {
        id: generateId(),
        tenantId: requireTenantId(),
        locationType: dto.locationType,
        branchId: dto.branchId ?? null,
        yardId: dto.yardId ?? null,
        zoneId: dto.zoneId ?? null,
        bayCode: dto.bayCode ?? null,
        projectId: dto.projectId ?? null,
        jobsiteId: dto.jobsiteId ?? null,
        latitude: dto.latitude ?? null,
        longitude: dto.longitude ?? null,
        addressJson: dto.addressJson ?? Prisma.DbNull,
        status: 'active',
      },
    });
  }

  async findAll(page: number, pageSize: number) {
    const [items, totalItems] = await Promise.all([
      this.prisma.assetLocation.findMany({
        orderBy: { id: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.assetLocation.count(),
    ]);
    return { items, meta: { page, pageSize, totalItems, totalPages: Math.ceil(totalItems / pageSize) } };
  }

  async findOne(id: string) {
    const location = await this.prisma.assetLocation.findUnique({ where: { id } });
    if (!location) throw new NotFoundException(`Asset location ${id} not found.`);
    return location;
  }
}
