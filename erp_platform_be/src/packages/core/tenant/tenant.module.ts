import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { TenantController } from './presentation/controllers/tenant.controller';

import {
  CreateTenantHandler,
  UpdateTenantHandler,
  ActivateTenantHandler,
  DeactivateTenantHandler,
  GetTenantHandler,
  ListTenantsHandler,
} from './application';

import { TENANT_REPOSITORY } from './domain';
import { PrismaModule } from 'src/database/prisma.module';
import { PrismaTenantRepository } from './infrastructure/persistence/prisma-tenant.repository';

const CommandHandlers = [
  CreateTenantHandler,
  UpdateTenantHandler,
  ActivateTenantHandler,
  DeactivateTenantHandler,
];

const QueryHandlers = [GetTenantHandler, ListTenantsHandler];

@Module({
  imports: [PrismaModule, CqrsModule],

  controllers: [TenantController],

  providers: [
    ...CommandHandlers,
    ...QueryHandlers,

    {
      provide: TENANT_REPOSITORY,
      useClass: PrismaTenantRepository,
    },
  ],

  exports: [TENANT_REPOSITORY],
})
export class TenantModule {}
