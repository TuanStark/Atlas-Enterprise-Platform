import { Entity } from '@shared-kernel/domain/entity';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface ContractAnnexProps {
  employmentContractId: Identifier;
  annexNumber: string;
  content?: string;
  signedDate?: Date;
  effectiveDate: Date;
  fileId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ContractAnnex extends Entity<ContractAnnexProps> {
  static create(props: Omit<ContractAnnexProps, 'createdAt' | 'updatedAt'>): ContractAnnex {
    const now = new Date();
    return new ContractAnnex(Identifier.create(), {
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(id: Identifier, props: ContractAnnexProps): ContractAnnex {
    return new ContractAnnex(id, props);
  }

  get employmentContractId() {
    return this.props.employmentContractId;
  }

  get annexNumber() {
    return this.props.annexNumber;
  }

  get content() {
    return this.props.content;
  }

  get signedDate() {
    return this.props.signedDate;
  }

  get effectiveDate() {
    return this.props.effectiveDate;
  }

  get fileId() {
    return this.props.fileId;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  sign(signedDate: Date) {
    this.props.signedDate = signedDate;
    this.props.updatedAt = new Date();
  }
}
