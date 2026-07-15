import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface EmployeeSalaryAssignmentProps {
  tenantId: Identifier;
  employmentId: Identifier;
  salaryStructureId: Identifier;
  effectiveFrom?: Date;
  effectiveTo?: Date;
  baseSalary?: number;
  currency?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class EmployeeSalaryAssignment extends AggregateRoot<EmployeeSalaryAssignmentProps> {
  static create(
    props: Omit<EmployeeSalaryAssignmentProps, 'createdAt' | 'updatedAt'>,
  ): EmployeeSalaryAssignment {
    const now = new Date();
    return new EmployeeSalaryAssignment(Identifier.create(), {
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(id: Identifier, props: EmployeeSalaryAssignmentProps): EmployeeSalaryAssignment {
    return new EmployeeSalaryAssignment(id, props);
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get employmentId() {
    return this.props.employmentId;
  }

  get salaryStructureId() {
    return this.props.salaryStructureId;
  }

  get effectiveFrom() {
    return this.props.effectiveFrom;
  }

  get effectiveTo() {
    return this.props.effectiveTo;
  }

  get baseSalary() {
    return this.props.baseSalary;
  }

  get currency() {
    return this.props.currency;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  update(
    props: Partial<Omit<EmployeeSalaryAssignmentProps, 'tenantId' | 'createdAt' | 'updatedAt'>>,
  ): void {
    if (props.employmentId !== undefined) this.props.employmentId = props.employmentId;
    if (props.salaryStructureId !== undefined)
      this.props.salaryStructureId = props.salaryStructureId;
    if (props.effectiveFrom !== undefined) this.props.effectiveFrom = props.effectiveFrom;
    if (props.effectiveTo !== undefined) this.props.effectiveTo = props.effectiveTo;
    if (props.baseSalary !== undefined) this.props.baseSalary = props.baseSalary;
    if (props.currency !== undefined) this.props.currency = props.currency;
    this.props.updatedAt = new Date();
  }
}
