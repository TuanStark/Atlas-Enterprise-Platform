import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';

export interface RefreshTokenProps {
  id: Identifier;
  principalId: Identifier;
  token: string;
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
}

export class RefreshToken extends AggregateRoot<RefreshTokenProps> {
  private constructor(props: RefreshTokenProps) {
    super(props.id, props);
  }

  static create(props: Omit<RefreshTokenProps, 'id' | 'createdAt' | 'revoked'>) {
    return new RefreshToken({
      ...props,
      id: Identifier.create(),
      createdAt: new Date(),
      revoked: false,
    });
  }

  static rehydrate(props: RefreshTokenProps) {
    return new RefreshToken(props);
  }

  revoke() {
    this.props.revoked = true;
  }

  get revoked() {
    return this.props.revoked;
  }

  get token() {
    return this.props.token;
  }

  get principalId() {
    return this.props.principalId;
  }
}
