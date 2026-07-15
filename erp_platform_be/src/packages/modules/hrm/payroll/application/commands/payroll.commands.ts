import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { PrismaService } from 'src/database/prisma.service';
import { Payroll } from '../../domain/aggregates/payroll.aggregate';
import { PayrollItem } from '../../domain/entities/payroll-item.entity';
import * as repo from '../../domain/repositories/payroll.repository';
import { CreatePayrollDto, UpdatePayrollDto } from '../dto/payroll.dto';
import { PayrollStatus } from '@prisma/client';

// --- Commands ---

export class CreatePayrollCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CreatePayrollDto,
  ) {}
}

export class UpdatePayrollCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: UpdatePayrollDto,
  ) {}
}

export class DeletePayrollCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class CalculatePayrollCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly periodId: Identifier,
  ) {}
}

// --- Handlers ---

@CommandHandler(CreatePayrollCommand)
export class CreatePayrollHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreatePayrollCommand>
{
  constructor(
    @Inject(repo.PAYROLL_REPOSITORY)
    private readonly repository: repo.PayrollRepository,
  ) {
    super();
  }

  async execute(command: CreatePayrollCommand): Promise<Identifier> {
    const entity = Payroll.create({
      tenantId: command.tenantId,
      payrollPeriodId: Identifier.create(command.dto.payrollPeriodId),
      employmentId: Identifier.create(command.dto.employmentId),
      grossSalary: command.dto.grossSalary,
      totalAllowance: command.dto.totalAllowance,
      totalDeduction: command.dto.totalDeduction,
      netSalary: command.dto.netSalary,
      status: command.dto.status,
      payslipFileId: command.dto.payslipFileId
        ? Identifier.create(command.dto.payslipFileId)
        : undefined,
    });

    if (command.dto.payrollItems) {
      entity.setItems(
        command.dto.payrollItems.map((pi) =>
          PayrollItem.create({
            payrollId: entity.id,
            salaryComponentId: Identifier.create(pi.salaryComponentId),
            amount: pi.amount,
            remark: pi.remark,
          }),
        ),
      );
    }

    await this.repository.save(entity);
    return entity.id;
  }
}

@CommandHandler(UpdatePayrollCommand)
export class UpdatePayrollHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdatePayrollCommand>
{
  constructor(
    @Inject(repo.PAYROLL_REPOSITORY)
    private readonly repository: repo.PayrollRepository,
  ) {
    super();
  }

  async execute(command: UpdatePayrollCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'Payroll',
      command.id.toString(),
    );

    entity.update({
      grossSalary: command.dto.grossSalary,
      totalAllowance: command.dto.totalAllowance,
      totalDeduction: command.dto.totalDeduction,
      netSalary: command.dto.netSalary,
      status: command.dto.status,
      payslipFileId: command.dto.payslipFileId
        ? Identifier.create(command.dto.payslipFileId)
        : undefined,
    });

    if (command.dto.payrollItems) {
      entity.setItems(
        command.dto.payrollItems.map((pi) =>
          PayrollItem.create({
            payrollId: entity.id,
            salaryComponentId: Identifier.create(pi.salaryComponentId),
            amount: pi.amount,
            remark: pi.remark,
          }),
        ),
      );
    }

    await this.repository.update(entity);
  }
}

@CommandHandler(DeletePayrollCommand)
export class DeletePayrollHandler
  extends BaseCommandHandler
  implements ICommandHandler<DeletePayrollCommand>
{
  constructor(
    @Inject(repo.PAYROLL_REPOSITORY)
    private readonly repository: repo.PayrollRepository,
  ) {
    super();
  }

  async execute(command: DeletePayrollCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'Payroll',
      command.id.toString(),
    );

    await this.repository.delete(entity);
  }
}

@CommandHandler(CalculatePayrollCommand)
export class CalculatePayrollHandler
  extends BaseCommandHandler
  implements ICommandHandler<CalculatePayrollCommand>
{
  constructor(
    private readonly prisma: PrismaService,
    @Inject(repo.PAYROLL_REPOSITORY)
    private readonly repository: repo.PayrollRepository,
  ) {
    super();
  }

  async execute(command: CalculatePayrollCommand): Promise<void> {
    const period = await this.prisma.payrollPeriod.findFirst({
      where: { id: command.periodId.toString(), tenantId: command.tenantId.toString() },
    });
    if (!period) {
      throw new Error(`PayrollPeriod not found with ID ${command.periodId.toString()}`);
    }

    // Set status to calculating
    await this.prisma.payrollPeriod.update({
      where: { id: period.id },
      data: { status: PayrollStatus.calculating },
    });

    try {
      // Find all active employments
      const employments = await this.prisma.employment.findMany({
        where: {
          tenantId: command.tenantId.toString(),
          status: 'active', // assuming 'active' status
        },
      });

      for (const emp of employments) {
        // Find salary assignment active during this period
        const assignment = await this.prisma.employeeSalaryAssignment.findFirst({
          where: {
            tenantId: command.tenantId.toString(),
            employmentId: emp.id,
            effectiveFrom: { lte: period.endDate ?? new Date() },
            OR: [{ effectiveTo: null }, { effectiveTo: { gte: period.startDate ?? new Date() } }],
          },
        });

        if (assignment) {
          const baseSalary = assignment.baseSalary ? assignment.baseSalary.toNumber() : 0;

          // Compute basic totals
          const grossSalary = baseSalary;
          const totalAllowance = 0;
          const totalDeduction = 0;
          const netSalary = grossSalary + totalAllowance - totalDeduction;

          // Check if payroll already exists for this period + employment
          let payrollRecord = await this.repository.findByPeriodAndEmployment(
            command.tenantId,
            command.periodId,
            Identifier.create(emp.id),
          );

          if (payrollRecord) {
            payrollRecord.update({
              grossSalary,
              totalAllowance,
              totalDeduction,
              netSalary,
              status: PayrollStatus.calculated,
            });
            await this.repository.update(payrollRecord);
          } else {
            payrollRecord = Payroll.create({
              tenantId: command.tenantId,
              payrollPeriodId: command.periodId,
              employmentId: Identifier.create(emp.id),
              grossSalary,
              totalAllowance,
              totalDeduction,
              netSalary,
              status: PayrollStatus.calculated,
            });
            await this.repository.save(payrollRecord);
          }
        }
      }

      // Mark period as calculated
      await this.prisma.payrollPeriod.update({
        where: { id: period.id },
        data: { status: PayrollStatus.calculated },
      });
    } catch (error) {
      // Reset status to draft/failed
      await this.prisma.payrollPeriod.update({
        where: { id: period.id },
        data: { status: PayrollStatus.draft },
      });
      throw error;
    }
  }
}
