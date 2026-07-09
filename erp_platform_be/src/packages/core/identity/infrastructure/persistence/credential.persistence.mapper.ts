import {
  Credential as PrismaCredential,
  CredentialType as PrismaCredentialType,
} from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Credential, PasswordHash, CredentialType } from '../../domain/index';

export class CredentialPersistenceMapper {
  static toDomain(prisma: PrismaCredential): Credential {
    let domainType = CredentialType.PASSWORD;
    if (prisma.type === 'password') {
      domainType = CredentialType.PASSWORD;
    }

    return Credential.rehydrate({
      id: Identifier.create(prisma.id),
      principalId: Identifier.create(prisma.principalId),
      type: domainType,
      passwordHash: PasswordHash.create(prisma.passwordHash ?? ''),
      passwordChangedAt: prisma.passwordChangedAt ?? new Date(),
      expiresAt: prisma.passwordExpiresAt ?? undefined,
      createdAt: prisma.createdAt ?? new Date(),
      updatedAt: prisma.createdAt ?? new Date(),
      version: 1,
    });
  }

  static toPersistence(credential: Credential) {
    let prismaType: PrismaCredentialType = 'password';

    return {
      principalId: credential.principalId.getValue(),
      type: prismaType,
      passwordHash: credential.passwordHash.value,
      passwordChangedAt: credential.passwordChangedAt,
      passwordExpiresAt: credential.expiresAt,
    };
  }
}
