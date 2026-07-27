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
import { ListContractsHandler } from './application/queries/list-contracts/list-contracts.handler';
import { GetContractsByEmploymentHandler } from './application/queries/get-contracts-by-employment/get-contracts-by-employment.handler';

const CommandHandlers = [
  CreateContractHandler,
  SignContractHandler,
  CreateContractAnnexHandler,
];

const QueryHandlers = [
  ListContractsHandler,
  GetContractsByEmploymentHandler,
];

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [ContractController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: IContractRepository,
      useClass: PrismaContractRepository,
    },
  ],
})
export class ContractModule {}
