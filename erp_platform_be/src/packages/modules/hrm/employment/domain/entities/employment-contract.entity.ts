import { Entity } from '@shared-kernel/domain/entity';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface EmploymentContractProps {
  employmentId: Identifier;
  contractTypeId: Identifier;
  contractNumber: string;
  startDate: Date;
  endDate?: Date;
  signedDate?: Date;
  fileId?: string;
  isCurrent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class EmploymentContract extends Entity<EmploymentContractProps> {
  static create(
    props: Omit<EmploymentContractProps, 'isCurrent' | 'createdAt' | 'updatedAt'>,
  ): EmploymentContract {
    const now = new Date();
    return new EmploymentContract(Identifier.create(), {
      ...props,
      isCurrent: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(id: Identifier, props: EmploymentContractProps): EmploymentContract {
    return new EmploymentContract(id, props);
  }

  get employmentId() {
    return this.props.employmentId;
  }

  get contractTypeId() {
    return this.props.contractTypeId;
  }

  get contractNumber() {
    return this.props.contractNumber;
  }

  get startDate() {
    return this.props.startDate;
  }

  get endDate() {
    return this.props.endDate;
  }

  get signedDate() {
    return this.props.signedDate;
  }

  get fileId() {
    return this.props.fileId;
  }

  get isCurrent() {
    return this.props.isCurrent;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  deactivate() {
    this.props.isCurrent = false;
    this.props.updatedAt = new Date();
  }

  activate() {
    this.props.isCurrent = true;
    this.props.updatedAt = new Date();
  }
}
