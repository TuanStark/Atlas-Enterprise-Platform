import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { LeaveBalanceDomainService } from '../../domain/services/leave-balance-domain.service';
import * as repo from '../../domain/repositories/leave-balance.repository';
import { InitializeLeaveBalanceDto, AdjustLeaveBalanceDto } from '../dto/leave-balance.dto';

// --- Commands ---

export class InitializeLeaveBalanceCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: InitializeLeaveBalanceDto,
  ) {}
}

export class AdjustLeaveBalanceCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: AdjustLeaveBalanceDto,
  ) {}
}

// --- Handlers ---

@CommandHandler(InitializeLeaveBalanceCommand)
export class InitializeLeaveBalanceHandler
  extends BaseCommandHandler
  implements ICommandHandler<InitializeLeaveBalanceCommand>
{
  constructor(private readonly service: LeaveBalanceDomainService) {
    super();
  }

  async execute(command: InitializeLeaveBalanceCommand): Promise<void> {
    const { tenantId, dto } = command;
    await this.service.initializeBalancesForEmployment(
      tenantId,
      Identifier.create(dto.employmentId),
      dto.year,
    );
  }
}

@CommandHandler(AdjustLeaveBalanceCommand)
export class AdjustLeaveBalanceHandler
  extends BaseCommandHandler
  implements ICommandHandler<AdjustLeaveBalanceCommand>
{
  constructor(
    @Inject(repo.LEAVE_BALANCE_REPOSITORY)
    private readonly repository: repo.LeaveBalanceRepository,
  ) {
    super();
  }

  async execute(command: AdjustLeaveBalanceCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'LeaveBalance',
      command.id.toString(),
    );

    entity.updateEntitlement(command.dto.entitledDays);
    await this.repository.update(entity);
  }
}
