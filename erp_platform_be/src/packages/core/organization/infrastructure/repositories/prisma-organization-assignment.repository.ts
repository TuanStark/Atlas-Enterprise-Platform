import {
  OrganizationAssignment,
  OrganizationAssignmentRepository,
} from '@core/organization/domain';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { OrganizationAssignmentPersistenceMapper } from '../mappers/organization-assignment.persistence.mapper';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

@Injectable()
export class PrismaOrganizationAssignmentRepository implements OrganizationAssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(assignment: OrganizationAssignment): Promise<void> {
    await this.prisma.organizationAssignment.create({
      data: {
        id: assignment.id.getValue(),
        ...OrganizationAssignmentPersistenceMapper.toPersistence(assignment),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(assignment: OrganizationAssignment): Promise<void> {
    await this.prisma.organizationAssignment.update({
      where: { id: assignment.id.getValue() },
      data: {
        ...OrganizationAssignmentPersistenceMapper.toPersistence(assignment),
        updatedAt: new Date(),
      },
    });
  }

  async delete(assignment: OrganizationAssignment): Promise<void> {
    // Delete physically or soft-delete depending on requirement.
    // The schema does not have a deletedAt for organization_assignments, so we do physical delete.
    await this.prisma.organizationAssignment.delete({
      where: { id: assignment.id.getValue() },
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<OrganizationAssignment | null> {
    const entity = await this.prisma.organizationAssignment.findFirst({
      where: {
        id: id.getValue(),
        tenantId: tenantId.getValue(),
      },
    });
    return entity ? OrganizationAssignmentPersistenceMapper.toDomain(entity) : null;
  }

  async findByEmploymentId(
    tenantId: Identifier,
    employmentId: Identifier,
  ): Promise<OrganizationAssignment[]> {
    const entities = await this.prisma.organizationAssignment.findMany({
      where: {
        tenantId: tenantId.getValue(),
        employmentId: employmentId.getValue(),
      },
      orderBy: { effectiveFrom: 'desc' },
    });
    return entities.map(OrganizationAssignmentPersistenceMapper.toDomain);
  }

  async findAll(tenantId: Identifier): Promise<OrganizationAssignment[]> {
    const entities = await this.prisma.organizationAssignment.findMany({
      where: {
        tenantId: tenantId.getValue(),
      },
      orderBy: { effectiveFrom: 'desc' },
    });
    return entities.map(OrganizationAssignmentPersistenceMapper.toDomain);
  }
}
