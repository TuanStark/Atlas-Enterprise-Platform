import {
  User as PrismaUser,
  Principal as PrismaPrincipal,
  Employee as PrismaEmployee,
} from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Email, User, UserStatus, UserType } from '../../domain/index';

export type PrismaUserPayload = PrismaUser & {
  principal: PrismaPrincipal & {
    employee?: PrismaEmployee | null;
  };
};

export class UserPersistenceMapper {
  static toDomain(prisma: PrismaUserPayload): User {
    let domainStatus = UserStatus.INACTIVE;
    if (prisma.principal.status === 'active') {
      domainStatus = UserStatus.ACTIVE;
    } else if (prisma.principal.status === 'locked') {
      domainStatus = UserStatus.LOCKED;
    }

    let domainType = UserType.INTERNAL;
    const metadata = prisma.principal.metadata as Record<string, unknown> | null;
    if (metadata && typeof metadata.userType === 'string') {
      if (Object.values(UserType).includes(metadata.userType as UserType)) {
        domainType = metadata.userType as UserType;
      }
    }

    return User.restore({
      id: Identifier.create(prisma.id),
      tenantId: Identifier.create(prisma.tenantId),
      principalId: Identifier.create(prisma.principalId),
      email: Email.create(prisma.email),
      firstName: prisma.principal.employee?.firstName ?? '',
      lastName: prisma.principal.employee?.lastName ?? '',
      displayName: prisma.principal.displayName ?? undefined,
      avatarUrl: prisma.principal.avatarFileId ?? undefined,
      status: domainStatus,
      type: domainType,
      createdAt: prisma.createdAt ?? new Date(),
      updatedAt: prisma.updatedAt ?? new Date(),
      deletedAt: prisma.principal.deletedAt ?? undefined,
      version: prisma.principal.version ?? 1,
    });
  }

  static toPersistence(user: User) {
    return {
      id: user.id.getValue(),
      tenantId: user.tenantId.getValue(),
      principalId: user.principalId.getValue(),
      username: user.email.value,
      email: user.email.value,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
