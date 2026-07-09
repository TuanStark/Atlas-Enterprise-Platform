import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { RoleCode } from '../value-objects/role-code';
import { RolePermission } from './role-permission';

interface RoleProps {
  tenantId: Identifier;
  code: RoleCode;
  name: string;
  description?: string;
  permissions: RolePermission[];
  createdAt: Date;
  updatedAt: Date;
}

export class Role extends AggregateRoot<RoleProps> {
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

  get permissions() {
    return [...this.props.permissions];
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  rename(name: string) {
    this.props.name = name;
    this.touch();
  }

  changeDescription(description?: string) {
    this.props.description = description;
    this.touch();
  }

  assignPermission(permissionId: Identifier) {
    const exists = this.props.permissions.some((p) => p.permissionId.equals(permissionId));
    if (exists) {
      return;
    }
    this.props.permissions.push(RolePermission.create(permissionId));
    this.touch();
  }

  removePermission(permissionId: Identifier) {
    this.props.permissions = this.props.permissions.filter(
      (p) => !p.permissionId.equals(permissionId),
    );
    this.touch();
  }

  hasPermission(permissionId: Identifier): boolean {
    return this.props.permissions.some((p) => p.permissionId.equals(permissionId));
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  static create(props: {
    tenantId: Identifier;
    code: RoleCode;
    name: string;
    description?: string;
  }) {
    return new Role(Identifier.create(), {
      ...props,
      permissions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static rehydrate(id: Identifier, props: RoleProps) {
    return new Role(id, props);
  }
}
