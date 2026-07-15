import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { EntityAlreadyExistsException } from '@shared-kernel/exceptions';
import { ContractType } from '../../domain/entities/contract-type.entity';
import * as repo from '../../domain/repositories/contract-type.repository';
import { CreateContractTypeDto, UpdateContractTypeDto } from '../dto/contract-type.dto';

// --- Commands ---

export class CreateContractTypeCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CreateContractTypeDto,
  ) {}
}

export class UpdateContractTypeCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: UpdateContractTypeDto,
  ) {}
}

export class DeleteContractTypeCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

// --- Handlers ---

@CommandHandler(CreateContractTypeCommand)
export class CreateContractTypeHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreateContractTypeCommand>
{
  constructor(
    @Inject(repo.CONTRACT_TYPE_REPOSITORY)
    private readonly repository: repo.ContractTypeRepository,
  ) {
    super();
  }

  async execute(command: CreateContractTypeCommand): Promise<Identifier> {
    const exists = await this.repository.existsByCode(command.tenantId, command.dto.code);
    if (exists) {
      throw new EntityAlreadyExistsException('ContractType', 'code', command.dto.code);
    }

    const entity = ContractType.create({
      tenantId: command.tenantId,
      code: command.dto.code,
      name: command.dto.name,
      durationMonth: command.dto.durationMonth,
      description: command.dto.description,
    });

    await this.repository.save(entity);
    return entity.id;
  }
}

@CommandHandler(UpdateContractTypeCommand)
export class UpdateContractTypeHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdateContractTypeCommand>
{
  constructor(
    @Inject(repo.CONTRACT_TYPE_REPOSITORY)
    private readonly repository: repo.ContractTypeRepository,
  ) {
    super();
  }

  async execute(command: UpdateContractTypeCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'ContractType',
      command.id.toString(),
    );

    entity.update(
      command.dto.name,
      command.dto.durationMonth,
      command.dto.description,
      command.dto.isActive,
    );

    await this.repository.update(entity);
  }
}

@CommandHandler(DeleteContractTypeCommand)
export class DeleteContractTypeHandler
  extends BaseCommandHandler
  implements ICommandHandler<DeleteContractTypeCommand>
{
  constructor(
    @Inject(repo.CONTRACT_TYPE_REPOSITORY)
    private readonly repository: repo.ContractTypeRepository,
  ) {
    super();
  }

  async execute(command: DeleteContractTypeCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'ContractType',
      command.id.toString(),
    );

    await this.repository.delete(entity);
  }
}
