import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PayrollStatus } from '@prisma/client';
import { PayrollItem } from '../entities/payroll-item.entity';

export interface PayrollProps {
  tenantId: Identifier;
  payrollPeriodId: Identifier;
  employmentId: Identifier;
  grossSalary?: number;
  totalAllowance?: number;
  totalDeduction?: number;
  netSalary?: number;
  status?: PayrollStatus;
  payslipFileId?: Identifier;
  createdAt: Date;
  updatedAt: Date;
  payrollItems: PayrollItem[];
}

export class Payroll extends AggregateRoot<PayrollProps> {
  static create(
    props: Omit<PayrollProps, 'createdAt' | 'updatedAt' | 'payrollItems'> & {
      payrollItems?: PayrollItem[];
    },
  ): Payroll {
    const now = new Date();
    return new Payroll(Identifier.create(), {
      ...props,
      payrollItems: props.payrollItems ?? [],
      status: props.status ?? PayrollStatus.draft,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(id: Identifier, props: PayrollProps): Payroll {
    return new Payroll(id, props);
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get payrollPeriodId() {
    return this.props.payrollPeriodId;
  }

  get employmentId() {
    return this.props.employmentId;
  }

  get grossSalary() {
    return this.props.grossSalary;
  }

  get totalAllowance() {
    return this.props.totalAllowance;
  }

  get totalDeduction() {
    return this.props.totalDeduction;
  }

  get netSalary() {
    return this.props.netSalary;
  }

  get status() {
    return this.props.status;
  }

  get payslipFileId() {
    return this.props.payslipFileId;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get payrollItems() {
    return this.props.payrollItems;
  }

  addItem(item: PayrollItem): void {
    this.props.payrollItems.push(item);
    this.updateTotals();
  }

  setItems(items: PayrollItem[]): void {
    this.props.payrollItems = items;
    this.updateTotals();
  }

  updateStatus(status: PayrollStatus): void {
    this.props.status = status;
    this.props.updatedAt = new Date();
  }

  update(
    props: Partial<
      Omit<
        PayrollProps,
        'tenantId' | 'payrollPeriodId' | 'employmentId' | 'payrollItems' | 'createdAt' | 'updatedAt'
      >
    >,
  ): void {
    if (props.grossSalary !== undefined) this.props.grossSalary = props.grossSalary;
    if (props.totalAllowance !== undefined) this.props.totalAllowance = props.totalAllowance;
    if (props.totalDeduction !== undefined) this.props.totalDeduction = props.totalDeduction;
    if (props.netSalary !== undefined) this.props.netSalary = props.netSalary;
    if (props.status !== undefined) this.props.status = props.status;
    if (props.payslipFileId !== undefined) this.props.payslipFileId = props.payslipFileId;
    this.props.updatedAt = new Date();
  }

  private updateTotals(): void {
    // Totals calculations are typically computed based on componentTypes of items.
    // However, basic calculation can be updated in the domain service or handler.
    this.props.updatedAt = new Date();
  }
}
