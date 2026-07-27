import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
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
  imports: [CqrsModule],
  controllers: [ContractController],
  providers: [...CommandHandlers],
})
export class ContractModule {}
