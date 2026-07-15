import { Entity } from '@shared-kernel/domain/entity';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface PayrollItemProps {
  payrollId: Identifier;
  salaryComponentId: Identifier;
  amount?: number;
  remark?: string;
}

export class PayrollItem extends Entity<PayrollItemProps> {
  static create(props: PayrollItemProps): PayrollItem {
    return new PayrollItem(Identifier.create(), props);
  }

  static rehydrate(id: Identifier, props: PayrollItemProps): PayrollItem {
    return new PayrollItem(id, props);
  }

  get payrollId() {
    return this.props.payrollId;
  }

  get salaryComponentId() {
    return this.props.salaryComponentId;
  }

  get amount() {
    return this.props.amount;
  }

  get remark() {
    return this.props.remark;
  }

  update(props: Partial<Omit<PayrollItemProps, 'payrollId'>>): void {
    if (props.salaryComponentId !== undefined)
      this.props.salaryComponentId = props.salaryComponentId;
    if (props.amount !== undefined) this.props.amount = props.amount;
    if (props.remark !== undefined) this.props.remark = props.remark;
  }
}
