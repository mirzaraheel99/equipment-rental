import { Global, Module } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service.js';

import { applyTenantScope } from './tenant-scoped-prisma.extension.js';
import { TENANT_SCOPED_PRISMA } from './tenant-scoped-prisma.token.js';

@Global()
@Module({
  providers: [
    {
      provide: TENANT_SCOPED_PRISMA,
      useFactory: (prisma: PrismaService) => applyTenantScope(prisma),
      inject: [PrismaService],
    },
  ],
  exports: [TENANT_SCOPED_PRISMA],
})
export class TenantModule {}
