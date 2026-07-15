import { Entity } from '@shared-kernel/domain/entity';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { EmploymentStatus } from '@prisma/client';

export interface EmploymentStatusHistoryProps {
  employmentId: Identifier;
  fromStatus?: EmploymentStatus;
  toStatus?: EmploymentStatus;
  effectiveDate: Date;
  reason?: string;
  changedByPrincipalId?: string;
  createdAt: Date;
}

export class EmploymentStatusHistory extends Entity<EmploymentStatusHistoryProps> {
  static create(props: Omit<EmploymentStatusHistoryProps, 'createdAt'>): EmploymentStatusHistory {
    return new EmploymentStatusHistory(Identifier.create(), {
      ...props,
      createdAt: new Date(),
    });
  }

  static rehydrate(id: Identifier, props: EmploymentStatusHistoryProps): EmploymentStatusHistory {
    return new EmploymentStatusHistory(id, props);
  }

  get employmentId() {
    return this.props.employmentId;
  }

  get fromStatus() {
    return this.props.fromStatus;
  }

  get toStatus() {
    return this.props.toStatus;
  }

  get effectiveDate() {
    return this.props.effectiveDate;
  }

  get reason() {
    return this.props.reason;
  }

  get changedByPrincipalId() {
    return this.props.changedByPrincipalId;
  }

  get createdAt() {
    return this.props.createdAt;
  }
}
