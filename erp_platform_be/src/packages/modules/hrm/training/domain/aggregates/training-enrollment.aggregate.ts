import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { EnrollmentStatus } from '@prisma/client';
import { TrainingResult } from '../entities/training-result.entity';
import { TrainingCertificate } from '../entities/training-certificate.entity';

export interface TrainingEnrollmentProps {
  tenantId: Identifier;
  employmentId: Identifier;
  sessionId: Identifier;
  enrolledAt?: Date;
  status: EnrollmentStatus;
  createdAt: Date;
  result?: TrainingResult;
  certificates: TrainingCertificate[];
}

export class TrainingEnrollment extends AggregateRoot<TrainingEnrollmentProps> {
  static create(
    props: Omit<TrainingEnrollmentProps, 'createdAt' | 'status' | 'certificates' | 'enrolledAt'> & {
      status?: EnrollmentStatus;
      enrolledAt?: Date;
      result?: TrainingResult;
      certificates?: TrainingCertificate[];
    },
  ): TrainingEnrollment {
    return new TrainingEnrollment(Identifier.create(), {
      ...props,
      status: props.status ?? EnrollmentStatus.enrolled,
      enrolledAt: props.enrolledAt ?? new Date(),
      certificates: props.certificates ?? [],
      createdAt: new Date(),
    });
  }

  static rehydrate(id: Identifier, props: TrainingEnrollmentProps): TrainingEnrollment {
    return new TrainingEnrollment(id, props);
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get employmentId() {
    return this.props.employmentId;
  }

  get sessionId() {
    return this.props.sessionId;
  }

  get enrolledAt() {
    return this.props.enrolledAt;
  }

  get status() {
    return this.props.status;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get result() {
    return this.props.result;
  }

  get certificates() {
    return this.props.certificates;
  }

  setResult(result: TrainingResult): void {
    this.props.result = result;
  }

  addCertificate(certificate: TrainingCertificate): void {
    this.props.certificates.push(certificate);
  }

  setCertificates(certificates: TrainingCertificate[]): void {
    this.props.certificates = certificates;
  }

  update(
    props: Partial<
      Omit<
        TrainingEnrollmentProps,
        'tenantId' | 'employmentId' | 'sessionId' | 'certificates' | 'createdAt'
      >
    >,
  ): void {
    if (props.enrolledAt !== undefined) this.props.enrolledAt = props.enrolledAt;
    if (props.status !== undefined) this.props.status = props.status;
    if (props.result !== undefined) this.props.result = props.result;
  }
}
