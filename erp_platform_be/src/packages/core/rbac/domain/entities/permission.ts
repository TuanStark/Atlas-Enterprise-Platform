import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { PermissionCode } from '../value-objects/permission-code';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

interface PermissionProps {
  code: PermissionCode;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Permission extends AggregateRoot<PermissionProps> {
  get code() {
    return this.props.code;
  }

  get name() {
    return this.props.name;
  }

  get description() {
    return this.props.description;
  }

  rename(name: string) {
    this.props.name = name;
    this.touch();
  }

  changeDescription(description?: string) {
    this.props.description = description;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(props: { code: PermissionCode; name: string; description?: string }) {
    return new Permission(Identifier.create(), {
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static rehydrate(id: Identifier, props: PermissionProps) {
    return new Permission(id, props);
  }
}
