import { OrganizationAssignment } from '@core/organization/domain';
import { OrganizationAssignment as PrismaOrganizationAssignment } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class OrganizationAssignmentPersistenceMapper {
  static toDomain(entity: PrismaOrganizationAssignment): OrganizationAssignment {
    return OrganizationAssignment.rehydrate(Identifier.create(entity.id), {
      tenantId: Identifier.create(entity.tenantId),
      employmentId: Identifier.create(entity.employmentId),
      departmentId: Identifier.create(entity.departmentId),
      positionId: Identifier.create(entity.positionId),
      jobTitleId: entity.jobTitleId ? Identifier.create(entity.jobTitleId) : undefined,
      managerEmploymentId: entity.managerEmploymentId
        ? Identifier.create(entity.managerEmploymentId)
        : undefined,
      workLocationId: entity.workLocationId ? Identifier.create(entity.workLocationId) : undefined,
      costCenterId: entity.costCenterId ? Identifier.create(entity.costCenterId) : undefined,
      effectiveFrom: entity.effectiveFrom,
      effectiveTo: entity.effectiveTo ?? undefined,
      isPrimary: entity.isPrimary ?? true,
      status: entity.status ?? undefined,
      createdAt: entity.createdAt ?? undefined,
      updatedAt: entity.updatedAt ?? undefined,
    });
  }

  static toPersistence(domain: OrganizationAssignment) {
    return {
      tenantId: domain.tenantId.getValue(),
      employmentId: domain.employmentId.getValue(),
      departmentId: domain.departmentId.getValue(),
      positionId: domain.positionId.getValue(),
      jobTitleId: domain.jobTitleId ? domain.jobTitleId.getValue() : null,
      managerEmploymentId: domain.managerEmploymentId
        ? domain.managerEmploymentId.getValue()
        : null,
      workLocationId: domain.workLocationId ? domain.workLocationId.getValue() : null,
      costCenterId: domain.costCenterId ? domain.costCenterId.getValue() : null,
      effectiveFrom: domain.effectiveFrom,
      effectiveTo: domain.effectiveTo ?? null,
      isPrimary: domain.isPrimary,
      status: domain.status ?? null,
    };
  }
}
