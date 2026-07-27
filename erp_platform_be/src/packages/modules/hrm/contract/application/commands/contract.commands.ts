import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { Contract } from '../../domain/aggregates/contract.aggregate';
import { IContractRepository } from '../../domain/repositories/contract.repository';
import {
  CreateContractDto,
  CreateContractAnnexDto,
  SignContractDto,
} from '../dto/contract.dto';

// --- Commands ---

export class CreateContractCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CreateContractDto,
  ) {}
}

export class SignContractCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly contractId: Identifier,
    public readonly dto: SignContractDto,
  ) {}
}

export class CreateContractAnnexCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly contractId: Identifier,
    public readonly dto: CreateContractAnnexDto,
  ) {}
}

// --- Handlers ---

@CommandHandler(CreateContractCommand)
export class CreateContractHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreateContractCommand>
{
  constructor(
    @Inject(IContractRepository)
    private readonly contractRepository: IContractRepository,
  ) {
    super();
  }

  async execute(command: CreateContractCommand): Promise<string> {
    const { dto } = command;

    const contract = Contract.create({
      employmentId: Identifier.create(dto.employmentId),
      contractTypeId: Identifier.create(dto.contractTypeId),
      contractNumber: dto.contractNumber,
      startDate: dto.startDate,
      endDate: dto.endDate,
      baseSalary: dto.baseSalary,
      workingHours: dto.workingHours,
      contractTemplateId: dto.contractTemplateId ? Identifier.create(dto.contractTemplateId) : undefined,
    });

    await this.contractRepository.save(contract);
    // Ideally emit event here

    return contract.id.toString();
  }
}

@CommandHandler(SignContractCommand)
export class SignContractHandler
  extends BaseCommandHandler
  implements ICommandHandler<SignContractCommand>
{
  constructor(
    @Inject(IContractRepository)
    private readonly contractRepository: IContractRepository,
  ) {
    super();
  }

  async execute(command: SignContractCommand): Promise<void> {
    const contract = await this.contractRepository.findById(command.contractId, command.tenantId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    contract.sign(command.dto.signedDate, command.dto.fileId);
    await this.contractRepository.save(contract);
  }
}

@CommandHandler(CreateContractAnnexCommand)
export class CreateContractAnnexHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreateContractAnnexCommand>
{
  constructor(
    @Inject(IContractRepository)
    private readonly contractRepository: IContractRepository,
  ) {
    super();
  }

  async execute(command: CreateContractAnnexCommand): Promise<string> {
    const contract = await this.contractRepository.findById(command.contractId, command.tenantId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    const annex = contract.addAnnex({
      annexNumber: command.dto.annexNumber,
      content: command.dto.content,
      effectiveDate: command.dto.effectiveDate,
      fileId: command.dto.fileId,
    });

    await this.contractRepository.save(contract);
    return annex.id.toString();
  }
}
