import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface EmploymentTypeProps {
  tenantId: Identifier;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class EmploymentType extends AggregateRoot<EmploymentTypeProps> {
  static create(
    props: Omit<EmploymentTypeProps, 'isActive' | 'createdAt' | 'updatedAt'>,
  ): EmploymentType {
    const now = new Date();
    return new EmploymentType(Identifier.create(), {
      ...props,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(id: Identifier, props: EmploymentTypeProps): EmploymentType {
    return new EmploymentType(id, props);
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

  get description() {
    return this.props.description;
  }

  get isActive() {
    return this.props.isActive;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  update(name: string, description?: string, isActive?: boolean) {
    this.props.name = name;
    this.props.description = description;
    if (isActive !== undefined) {
      this.props.isActive = isActive;
    }
    this.props.updatedAt = new Date();
  }
}
