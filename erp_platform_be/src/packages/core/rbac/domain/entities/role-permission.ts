import { Entity } from '@shared-kernel/domain/entity';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

interface RolePermissionProps {
  permissionId: Identifier;
  createdAt: Date;
}

export class RolePermission extends Entity<RolePermissionProps> {
  get permissionId() {
    return this.props.permissionId;
  }

  static create(permissionId: Identifier) {
    return new RolePermission(Identifier.create(), {
      permissionId,
      createdAt: new Date(),
    });
  }

  static rehydrate(id: Identifier, props: RolePermissionProps) {
    return new RolePermission(id, props);
  }
}
