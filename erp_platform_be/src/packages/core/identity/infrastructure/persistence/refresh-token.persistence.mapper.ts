import { RefreshToken as PrismaRefreshToken } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { RefreshToken } from '../../domain/index';

export class RefreshTokenPersistenceMapper {
  static toDomain(prisma: PrismaRefreshToken): RefreshToken {
    return RefreshToken.rehydrate({
      id: Identifier.create(prisma.id),
      principalId: Identifier.create(prisma.principalId),
      token: prisma.tokenHash ?? '',
      expiresAt: prisma.expiresAt ?? new Date(),
      revoked: prisma.revokedAt !== null,
      createdAt: prisma.createdAt ?? new Date(),
    });
  }

  static toPersistence(token: RefreshToken) {
    return {
      principalId: token.principalId.getValue(),
      tokenHash: token.token,
      revokedAt: token.revoked ? new Date() : null,
      expiresAt: token.expiresAt,
    };
  }
}
