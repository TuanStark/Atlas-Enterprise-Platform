import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { EntityAlreadyExistsException } from '@shared-kernel/exceptions';
import { SalaryStructure } from '../../domain/aggregates/salary-structure.aggregate';
import * as repo from '../../domain/repositories/salary-structure.repository';
import { CreateSalaryStructureDto, UpdateSalaryStructureDto } from '../dto/salary-structure.dto';

// --- Commands ---

export class CreateSalaryStructureCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CreateSalaryStructureDto,
  ) {}
}

export class UpdateSalaryStructureCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: UpdateSalaryStructureDto,
  ) {}
}

export class DeleteSalaryStructureCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

// --- Handlers ---

@CommandHandler(CreateSalaryStructureCommand)
export class CreateSalaryStructureHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreateSalaryStructureCommand>
{
  constructor(
    @Inject(repo.SALARY_STRUCTURE_REPOSITORY)
    private readonly repository: repo.SalaryStructureRepository,
  ) {
    super();
  }

  async execute(command: CreateSalaryStructureCommand): Promise<Identifier> {
    const exists = await this.repository.existsByCode(command.tenantId, command.dto.code);
    if (exists) {
      throw new EntityAlreadyExistsException('SalaryStructure', 'code', command.dto.code);
    }

    const entity = SalaryStructure.create({
      tenantId: command.tenantId,
      code: command.dto.code,
      name: command.dto.name,
      description: command.dto.description,
      isActive: command.dto.isActive,
    });

    await this.repository.save(entity);
    return entity.id;
  }
}

@CommandHandler(UpdateSalaryStructureCommand)
export class UpdateSalaryStructureHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdateSalaryStructureCommand>
{
  constructor(
    @Inject(repo.SALARY_STRUCTURE_REPOSITORY)
    private readonly repository: repo.SalaryStructureRepository,
  ) {
    super();
  }

  async execute(command: UpdateSalaryStructureCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'SalaryStructure',
      command.id.toString(),
    );

    entity.update({
      code: command.dto.code,
      name: command.dto.name,
      description: command.dto.description,
      isActive: command.dto.isActive,
    });

    await this.repository.update(entity);
  }
}

@CommandHandler(DeleteSalaryStructureCommand)
export class DeleteSalaryStructureHandler
  extends BaseCommandHandler
  implements ICommandHandler<DeleteSalaryStructureCommand>
{
  constructor(
    @Inject(repo.SALARY_STRUCTURE_REPOSITORY)
    private readonly repository: repo.SalaryStructureRepository,
  ) {
    super();
  }

  async execute(command: DeleteSalaryStructureCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'SalaryStructure',
      command.id.toString(),
    );

    await this.repository.delete(entity);
  }
}
