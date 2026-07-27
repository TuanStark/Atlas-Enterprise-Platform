import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from 'src/database/prisma.module';
import { IContractRepository } from './domain/repositories/contract.repository';
import { PrismaContractRepository } from './infrastructure/repositories/prisma-contract.repository';
import { ContractController } from './presentation/controllers/contract.controller';
import {
  CreateContractHandler,
  SignContractHandler,
  CreateContractAnnexHandler,
} from './application/commands/contract.commands';

const CommandHandlers = [
  CreateContractHandler,
  SignContractHandler,
  CreateContractAnnexHandler,
];

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [ContractController],
  providers: [
    ...CommandHandlers,
    {
      provide: IContractRepository,
      useClass: PrismaContractRepository,
    },
  ],
})
export class ContractModule {}
