import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { RefreshToken, RefreshTokenRepository } from '../../domain/index';
import { RefreshTokenPersistenceMapper } from './refresh-token.persistence.mapper';

@Injectable()
export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(token: RefreshToken): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        id: token.id.getValue(),
        ...RefreshTokenPersistenceMapper.toPersistence(token),
        createdAt: token.createdAt,
      },
    });
  }

  async update(token: RefreshToken): Promise<void> {
    await this.prisma.refreshToken.update({
      where: {
        id: token.id.getValue(),
      },
      data: RefreshTokenPersistenceMapper.toPersistence(token),
    });
  }

  async revoke(token: RefreshToken): Promise<void> {
    token.revoke();
    await this.update(token);
  }

  async findByToken(value: string): Promise<RefreshToken | null> {
    const entity = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash: value,
      },
    });

    return entity ? RefreshTokenPersistenceMapper.toDomain(entity) : null;
  }

  async findByPrincipal(principalId: Identifier): Promise<RefreshToken[]> {
    const entities = await this.prisma.refreshToken.findMany({
      where: {
        principalId: principalId.getValue(),
      },
    });

    return entities.map((entity) => RefreshTokenPersistenceMapper.toDomain(entity));
  }

  async deleteExpired(): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
