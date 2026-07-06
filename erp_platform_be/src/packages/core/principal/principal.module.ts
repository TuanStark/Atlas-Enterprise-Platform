import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PRINCIPAL_REPOSITORY } from './domain';

import { PrismaPrincipalRepository } from './infrastructure';
import { CreatePrincipalHandler } from './application/commands/create-principal/create-principal.handler';
import { UpdatePrincipalHandler } from './application/commands/update-principal/update-principal.handler';
import { ActivatePrincipalHandler } from './application/commands/activate-principal/activate-principal.handler';
import { SuspendPrincipalHandler } from './application/commands/suspend-principal/suspend-principal.handler';
import { GetPrincipalHandler, ListPrincipalHandler } from './application/queries';
import { PrismaModule } from 'src/database/prisma.module';
import { PrincipalController } from './presentation/controllers/principal.controller';

@Module({
  imports: [PrismaModule, CqrsModule],

  controllers: [PrincipalController],

  providers: [
    CreatePrincipalHandler,

    UpdatePrincipalHandler,

    ActivatePrincipalHandler,

    SuspendPrincipalHandler,

    GetPrincipalHandler,

    ListPrincipalHandler,

    {
      provide: PRINCIPAL_REPOSITORY,

      useClass: PrismaPrincipalRepository,
    },
  ],

  exports: [PRINCIPAL_REPOSITORY],
})
export class PrincipalModule {}
