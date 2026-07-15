import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { EntityAlreadyExistsException } from '@shared-kernel/exceptions';
import { SalaryComponent } from '../../domain/aggregates/salary-component.aggregate';
import * as repo from '../../domain/repositories/salary-component.repository';
import { CreateSalaryComponentDto, UpdateSalaryComponentDto } from '../dto/salary-component.dto';

// --- Commands ---

export class CreateSalaryComponentCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CreateSalaryComponentDto,
  ) {}
}

export class UpdateSalaryComponentCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: UpdateSalaryComponentDto,
  ) {}
}

export class DeleteSalaryComponentCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

// --- Handlers ---

@CommandHandler(CreateSalaryComponentCommand)
export class CreateSalaryComponentHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreateSalaryComponentCommand>
{
  constructor(
    @Inject(repo.SALARY_COMPONENT_REPOSITORY)
    private readonly repository: repo.SalaryComponentRepository,
  ) {
    super();
  }

  async execute(command: CreateSalaryComponentCommand): Promise<Identifier> {
    const exists = await this.repository.existsByCode(command.tenantId, command.dto.code);
    if (exists) {
      throw new EntityAlreadyExistsException('SalaryComponent', 'code', command.dto.code);
    }

    const entity = SalaryComponent.create({
      tenantId: command.tenantId,
      code: command.dto.code,
      name: command.dto.name,
      componentType: command.dto.componentType,
      calculationType: command.dto.calculationType,
      defaultAmount: command.dto.defaultAmount,
      taxable: command.dto.taxable,
    });

    await this.repository.save(entity);
    return entity.id;
  }
}

@CommandHandler(UpdateSalaryComponentCommand)
export class UpdateSalaryComponentHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdateSalaryComponentCommand>
{
  constructor(
    @Inject(repo.SALARY_COMPONENT_REPOSITORY)
    private readonly repository: repo.SalaryComponentRepository,
  ) {
    super();
  }

  async execute(command: UpdateSalaryComponentCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'SalaryComponent',
      command.id.toString(),
    );

    entity.update({
      code: command.dto.code,
      name: command.dto.name,
      componentType: command.dto.componentType,
      calculationType: command.dto.calculationType,
      defaultAmount: command.dto.defaultAmount,
      taxable: command.dto.taxable,
    });

    await this.repository.update(entity);
  }
}

@CommandHandler(DeleteSalaryComponentCommand)
export class DeleteSalaryComponentHandler
  extends BaseCommandHandler
  implements ICommandHandler<DeleteSalaryComponentCommand>
{
  constructor(
    @Inject(repo.SALARY_COMPONENT_REPOSITORY)
    private readonly repository: repo.SalaryComponentRepository,
  ) {
    super();
  }

  async execute(command: DeleteSalaryComponentCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'SalaryComponent',
      command.id.toString(),
    );

    await this.repository.delete(entity);
  }
}
