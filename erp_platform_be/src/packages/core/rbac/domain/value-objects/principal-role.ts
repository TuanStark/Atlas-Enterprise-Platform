import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { ValueObject } from '@shared-kernel/domain/value-object';

export interface PrincipalRoleProps {
  principalId: Identifier;
  roleId: Identifier;
  scopeId: Identifier;
  assignedAt: Date;
}

export class PrincipalRole extends ValueObject<PrincipalRoleProps> {
  private constructor(props: PrincipalRoleProps) {
    super(props);
  }

  static create(principalId: Identifier, roleId: Identifier, scopeId: Identifier): PrincipalRole {
    return new PrincipalRole({
      principalId,
      roleId,
      scopeId,
      assignedAt: new Date(),
    });
  }

  static rehydrate(props: PrincipalRoleProps): PrincipalRole {
    return new PrincipalRole(props);
  }

  get principalId(): Identifier {
    return this.props.principalId;
  }

  get roleId(): Identifier {
    return this.props.roleId;
  }

  get scopeId(): Identifier {
    return this.props.scopeId;
  }

  get assignedAt(): Date {
    return this.props.assignedAt;
  }
}
