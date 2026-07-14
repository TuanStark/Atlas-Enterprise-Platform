import { OrganizationAssignment } from '@core/organization/domain/entities/organization-assignment';
import { OrganizationAssignmentDto } from '@core/organization/dto';
import { AssignmentStatus } from '@prisma/client';

export class OrganizationAssignmentResponseMapper {
  static toResponse(domain: OrganizationAssignment): OrganizationAssignmentDto {
    return {
      id: domain.id.getValue(),
      tenantId: domain.tenantId.getValue(),
      employmentId: domain.employmentId.getValue(),
      departmentId: domain.departmentId.getValue(),
      positionId: domain.positionId.getValue(),
      jobTitleId: domain.jobTitleId?.getValue() ?? undefined,
      managerEmploymentId: domain.managerEmploymentId?.getValue() ?? undefined,
      workLocationId: domain.workLocationId?.getValue() ?? undefined,
      costCenterId: domain.costCenterId?.getValue() ?? undefined,
      effectiveFrom: domain.effectiveFrom,
      effectiveTo: domain.effectiveTo ?? undefined,
      isPrimary: domain.isPrimary ?? true,
      status: domain.status ?? AssignmentStatus.active,
      createdAt: domain.createdAt ?? new Date(),
      updatedAt: domain.updatedAt ?? new Date(),
    };
  }
}
