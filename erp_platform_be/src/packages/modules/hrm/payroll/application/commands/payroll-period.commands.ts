import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { PayrollPeriod } from '../../domain/aggregates/payroll-period.aggregate';
import * as repo from '../../domain/repositories/payroll-period.repository';
import { CreatePayrollPeriodDto, UpdatePayrollPeriodDto } from '../dto/payroll-period.dto';

// --- Commands ---

export class CreatePayrollPeriodCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CreatePayrollPeriodDto,
  ) {}
}

export class UpdatePayrollPeriodCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: UpdatePayrollPeriodDto,
  ) {}
}

export class DeletePayrollPeriodCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

// --- Handlers ---

@CommandHandler(CreatePayrollPeriodCommand)
export class CreatePayrollPeriodHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreatePayrollPeriodCommand>
{
  constructor(
    @Inject(repo.PAYROLL_PERIOD_REPOSITORY)
    private readonly repository: repo.PayrollPeriodRepository,
  ) {
    super();
  }

  async execute(command: CreatePayrollPeriodCommand): Promise<Identifier> {
    const entity = PayrollPeriod.create({
      tenantId: command.tenantId,
      code: command.dto.code,
      startDate: command.dto.startDate ? new Date(command.dto.startDate) : undefined,
      endDate: command.dto.endDate ? new Date(command.dto.endDate) : undefined,
      paymentDate: command.dto.paymentDate ? new Date(command.dto.paymentDate) : undefined,
      status: command.dto.status,
    });

    await this.repository.save(entity);
    return entity.id;
  }
}

@CommandHandler(UpdatePayrollPeriodCommand)
export class UpdatePayrollPeriodHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdatePayrollPeriodCommand>
{
  constructor(
    @Inject(repo.PAYROLL_PERIOD_REPOSITORY)
    private readonly repository: repo.PayrollPeriodRepository,
  ) {
    super();
  }

  async execute(command: UpdatePayrollPeriodCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'PayrollPeriod',
      command.id.toString(),
    );

    entity.update({
      code: command.dto.code,
      startDate: command.dto.startDate ? new Date(command.dto.startDate) : undefined,
      endDate: command.dto.endDate ? new Date(command.dto.endDate) : undefined,
      paymentDate: command.dto.paymentDate ? new Date(command.dto.paymentDate) : undefined,
      status: command.dto.status,
    });

    await this.repository.update(entity);
  }
}

@CommandHandler(DeletePayrollPeriodCommand)
export class DeletePayrollPeriodHandler
  extends BaseCommandHandler
  implements ICommandHandler<DeletePayrollPeriodCommand>
{
  constructor(
    @Inject(repo.PAYROLL_PERIOD_REPOSITORY)
    private readonly repository: repo.PayrollPeriodRepository,
  ) {
    super();
  }

  async execute(command: DeletePayrollPeriodCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'PayrollPeriod',
      command.id.toString(),
    );

    await this.repository.delete(entity);
  }
}
