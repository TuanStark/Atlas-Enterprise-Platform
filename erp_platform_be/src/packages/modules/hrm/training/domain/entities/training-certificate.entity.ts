import { Entity } from '@shared-kernel/domain/entity';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface TrainingCertificateProps {
  tenantId: Identifier;
  enrollmentId: Identifier;
  certificateNo?: string;
  issuedDate?: Date;
  expiryDate?: Date;
  fileId?: Identifier;
  createdAt: Date;
}

export class TrainingCertificate extends Entity<TrainingCertificateProps> {
  static create(props: Omit<TrainingCertificateProps, 'createdAt'>): TrainingCertificate {
    return new TrainingCertificate(Identifier.create(), {
      ...props,
      createdAt: new Date(),
    });
  }

  static rehydrate(id: Identifier, props: TrainingCertificateProps): TrainingCertificate {
    return new TrainingCertificate(id, props);
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get enrollmentId() {
    return this.props.enrollmentId;
  }

  get certificateNo() {
    return this.props.certificateNo;
  }

  get issuedDate() {
    return this.props.issuedDate;
  }

  get expiryDate() {
    return this.props.expiryDate;
  }

  get fileId() {
    return this.props.fileId;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  update(
    props: Partial<Omit<TrainingCertificateProps, 'tenantId' | 'enrollmentId' | 'createdAt'>>,
  ): void {
    if (props.certificateNo !== undefined) this.props.certificateNo = props.certificateNo;
    if (props.issuedDate !== undefined) this.props.issuedDate = props.issuedDate;
    if (props.expiryDate !== undefined) this.props.expiryDate = props.expiryDate;
    if (props.fileId !== undefined) this.props.fileId = props.fileId;
  }
}
