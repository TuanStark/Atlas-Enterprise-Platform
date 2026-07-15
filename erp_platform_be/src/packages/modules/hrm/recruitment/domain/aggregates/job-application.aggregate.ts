import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { ApplicationStatus } from '@prisma/client';
import { Interview } from '../entities/interview.entity';
import { JobOffer } from '../entities/job-offer.entity';
import { HiringRecord } from '../entities/hiring-record.entity';

export interface JobApplicationProps {
  tenantId: Identifier;
  candidateId: Identifier;
  jobPostingId: Identifier;
  status: ApplicationStatus;
  appliedAt: Date;
  currentStage?: string;
  interviews: Interview[];
  jobOffers: JobOffer[];
  hiringRecords: HiringRecord[];
}

export class JobApplication extends AggregateRoot<JobApplicationProps> {
  static create(
    props: Omit<
      JobApplicationProps,
      'appliedAt' | 'status' | 'interviews' | 'jobOffers' | 'hiringRecords'
    > & {
      status?: ApplicationStatus;
      appliedAt?: Date;
      interviews?: Interview[];
      jobOffers?: JobOffer[];
      hiringRecords?: HiringRecord[];
    },
  ): JobApplication {
    return new JobApplication(Identifier.create(), {
      ...props,
      status: props.status ?? ApplicationStatus.applied,
      appliedAt: props.appliedAt ?? new Date(),
      interviews: props.interviews ?? [],
      jobOffers: props.jobOffers ?? [],
      hiringRecords: props.hiringRecords ?? [],
    });
  }

  static rehydrate(id: Identifier, props: JobApplicationProps): JobApplication {
    return new JobApplication(id, props);
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get candidateId() {
    return this.props.candidateId;
  }

  get jobPostingId() {
    return this.props.jobPostingId;
  }

  get status() {
    return this.props.status;
  }

  get appliedAt() {
    return this.props.appliedAt;
  }

  get currentStage() {
    return this.props.currentStage;
  }

  get interviews() {
    return this.props.interviews;
  }

  get jobOffers() {
    return this.props.jobOffers;
  }

  get hiringRecords() {
    return this.props.hiringRecords;
  }

  updateStage(stage: string): void {
    this.props.currentStage = stage;
  }

  updateStatus(status: ApplicationStatus): void {
    this.props.status = status;
  }

  addInterview(interview: Interview): void {
    this.props.interviews.push(interview);
  }

  addJobOffer(offer: JobOffer): void {
    this.props.jobOffers.push(offer);
  }

  addHiringRecord(record: HiringRecord): void {
    this.props.hiringRecords.push(record);
  }
}
