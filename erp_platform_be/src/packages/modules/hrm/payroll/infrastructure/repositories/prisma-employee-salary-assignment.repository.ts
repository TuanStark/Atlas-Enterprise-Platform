import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { EmployeeSalaryAssignment } from '../../domain/aggregates/employee-salary-assignment.aggregate';
import { EmployeeSalaryAssignmentRepository } from '../../domain/repositories/employee-salary-assignment.repository';
import { EmployeeSalaryAssignmentPersistenceMapper } from '../mappers/employee-salary-assignment.persistence.mapper';

@Injectable()
export class PrismaEmployeeSalaryAssignmentRepository implements EmployeeSalaryAssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: EmployeeSalaryAssignment): Promise<void> {
    const data = EmployeeSalaryAssignmentPersistenceMapper.toPersistence(entity);
    await this.prisma.employeeSalaryAssignment.create({ data });
  }

  async update(entity: EmployeeSalaryAssignment): Promise<void> {
    const data = EmployeeSalaryAssignmentPersistenceMapper.toPersistence(entity);
    await this.prisma.employeeSalaryAssignment.update({
      where: { id: data.id },
      data: {
        employmentId: data.employmentId,
        salaryStructureId: data.salaryStructureId,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo,
        baseSalary: data.baseSalary,
        currency: data.currency,
        updatedAt: data.updatedAt,
      },
    });
  }

  async delete(entity: EmployeeSalaryAssignment): Promise<void> {
    await this.prisma.employeeSalaryAssignment.delete({
      where: { id: entity.id.toString() },
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<EmployeeSalaryAssignment | null> {
    const record = await this.prisma.employeeSalaryAssignment.findFirst({
      where: { id: id.toString(), tenantId: tenantId.toString() },
    });
    return record ? EmployeeSalaryAssignmentPersistenceMapper.toDomain(record) : null;
  }

  async findByEmploymentId(
    tenantId: Identifier,
    employmentId: Identifier,
  ): Promise<EmployeeSalaryAssignment[]> {
    const records = await this.prisma.employeeSalaryAssignment.findMany({
      where: { tenantId: tenantId.toString(), employmentId: employmentId.toString() },
      orderBy: { effectiveFrom: 'desc' },
    });
    return records.map(EmployeeSalaryAssignmentPersistenceMapper.toDomain);
  }

  async findAll(tenantId: Identifier): Promise<EmployeeSalaryAssignment[]> {
    const records = await this.prisma.employeeSalaryAssignment.findMany({
      where: { tenantId: tenantId.toString() },
      orderBy: { createdAt: 'desc' },
    });
    return records.map(EmployeeSalaryAssignmentPersistenceMapper.toDomain);
  }
}
