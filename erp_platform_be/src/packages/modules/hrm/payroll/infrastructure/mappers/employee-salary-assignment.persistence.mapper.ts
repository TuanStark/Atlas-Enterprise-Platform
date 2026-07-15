import { EmployeeSalaryAssignment as PrismaSalaryAssignment, Prisma } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { EmployeeSalaryAssignment } from '../../domain/aggregates/employee-salary-assignment.aggregate';

export class EmployeeSalaryAssignmentPersistenceMapper {
  static toDomain(prisma: PrismaSalaryAssignment): EmployeeSalaryAssignment {
    return EmployeeSalaryAssignment.rehydrate(Identifier.create(prisma.id), {
      tenantId: Identifier.create(prisma.tenantId),
      employmentId: Identifier.create(prisma.employmentId),
      salaryStructureId: Identifier.create(prisma.salaryStructureId),
      effectiveFrom: prisma.effectiveFrom ?? undefined,
      effectiveTo: prisma.effectiveTo ?? undefined,
      baseSalary: prisma.baseSalary ? prisma.baseSalary.toNumber() : undefined,
      currency: prisma.currency ?? undefined,
      createdAt: prisma.createdAt ?? new Date(),
      updatedAt: prisma.updatedAt ?? new Date(),
    });
  }

  static toPersistence(entity: EmployeeSalaryAssignment): PrismaSalaryAssignment {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      employmentId: entity.employmentId.toString(),
      salaryStructureId: entity.salaryStructureId.toString(),
      effectiveFrom: entity.effectiveFrom ?? null,
      effectiveTo: entity.effectiveTo ?? null,
      baseSalary: entity.baseSalary !== undefined ? new Prisma.Decimal(entity.baseSalary) : null,
      currency: entity.currency ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
