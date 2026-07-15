import { Entity } from '@shared-kernel/domain/entity';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { OfferStatus } from '@prisma/client';

export interface JobOfferProps {
  applicationId: Identifier;
  offeredSalary?: number;
  currency?: string;
  startDate?: Date;
  status: OfferStatus;
  offerFileId?: Identifier;
  createdAt: Date;
}

export class JobOffer extends Entity<JobOfferProps> {
  static create(
    props: Omit<JobOfferProps, 'createdAt' | 'status'> & { status?: OfferStatus },
  ): JobOffer {
    return new JobOffer(Identifier.create(), {
      ...props,
      status: props.status ?? OfferStatus.draft,
      createdAt: new Date(),
    });
  }

  static rehydrate(id: Identifier, props: JobOfferProps): JobOffer {
    return new JobOffer(id, props);
  }

  get applicationId() {
    return this.props.applicationId;
  }

  get offeredSalary() {
    return this.props.offeredSalary;
  }

  get currency() {
    return this.props.currency;
  }

  get startDate() {
    return this.props.startDate;
  }

  get status() {
    return this.props.status;
  }

  get offerFileId() {
    return this.props.offerFileId;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  update(props: Partial<Omit<JobOfferProps, 'applicationId' | 'createdAt'>>): void {
    if (props.offeredSalary !== undefined) this.props.offeredSalary = props.offeredSalary;
    if (props.currency !== undefined) this.props.currency = props.currency;
    if (props.startDate !== undefined) this.props.startDate = props.startDate;
    if (props.status !== undefined) this.props.status = props.status;
    if (props.offerFileId !== undefined) this.props.offerFileId = props.offerFileId;
  }
}
