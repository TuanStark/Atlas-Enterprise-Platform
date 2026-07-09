import { RefreshToken } from '@core/identity';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
export class RefreshTokenMapper {
  static create(principalId: Identifier, token: string): RefreshToken {
    return RefreshToken.create({
      principalId,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  }
}
