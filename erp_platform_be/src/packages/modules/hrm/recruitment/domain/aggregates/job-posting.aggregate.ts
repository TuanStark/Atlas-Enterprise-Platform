import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface JobPostingProps {
  tenantId: Identifier;
  requisitionId: Identifier;
  title?: string;
  description?: string;
  publishedAt?: Date;
  expiredAt?: Date;
  isActive: boolean;
}

export class JobPosting extends AggregateRoot<JobPostingProps> {
  static create(
    props: Omit<JobPostingProps, 'isActive'> & {
      isActive?: boolean;
    },
  ): JobPosting {
    return new JobPosting(Identifier.create(), {
      ...props,
      isActive: props.isActive ?? true,
    });
  }

  static rehydrate(id: Identifier, props: JobPostingProps): JobPosting {
    return new JobPosting(id, props);
  }

  get tenantId(): Identifier {
    return this.props.tenantId;
  }

  get requisitionId(): Identifier {
    return this.props.requisitionId;
  }

  get title(): string | undefined {
    return this.props.title;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get publishedAt(): Date | undefined {
    return this.props.publishedAt;
  }

  get expiredAt(): Date | undefined {
    return this.props.expiredAt;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  update(props: Partial<Omit<JobPostingProps, 'tenantId' | 'requisitionId'>>): void {
    if (props.title !== undefined) this.props.title = props.title;
    if (props.description !== undefined) this.props.description = props.description;
    if (props.publishedAt !== undefined) this.props.publishedAt = props.publishedAt;
    if (props.expiredAt !== undefined) this.props.expiredAt = props.expiredAt;
    if (props.isActive !== undefined) this.props.isActive = props.isActive;
  }

  publish(): void {
    this.props.isActive = true;
    this.props.publishedAt = new Date();
  }

  close(): void {
    this.props.isActive = false;
    this.props.expiredAt = new Date();
  }
}
