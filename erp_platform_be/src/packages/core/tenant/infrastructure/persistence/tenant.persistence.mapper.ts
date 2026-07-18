import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Tenant, TenantStatus } from '../../domain';
import { TenantCode, TenantName } from '../../domain/value-objects';
import { Tenant as PrismaTenant, TenantStatus as PrismaTenantStatus, Prisma } from '@prisma/client';

export class TenantPersistenceMapper {
  static toDomain(model: PrismaTenant): Tenant {
    let domainStatus = TenantStatus.ACTIVE;
    if (model.status === 'inactive' || model.status === 'suspended') {
      domainStatus = TenantStatus.INACTIVE;
    }

    return Tenant.restore({
      id: Identifier.create(model.id),
      code: TenantCode.create(model.code),
      name: TenantName.create(model.name),
      legalName: model.legalName ?? undefined,
      taxCode: model.taxCode ?? undefined,
      email: model.email ?? undefined,
      phone: model.phone ?? undefined,
      logoFileId: model.logoFileId ? Identifier.create(model.logoFileId) : null,
      timezone: model.timezone ?? undefined,
      locale: model.locale ?? undefined,
      currency: model.currency ?? undefined,
      status: domainStatus,
      metadata: (model.metadata as Record<string, unknown>) ?? undefined,
      version: model.version ?? 1,
      createdAt: model.createdAt!,
      updatedAt: model.updatedAt ?? undefined,
      deletedAt: model.deletedAt ?? undefined,
    });
  }

  static toPersistence(entity: Tenant): Prisma.TenantUncheckedCreateInput {
    let prismaStatus: PrismaTenantStatus | null = null;
    if (entity.status === TenantStatus.ACTIVE) {
      prismaStatus = 'active';
    } else if (entity.status === TenantStatus.INACTIVE) {
      prismaStatus = 'inactive';
    }

    return {
      id: entity.id.getValue(),
      code: entity.code.getValue(),
      name: entity.name.getValue(),
      legalName: entity.legalName,
      taxCode: entity.taxCode,
      email: entity.email,
      phone: entity.phone,
      logoFileId: entity.logoFileId === null ? null : (entity.logoFileId ? entity.logoFileId.getValue() : undefined),
      timezone: entity.timezone,
      locale: entity.locale,
      currency: entity.currency,
      status: prismaStatus,
      metadata: entity.metadata as Prisma.InputJsonValue,
      version: entity.version,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }
}
