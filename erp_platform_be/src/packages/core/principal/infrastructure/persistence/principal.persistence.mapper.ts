import {
  Principal as PrismaPrincipal,
  PrincipalType as PrismaPrincipalType,
  PrincipalStatus as PrismaPrincipalStatus,
} from '@prisma/client';
import { Principal, PrincipalStatus, PrincipalType } from '../../domain';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class PrincipalPersistenceMapper {
  static toDomain(prisma: PrismaPrincipal): Principal {
    let domainType = PrincipalType.USER;
    if (prisma.type === 'service_account') {
      domainType = PrincipalType.SERVICE_ACCOUNT;
    }

    let domainStatus = PrincipalStatus.INACTIVE;
    if (prisma.status === 'active') {
      domainStatus = PrincipalStatus.ACTIVE;
    } else if (prisma.status === 'locked') {
      domainStatus = PrincipalStatus.LOCKED;
    }

    return Principal.rehydrate(Identifier.create(prisma.id), {
      tenantId: Identifier.create(prisma.tenantId),
      type: domainType,
      status: domainStatus,
      displayName: prisma.displayName ?? undefined,
      metadata: (prisma.metadata as Record<string, unknown>) ?? undefined,
      createdAt: prisma.createdAt ?? new Date(),
      updatedAt: prisma.updatedAt ?? new Date(),
      deletedAt: prisma.deletedAt ?? undefined,
      version: prisma.version ?? 1,
    });
  }

  static toPersistence(principal: Principal) {
    let prismaType: PrismaPrincipalType = 'user';
    if (principal.type === PrincipalType.SERVICE_ACCOUNT) {
      prismaType = 'service_account';
    }

    let prismaStatus: PrismaPrincipalStatus = 'inactive';
    if (principal.status === PrincipalStatus.ACTIVE) {
      prismaStatus = 'active';
    } else if (principal.status === PrincipalStatus.LOCKED) {
      prismaStatus = 'locked';
    }

    return {
      tenantId: principal.tenantId.getValue(),
      type: prismaType,
      status: prismaStatus,
      displayName: principal.displayName,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      metadata: principal.metadata as any,
      updatedAt: principal.updatedAt,
      deletedAt: principal.deletedAt,
      version: principal.version,
    };
  }

  static toPersistenceStatus(status: PrincipalStatus): PrismaPrincipalStatus {
    let prismaStatus: PrismaPrincipalStatus = 'inactive';
    if (status === PrincipalStatus.ACTIVE) {
      prismaStatus = 'active';
    } else if (status === PrincipalStatus.LOCKED) {
      prismaStatus = 'locked';
    }
    return prismaStatus;
  }
}
