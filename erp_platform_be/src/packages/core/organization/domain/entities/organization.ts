import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { OrganizationCode } from '../value-objects/organization-code';

export interface OrganizationProps {
  tenantId: Identifier;
  code: OrganizationCode;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Organization extends AggregateRoot<OrganizationProps> {
  static create(props: Omit<OrganizationProps, 'createdAt' | 'updatedAt'>) {
    return new Organization(Identifier.create(), {
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static rehydrate(id: Identifier, props: OrganizationProps) {
    return new Organization(id, props);
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

  rename(name: string) {
    if (this.props.name === name) {
      return;
    }
    this.props.name = name;
    this.touch();
  }

  changeDescription(description?: string) {
    this.props.description = description;
    this.touch();
  }

  activate() {
    this.props.isActive = true;
    this.touch();
  }

  deactivate() {
    this.props.isActive = false;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }
}
