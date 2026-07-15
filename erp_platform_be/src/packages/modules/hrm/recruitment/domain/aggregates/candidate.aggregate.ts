import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface CandidateProps {
  tenantId: Identifier;
  fullName?: string;
  email?: string;
  phone?: string;
  source?: string;
  resumeFileId?: Identifier;
  createdAt: Date;
}

export class Candidate extends AggregateRoot<CandidateProps> {
  static create(props: Omit<CandidateProps, 'createdAt'>): Candidate {
    return new Candidate(Identifier.create(), {
      ...props,
      createdAt: new Date(),
    });
  }

  static rehydrate(id: Identifier, props: CandidateProps): Candidate {
    return new Candidate(id, props);
  }

  get tenantId(): Identifier {
    return this.props.tenantId;
  }

  get fullName(): string | undefined {
    return this.props.fullName;
  }

  get email(): string | undefined {
    return this.props.email;
  }

  get phone(): string | undefined {
    return this.props.phone;
  }

  get source(): string | undefined {
    return this.props.source;
  }

  get resumeFileId(): Identifier | undefined {
    return this.props.resumeFileId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  update(props: Partial<Omit<CandidateProps, 'tenantId' | 'createdAt'>>): void {
    if (props.fullName !== undefined) this.props.fullName = props.fullName;
    if (props.email !== undefined) this.props.email = props.email;
    if (props.phone !== undefined) this.props.phone = props.phone;
    if (props.source !== undefined) this.props.source = props.source;
    if (props.resumeFileId !== undefined) this.props.resumeFileId = props.resumeFileId;
  }
}
