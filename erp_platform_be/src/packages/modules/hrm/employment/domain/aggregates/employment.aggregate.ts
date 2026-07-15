import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { EmploymentStatus } from '@prisma/client';
import {
  EmploymentContract,
  EmploymentContractProps,
} from '../entities/employment-contract.entity';
import {
  EmploymentStatusHistory,
  EmploymentStatusHistoryProps,
} from '../entities/employment-status-history.entity';

export interface EmploymentProps {
  tenantId: Identifier;
  employeeId: Identifier;
  employmentTypeId: Identifier;
  employeeCode: string;
  hireDate: Date;
  probationStartDate?: Date;
  probationEndDate?: Date;
  confirmationDate?: Date;
  terminationDate?: Date;
  status: EmploymentStatus;
  reason?: string;
  metadata?: Record<string, unknown>;
  contracts: EmploymentContract[];
  statusHistory: EmploymentStatusHistory[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateEmploymentProps {
  tenantId: Identifier;
  employeeId: Identifier;
  employmentTypeId: Identifier;
  employeeCode: string;
  hireDate: Date;
  probationStartDate?: Date;
  probationEndDate?: Date;
  metadata?: Record<string, unknown>;
}

export class Employment extends AggregateRoot<EmploymentProps> {
  static create(props: CreateEmploymentProps): Employment {
    const now = new Date();
    const isProbation = !!props.probationStartDate;
    const initialStatus = isProbation ? EmploymentStatus.probation : EmploymentStatus.active;

    const employment = new Employment(Identifier.create(), {
      tenantId: props.tenantId,
      employeeId: props.employeeId,
      employmentTypeId: props.employmentTypeId,
      employeeCode: props.employeeCode,
      hireDate: props.hireDate,
      probationStartDate: props.probationStartDate,
      probationEndDate: props.probationEndDate,
      status: initialStatus,
      contracts: [],
      statusHistory: [],
      createdAt: now,
      updatedAt: now,
    });

    // Record initial status in history
    employment.addStatusHistory({
      toStatus: initialStatus,
      effectiveDate: props.hireDate,
      reason: 'Initial employment record creation',
    });

    return employment;
  }

  static rehydrate(id: Identifier, props: EmploymentProps): Employment {
    return new Employment(id, props);
  }

  // --- Getters ---

  get tenantId() {
    return this.props.tenantId;
  }

  get employeeId() {
    return this.props.employeeId;
  }

  get employmentTypeId() {
    return this.props.employmentTypeId;
  }

  get employeeCode() {
    return this.props.employeeCode;
  }

  get hireDate() {
    return this.props.hireDate;
  }

  get probationStartDate() {
    return this.props.probationStartDate;
  }

  get probationEndDate() {
    return this.props.probationEndDate;
  }

  get confirmationDate() {
    return this.props.confirmationDate;
  }

  get terminationDate() {
    return this.props.terminationDate;
  }

  get status() {
    return this.props.status;
  }

  get reason() {
    return this.props.reason;
  }

  get metadata() {
    return this.props.metadata;
  }

  get contracts(): readonly EmploymentContract[] {
    return this.props.contracts;
  }

  get statusHistory(): readonly EmploymentStatusHistory[] {
    return this.props.statusHistory;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get deletedAt() {
    return this.props.deletedAt;
  }

  // --- Domain Logic ---

  changeStatus(
    toStatus: EmploymentStatus,
    effectiveDate: Date,
    reason?: string,
    changedByPrincipalId?: string,
  ): void {
    if (this.props.status === toStatus) {
      return;
    }

    const fromStatus = this.props.status;
    this.props.status = toStatus;
    this.props.reason = reason;

    if (toStatus === EmploymentStatus.active && fromStatus === EmploymentStatus.probation) {
      this.props.confirmationDate = effectiveDate;
    }

    this.addStatusHistory({
      fromStatus,
      toStatus,
      effectiveDate,
      reason,
      changedByPrincipalId,
    });

    this.touch();
  }

  terminate(terminationDate: Date, reason?: string, changedByPrincipalId?: string): void {
    this.props.status = EmploymentStatus.terminated;
    this.props.terminationDate = terminationDate;
    this.props.reason = reason;

    this.addStatusHistory({
      fromStatus: EmploymentStatus.active,
      toStatus: EmploymentStatus.terminated,
      effectiveDate: terminationDate,
      reason,
      changedByPrincipalId,
    });

    this.touch();
  }

  addContract(
    props: Omit<EmploymentContractProps, 'employmentId' | 'isCurrent' | 'createdAt' | 'updatedAt'>,
  ): EmploymentContract {
    // Deactivate current active contracts
    for (const contract of this.props.contracts) {
      if (contract.isCurrent) {
        contract.deactivate();
      }
    }

    const contract = EmploymentContract.create({
      ...props,
      employmentId: this.id,
    });

    this.props.contracts.push(contract);
    this.touch();
    return contract;
  }

  private addStatusHistory(
    props: Omit<EmploymentStatusHistoryProps, 'employmentId' | 'createdAt'>,
  ): void {
    const history = EmploymentStatusHistory.create({
      ...props,
      employmentId: this.id,
    });
    this.props.statusHistory.push(history);
  }

  private touch(): void {
    this.props.updatedAt = new Date();
  }
}
