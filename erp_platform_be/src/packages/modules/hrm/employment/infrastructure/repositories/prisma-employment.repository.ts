import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Employment } from '../../domain/aggregates/employment.aggregate';
import { EmploymentRepository } from '../../domain/repositories/employment.repository';
import { EmploymentPersistenceMapper } from '../mappers/employment.persistence.mapper';

@Injectable()
export class PrismaEmploymentRepository implements EmploymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    employmentContracts: true,
    employmentStatusHistories: true,
  };

  async save(entity: Employment): Promise<void> {
    const data = EmploymentPersistenceMapper.toPersistence(entity);

    await this.prisma.employment.create({
      data: {
        ...data,
        employmentContracts: {
          create: entity.contracts.map((c) => ({
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
        },
        employmentStatusHistories: {
          create: entity.statusHistory.map((h) => ({
            id: h.id.toString(),
            fromStatus: h.fromStatus,
            toStatus: h.toStatus,
            effectiveDate: h.effectiveDate,
            reason: h.reason,
            changedByPrincipalId: h.changedByPrincipalId,
            createdAt: h.createdAt,
          })),
        },
      },
    });
  }

  async update(entity: Employment): Promise<void> {
    const data = EmploymentPersistenceMapper.toPersistence(entity);

    await this.prisma.$transaction(async (tx) => {
      // Update main entity
      await tx.employment.update({
        where: { id: data.id },
        data: {
          employmentTypeId: data.employmentTypeId,
          employeeCode: data.employeeCode,
          hireDate: data.hireDate,
          probationStartDate: data.probationStartDate,
          probationEndDate: data.probationEndDate,
          confirmationDate: data.confirmationDate,
          terminationDate: data.terminationDate,
          status: data.status,
          reason: data.reason,
          metadata: data.metadata,
          updatedAt: data.updatedAt,
          deletedAt: data.deletedAt,
        },
      });

      // Sync contracts: delete and re-create
      await tx.employmentContract.deleteMany({ where: { employmentId: data.id } });
      if (entity.contracts.length > 0) {
        await tx.employmentContract.createMany({
          data: entity.contracts.map((c) => ({
            id: c.id.toString(),
            employmentId: data.id,
            contractTypeId: c.contractTypeId.toString(),
            contractNumber: c.contractNumber,
            startDate: c.startDate,
            endDate: c.endDate ?? null,
            signedDate: c.signedDate ?? null,
            fileId: c.fileId ?? null,
            isCurrent: c.isCurrent,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
          })),
        });
      }

      // Sync status history
      await tx.employmentStatusHistory.deleteMany({ where: { employmentId: data.id } });
      if (entity.statusHistory.length > 0) {
        await tx.employmentStatusHistory.createMany({
          data: entity.statusHistory.map((h) => ({
            id: h.id.toString(),
            employmentId: data.id,
            fromStatus: h.fromStatus ?? null,
            toStatus: h.toStatus ?? null,
            effectiveDate: h.effectiveDate,
            reason: h.reason ?? null,
            changedByPrincipalId: h.changedByPrincipalId ?? null,
            createdAt: h.createdAt,
          })),
        });
      }
    });
  }

  async delete(entity: Employment): Promise<void> {
    await this.prisma.employment.update({
      where: { id: entity.id.toString() },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<Employment | null> {
    const record = await this.prisma.employment.findFirst({
      where: {
        id: id.toString(),
        tenantId: tenantId.toString(),
        deletedAt: null,
      },
      include: this.includeRelations,
    });
    return record ? EmploymentPersistenceMapper.toDomain(record) : null;
  }

  async findByEmployeeId(tenantId: Identifier, employeeId: Identifier): Promise<Employment[]> {
    const records = await this.prisma.employment.findMany({
      where: {
        employeeId: employeeId.toString(),
        tenantId: tenantId.toString(),
        deletedAt: null,
      },
      include: this.includeRelations,
      orderBy: { hireDate: 'desc' },
    });
    return records.map(EmploymentPersistenceMapper.toDomain);
  }

  async findByEmployeeCode(tenantId: Identifier, employeeCode: string): Promise<Employment | null> {
    const record = await this.prisma.employment.findFirst({
      where: {
        tenantId: tenantId.toString(),
        employeeCode,
        deletedAt: null,
      },
      include: this.includeRelations,
    });
    return record ? EmploymentPersistenceMapper.toDomain(record) : null;
  }

  async existsByEmployeeCode(tenantId: Identifier, employeeCode: string): Promise<boolean> {
    const count = await this.prisma.employment.count({
      where: {
        tenantId: tenantId.toString(),
        employeeCode,
        deletedAt: null,
      },
    });
    return count > 0;
  }

  async findAll(tenantId: Identifier): Promise<Employment[]> {
    const records = await this.prisma.employment.findMany({
      where: {
        tenantId: tenantId.toString(),
        deletedAt: null,
      },
      include: this.includeRelations,
      orderBy: { hireDate: 'desc' },
    });
    return records.map(EmploymentPersistenceMapper.toDomain);
  }
}
