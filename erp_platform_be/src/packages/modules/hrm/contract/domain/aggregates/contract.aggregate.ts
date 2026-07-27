import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { ContractStatus } from '@prisma/client';
import { ContractAnnex, ContractAnnexProps } from '../entities/contract-annex.entity';

export interface ContractProps {
  employmentId: Identifier;
  contractTypeId: Identifier;
  contractNumber: string;
  startDate: Date;
  endDate?: Date;
  signedDate?: Date;
  fileId?: string;
  isCurrent: boolean;
  status: ContractStatus;
  baseSalary?: number;
  workingHours?: string;
  contractTemplateId?: Identifier;
  createdAt: Date;
  updatedAt: Date;
  annexes: ContractAnnex[];
}

export interface CreateContractProps {
  employmentId: Identifier;
  contractTypeId: Identifier;
  contractNumber: string;
  startDate: Date;
  endDate?: Date;
  baseSalary?: number;
  workingHours?: string;
  contractTemplateId?: Identifier;
}

export class Contract extends AggregateRoot<ContractProps> {
  static create(props: CreateContractProps): Contract {
    const now = new Date();
    return new Contract(Identifier.create(), {
      ...props,
      isCurrent: true,
      status: ContractStatus.draft,
      createdAt: now,
      updatedAt: now,
      annexes: [],
    });
  }

  static rehydrate(id: Identifier, props: ContractProps): Contract {
    return new Contract(id, props);
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
  get status() {
    return this.props.status;
  }
  get baseSalary() {
    return this.props.baseSalary;
  }
  get workingHours() {
    return this.props.workingHours;
  }
  get contractTemplateId() {
    return this.props.contractTemplateId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  get annexes(): readonly ContractAnnex[] {
    return this.props.annexes;
  }

  // Domain Logic

  sign(signedDate: Date, fileId?: string) {
    if (
      this.props.status !== ContractStatus.draft &&
      this.props.status !== ContractStatus.pending_signature
    ) {
      throw new Error('Cannot sign a contract that is not in draft or pending signature state');
    }
    this.props.status = ContractStatus.active;
    this.props.signedDate = signedDate;
    if (fileId) {
      this.props.fileId = fileId;
    }
    this.touch();
  }

  terminate() {
    if (
      this.props.status === ContractStatus.terminated ||
      this.props.status === ContractStatus.expired
    ) {
      return;
    }
    this.props.status = ContractStatus.terminated;
    this.props.isCurrent = false;
    this.touch();
  }

  expire() {
    if (this.props.status === ContractStatus.expired) {
      return;
    }
    this.props.status = ContractStatus.expired;
    this.props.isCurrent = false;
    this.touch();
  }

  requestSignature() {
    if (this.props.status !== ContractStatus.draft) {
      throw new Error('Only draft contracts can be requested for signature');
    }
    this.props.status = ContractStatus.pending_signature;
    this.touch();
  }

  addAnnex(
    props: Omit<ContractAnnexProps, 'employmentContractId' | 'createdAt' | 'updatedAt'>,
  ): ContractAnnex {
    if (this.props.status !== ContractStatus.active) {
      throw new Error('Can only add annexes to active contracts');
    }

    const annex = ContractAnnex.create({
      ...props,
      employmentContractId: this.id,
    });

    this.props.annexes.push(annex);
    this.touch();
    return annex;
  }

  updateDetails(details: { baseSalary?: number; workingHours?: string }) {
    if (details.baseSalary !== undefined) {
      this.props.baseSalary = details.baseSalary;
    }
    if (details.workingHours !== undefined) {
      this.props.workingHours = details.workingHours;
    }
    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
