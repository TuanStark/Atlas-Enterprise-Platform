import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PayrollStatus } from '@prisma/client';

export interface PayrollPeriodProps {
  tenantId: Identifier;
  code?: string;
  startDate?: Date;
  endDate?: Date;
  paymentDate?: Date;
  status: PayrollStatus;
  createdAt: Date;
}

export class PayrollPeriod extends AggregateRoot<PayrollPeriodProps> {
  static create(
    props: Omit<PayrollPeriodProps, 'createdAt' | 'status'> & {
      status?: PayrollStatus;
    },
  ): PayrollPeriod {
    return new PayrollPeriod(Identifier.create(), {
      ...props,
      status: props.status ?? PayrollStatus.draft,
      createdAt: new Date(),
    });
  }

  static rehydrate(id: Identifier, props: PayrollPeriodProps): PayrollPeriod {
    return new PayrollPeriod(id, props);
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get code() {
    return this.props.code;
  }

  get startDate() {
    return this.props.startDate;
  }

  get endDate() {
    return this.props.endDate;
  }

  get paymentDate() {
    return this.props.paymentDate;
  }

  get status() {
    return this.props.status;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  update(props: Partial<Omit<PayrollPeriodProps, 'tenantId' | 'createdAt'>>): void {
    if (props.code !== undefined) this.props.code = props.code;
    if (props.startDate !== undefined) this.props.startDate = props.startDate;
    if (props.endDate !== undefined) this.props.endDate = props.endDate;
    if (props.paymentDate !== undefined) this.props.paymentDate = props.paymentDate;
    if (props.status !== undefined) this.props.status = props.status;
  }

  calculate(): void {
    this.props.status = PayrollStatus.calculating;
  }

  calculated(): void {
    this.props.status = PayrollStatus.calculated;
  }

  approve(): void {
    this.props.status = PayrollStatus.approved;
  }

  pay(): void {
    this.props.status = PayrollStatus.paid;
  }

  cancel(): void {
    this.props.status = PayrollStatus.cancelled;
  }
}
