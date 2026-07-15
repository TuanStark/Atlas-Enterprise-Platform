import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { EntityAlreadyExistsException } from '@shared-kernel/exceptions';
import { EmploymentType } from '../../domain/entities/employment-type.entity';
import * as repo from '../../domain/repositories/employment-type.repository';
import { CreateEmploymentTypeDto, UpdateEmploymentTypeDto } from '../dto/employment-type.dto';

// --- Commands ---

export class CreateEmploymentTypeCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CreateEmploymentTypeDto,
  ) {}
}

export class UpdateEmploymentTypeCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: UpdateEmploymentTypeDto,
  ) {}
}

export class DeleteEmploymentTypeCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

// --- Handlers ---

@CommandHandler(CreateEmploymentTypeCommand)
export class CreateEmploymentTypeHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreateEmploymentTypeCommand>
{
  constructor(
    @Inject(repo.EMPLOYMENT_TYPE_REPOSITORY)
    private readonly repository: repo.EmploymentTypeRepository,
  ) {
    super();
  }

  async execute(command: CreateEmploymentTypeCommand): Promise<Identifier> {
    const exists = await this.repository.existsByCode(command.tenantId, command.dto.code);
    if (exists) {
      throw new EntityAlreadyExistsException('EmploymentType', 'code', command.dto.code);
    }

    const entity = EmploymentType.create({
      tenantId: command.tenantId,
      code: command.dto.code,
      name: command.dto.name,
      description: command.dto.description,
    });

    await this.repository.save(entity);
    return entity.id;
  }
}

@CommandHandler(UpdateEmploymentTypeCommand)
export class UpdateEmploymentTypeHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdateEmploymentTypeCommand>
{
  constructor(
    @Inject(repo.EMPLOYMENT_TYPE_REPOSITORY)
    private readonly repository: repo.EmploymentTypeRepository,
  ) {
    super();
  }

  async execute(command: UpdateEmploymentTypeCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'EmploymentType',
      command.id.toString(),
    );

    entity.update(command.dto.name, command.dto.description, command.dto.isActive);

    await this.repository.update(entity);
  }
}

@CommandHandler(DeleteEmploymentTypeCommand)
export class DeleteEmploymentTypeHandler
  extends BaseCommandHandler
  implements ICommandHandler<DeleteEmploymentTypeCommand>
{
  constructor(
    @Inject(repo.EMPLOYMENT_TYPE_REPOSITORY)
    private readonly repository: repo.EmploymentTypeRepository,
  ) {
    super();
  }

  async execute(command: DeleteEmploymentTypeCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'EmploymentType',
      command.id.toString(),
    );

    await this.repository.delete(entity);
  }
}
