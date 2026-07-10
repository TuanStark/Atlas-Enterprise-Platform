import { EffectType } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { ValueObject } from '@shared-kernel/domain/value-object';

export interface RolePermissionProps {
  permissionId: Identifier;
  effect: EffectType;
}

export class RolePermission extends ValueObject<RolePermissionProps> {
  private constructor(props: RolePermissionProps) {
    super(props);
  }

  static create(permissionId: Identifier, effect: EffectType = EffectType.allow): RolePermission {
    return new RolePermission({
      permissionId,
      effect,
    });
  }

  get permissionId(): Identifier {
    return this.props.permissionId;
  }

  get effect(): EffectType {
    return this.props.effect;
  }
}
