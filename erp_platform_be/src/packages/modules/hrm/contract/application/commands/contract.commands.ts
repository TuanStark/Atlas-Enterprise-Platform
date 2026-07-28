import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { Contract } from '../../domain/aggregates/contract.aggregate';
import { IContractRepository } from '../../domain/repositories/contract.repository';
import { CreateContractDto, CreateContractAnnexDto, SignContractDto, UpdateContractDto, TerminateContractDto } from '../dto/contract.dto';

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

export class UpdateContractCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly contractId: Identifier,
    public readonly dto: UpdateContractDto,
  ) {}
}

export class TerminateContractCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly contractId: Identifier,
    public readonly dto: TerminateContractDto,
  ) {}
}

export class DeleteContractCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly contractId: Identifier,
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
    const { dto, tenantId } = command;

    let contractTypeId = dto.contractTypeId;
    if (!contractTypeId && dto.contractType) {
      const typeId = await this.contractRepository.findContractTypeIdByCode(
        tenantId,
        dto.contractType,
      );
      if (!typeId) {
        throw new Error(`ContractType with code ${dto.contractType} not found`);
      }
      contractTypeId = typeId.getValue();
    }

    const contractNumber = dto.contractNumber || `HD-${Date.now()}`;

    const contract = Contract.create({
      employmentId: Identifier.create(dto.employmentId),
      contractTypeId: Identifier.create(contractTypeId),
      contractNumber,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      baseSalary: dto.baseSalary,
      workingHours: dto.workingHours,
      contractTemplateId: dto.contractTemplateId
        ? Identifier.create(dto.contractTemplateId)
        : undefined,
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

@CommandHandler(UpdateContractCommand)
export class UpdateContractHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdateContractCommand>
{
  constructor(
    @Inject(IContractRepository)
    private readonly contractRepository: IContractRepository,
  ) {
    super();
  }

  async execute(command: UpdateContractCommand): Promise<void> {
    const contract = await this.contractRepository.findById(command.contractId, command.tenantId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    if (contract.status !== 'draft') {
      throw new Error('Only draft contracts can be updated');
    }

    contract.updateDetails({
      baseSalary: command.dto.baseSalary,
      workingHours: command.dto.workingHours,
    });

    await this.contractRepository.save(contract);
  }
}

@CommandHandler(TerminateContractCommand)
export class TerminateContractHandler
  extends BaseCommandHandler
  implements ICommandHandler<TerminateContractCommand>
{
  constructor(
    @Inject(IContractRepository)
    private readonly contractRepository: IContractRepository,
  ) {
    super();
  }

  async execute(command: TerminateContractCommand): Promise<void> {
    const contract = await this.contractRepository.findById(command.contractId, command.tenantId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    contract.terminate();
    await this.contractRepository.save(contract);
  }
}

@CommandHandler(DeleteContractCommand)
export class DeleteContractHandler
  extends BaseCommandHandler
  implements ICommandHandler<DeleteContractCommand>
{
  constructor(
    @Inject(IContractRepository)
    private readonly contractRepository: IContractRepository,
  ) {
    super();
  }

  async execute(command: DeleteContractCommand): Promise<void> {
    const contract = await this.contractRepository.findById(command.contractId, command.tenantId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    if (contract.status !== 'draft') {
      throw new Error('Only draft contracts can be deleted');
    }

    await this.contractRepository.delete(command.contractId, command.tenantId);
  }
}
