import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { AssignmentStatus } from '@prisma/client';

export interface OrganizationAssignmentProps {
  tenantId: Identifier;
  employmentId: Identifier;
  departmentId: Identifier;
  positionId: Identifier;
  jobTitleId?: Identifier;
  managerEmploymentId?: Identifier;
  workLocationId?: Identifier;
  costCenterId?: Identifier;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isPrimary?: boolean;
  status?: AssignmentStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export class OrganizationAssignment extends AggregateRoot<OrganizationAssignmentProps> {
  static create(props: Omit<OrganizationAssignmentProps, 'createdAt' | 'updatedAt'>) {
    return new OrganizationAssignment(Identifier.create(), {
      ...props,
      isPrimary: props.isPrimary ?? true,
      status: props.status ?? AssignmentStatus.active,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static rehydrate(id: Identifier, props: OrganizationAssignmentProps) {
    return new OrganizationAssignment(id, props);
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get employmentId() {
    return this.props.employmentId;
  }

  get departmentId() {
    return this.props.departmentId;
  }

  get positionId() {
    return this.props.positionId;
  }

  get jobTitleId() {
    return this.props.jobTitleId;
  }

  get managerEmploymentId() {
    return this.props.managerEmploymentId;
  }

  get workLocationId() {
    return this.props.workLocationId;
  }

  get costCenterId() {
    return this.props.costCenterId;
  }

  get effectiveFrom() {
    return this.props.effectiveFrom;
  }

  get effectiveTo() {
    return this.props.effectiveTo;
  }

  get isPrimary() {
    return this.props.isPrimary;
  }

  get status() {
    return this.props.status;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  updateAssignmentDetails(details: {
    departmentId?: Identifier;
    positionId?: Identifier;
    jobTitleId?: Identifier | null;
    managerEmploymentId?: Identifier | null;
    workLocationId?: Identifier | null;
    costCenterId?: Identifier | null;
  }) {
    if (details.departmentId) {
      this.props.departmentId = details.departmentId;
    }
    if (details.positionId) {
      this.props.positionId = details.positionId;
    }
    if (details.jobTitleId !== undefined) {
      this.props.jobTitleId = details.jobTitleId ?? undefined;
    }
    if (details.managerEmploymentId !== undefined) {
      this.props.managerEmploymentId = details.managerEmploymentId ?? undefined;
    }
    if (details.workLocationId !== undefined) {
      this.props.workLocationId = details.workLocationId ?? undefined;
    }
    if (details.costCenterId !== undefined) {
      this.props.costCenterId = details.costCenterId ?? undefined;
    }
    this.touch();
  }

  updateStatus(status: AssignmentStatus) {
    this.props.status = status;
    this.touch();
  }

  updateEffectiveDates(effectiveFrom: Date, effectiveTo?: Date) {
    this.props.effectiveFrom = effectiveFrom;
    this.props.effectiveTo = effectiveTo;
    this.touch();
  }

  setPrimary(isPrimary: boolean) {
    this.props.isPrimary = isPrimary;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }
}
