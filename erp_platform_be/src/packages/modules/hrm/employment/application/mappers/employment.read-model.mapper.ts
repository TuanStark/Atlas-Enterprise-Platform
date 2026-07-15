import { Employment } from '../../domain/aggregates/employment.aggregate';
import { EmploymentReadModel } from '../read-models/employment.read-model';

export class EmploymentReadModelMapper {
  static toReadModel(entity: Employment): EmploymentReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      employeeId: entity.employeeId.toString(),
      employmentTypeId: entity.employmentTypeId.toString(),
      employeeCode: entity.employeeCode,
      hireDate: entity.hireDate,
      probationStartDate: entity.probationStartDate,
      probationEndDate: entity.probationEndDate,
      confirmationDate: entity.confirmationDate,
      terminationDate: entity.terminationDate,
      status: entity.status,
      reason: entity.reason,
      metadata: entity.metadata,
      contracts: entity.contracts.map((c) => ({
        id: c.id.toString(),
        contractTypeId: c.contractTypeId.toString(),
        contractNumber: c.contractNumber,
        startDate: c.startDate,
        endDate: c.endDate,
        signedDate: c.signedDate,
        fileId: c.fileId,
        isCurrent: c.isCurrent,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      statusHistory: entity.statusHistory.map((h) => ({
        id: h.id.toString(),
        fromStatus: h.fromStatus,
        toStatus: h.toStatus,
        effectiveDate: h.effectiveDate,
        reason: h.reason,
        changedByPrincipalId: h.changedByPrincipalId,
        createdAt: h.createdAt,
      })),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
