import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { RequisitionStatus } from '@prisma/client';

export interface JobRequisitionProps {
  tenantId: Identifier;
  code: string;
  title: string;
  departmentId: Identifier;
  positionId: Identifier;
  requestedByEmploymentId?: Identifier;
  quantity?: number;
  status: RequisitionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class JobRequisition extends AggregateRoot<JobRequisitionProps> {
  static create(
    props: Omit<JobRequisitionProps, 'createdAt' | 'updatedAt' | 'status'> & {
      status?: RequisitionStatus;
    },
  ): JobRequisition {
    const now = new Date();
    return new JobRequisition(Identifier.create(), {
      ...props,
      status: props.status ?? RequisitionStatus.draft,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(id: Identifier, props: JobRequisitionProps): JobRequisition {
    return new JobRequisition(id, props);
  }

  get tenantId(): Identifier {
    return this.props.tenantId;
  }

  get code(): string {
    return this.props.code;
  }

  get title(): string {
    return this.props.title;
  }

  get departmentId(): Identifier {
    return this.props.departmentId;
  }

  get positionId(): Identifier {
    return this.props.positionId;
  }

  get requestedByEmploymentId(): Identifier | undefined {
    return this.props.requestedByEmploymentId;
  }

  get quantity(): number | undefined {
    return this.props.quantity;
  }

  get status(): RequisitionStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  update(props: Partial<Omit<JobRequisitionProps, 'tenantId' | 'createdAt' | 'updatedAt'>>): void {
    if (props.code !== undefined) this.props.code = props.code;
    if (props.title !== undefined) this.props.title = props.title;
    if (props.departmentId !== undefined) this.props.departmentId = props.departmentId;
    if (props.positionId !== undefined) this.props.positionId = props.positionId;
    if (props.requestedByEmploymentId !== undefined)
      this.props.requestedByEmploymentId = props.requestedByEmploymentId;
    if (props.quantity !== undefined) this.props.quantity = props.quantity;
    if (props.status !== undefined) this.props.status = props.status;
    this.props.updatedAt = new Date();
  }

  approve(): void {
    if (this.props.status !== RequisitionStatus.draft) {
      throw new Error('Only draft requisitions can be approved.');
    }
    this.props.status = RequisitionStatus.approved;
    this.props.updatedAt = new Date();
  }

  close(): void {
    this.props.status = RequisitionStatus.closed;
    this.props.updatedAt = new Date();
  }

  cancel(): void {
    this.props.status = RequisitionStatus.cancelled;
    this.props.updatedAt = new Date();
  }
}
