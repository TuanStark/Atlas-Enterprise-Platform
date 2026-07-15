import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface WorkLocationProps {
  tenantId: Identifier;
  code: string;
  name: string;
  address?: string;
  timezone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class WorkLocation extends AggregateRoot<WorkLocationProps> {
  static create(props: Omit<WorkLocationProps, 'createdAt' | 'updatedAt'>): WorkLocation {
    const now = new Date();
    return new WorkLocation(Identifier.create(), {
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(id: Identifier, props: WorkLocationProps): WorkLocation {
    return new WorkLocation(id, props);
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get code() {
    return this.props.code;
  }

  get name() {
    return this.props.name;
  }

  get address() {
    return this.props.address;
  }

  get timezone() {
    return this.props.timezone;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  update(name: string, address?: string, timezone?: string) {
    this.props.name = name;
    this.props.address = address;
    this.props.timezone = timezone;
    this.props.updatedAt = new Date();
  }
}
