import { OrganizationUnit, OrganizationUnitRepository } from '@core/organization/domain';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { OrganizationUnitPersistenceMapper } from '../mappers/organization-unit.persistence.mapper';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

@Injectable()
export class PrismaOrganizationUnitRepository implements OrganizationUnitRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(unit: OrganizationUnit): Promise<void> {
    await this.prisma.organizationUnit.create({
      data: {
        id: unit.id.getValue(),
        ...OrganizationUnitPersistenceMapper.toPersistence(unit),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async update(unit: OrganizationUnit): Promise<void> {
    await this.prisma.organizationUnit.update({
      where: { id: unit.id.getValue() },
      data: {
        ...OrganizationUnitPersistenceMapper.toPersistence(unit),
        updatedAt: new Date(),
      },
    });
  }

  async delete(unit: OrganizationUnit): Promise<void> {
    // Soft delete by setting deletedAt
    await this.prisma.organizationUnit.update({
      where: { id: unit.id.getValue() },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findById(organizationId: Identifier, id: Identifier): Promise<OrganizationUnit | null> {
    const entity = await this.prisma.organizationUnit.findFirst({
      where: {
        id: id.getValue(),
        organizationId: organizationId.getValue(),
        deletedAt: null,
      },
    });
    return entity ? OrganizationUnitPersistenceMapper.toDomain(entity) : null;
  }

  async findByCode(organizationId: Identifier, code: string): Promise<OrganizationUnit | null> {
    const entity = await this.prisma.organizationUnit.findFirst({
      where: {
        organizationId: organizationId.getValue(),
        code,
        deletedAt: null,
      },
    });
    return entity ? OrganizationUnitPersistenceMapper.toDomain(entity) : null;
  }

  async existsByCode(organizationId: Identifier, code: string): Promise<boolean> {
    const count = await this.prisma.organizationUnit.count({
      where: {
        organizationId: organizationId.getValue(),
        code,
        deletedAt: null,
      },
    });
    return count > 0;
  }

  async findAll(organizationId: Identifier): Promise<OrganizationUnit[]> {
    const entities = await this.prisma.organizationUnit.findMany({
      where: {
        organizationId: organizationId.getValue(),
        deletedAt: null,
      },
      orderBy: { sortOrder: 'asc' },
    });
    return entities.map(OrganizationUnitPersistenceMapper.toDomain);
  }

  async findRootUnits(organizationId: Identifier): Promise<OrganizationUnit[]> {
    const entities = await this.prisma.organizationUnit.findMany({
      where: {
        organizationId: organizationId.getValue(),
        parentUnitId: null,
        deletedAt: null,
      },
      orderBy: { sortOrder: 'asc' },
    });
    return entities.map(OrganizationUnitPersistenceMapper.toDomain);
  }

  async findChildren(
    organizationId: Identifier,
    parentUnitId: Identifier,
  ): Promise<OrganizationUnit[]> {
    const entities = await this.prisma.organizationUnit.findMany({
      where: {
        organizationId: organizationId.getValue(),
        parentUnitId: parentUnitId.getValue(),
        deletedAt: null,
      },
      orderBy: { sortOrder: 'asc' },
    });
    return entities.map(OrganizationUnitPersistenceMapper.toDomain);
  }

  async findParent(
    organizationId: Identifier,
    unitId: Identifier,
  ): Promise<OrganizationUnit | null> {
    const unit = await this.prisma.organizationUnit.findFirst({
      where: {
        id: unitId.getValue(),
        organizationId: organizationId.getValue(),
        deletedAt: null,
      },
    });

    if (!unit || !unit.parentUnitId) {
      return null;
    }

    const parent = await this.prisma.organizationUnit.findFirst({
      where: {
        id: unit.parentUnitId,
        organizationId: organizationId.getValue(),
        deletedAt: null,
      },
    });

    return parent ? OrganizationUnitPersistenceMapper.toDomain(parent) : null;
  }

  async findDescendants(
    organizationId: Identifier,
    unitId: Identifier,
  ): Promise<OrganizationUnit[]> {
    const unit = await this.prisma.organizationUnit.findFirst({
      where: {
        id: unitId.getValue(),
        organizationId: organizationId.getValue(),
        deletedAt: null,
      },
    });

    if (!unit || !unit.path) {
      return [];
    }

    const entities = await this.prisma.organizationUnit.findMany({
      where: {
        organizationId: organizationId.getValue(),
        path: {
          startsWith: `${unit.path}/`,
        },
        id: {
          not: unitId.getValue(),
        },
        deletedAt: null,
      },
      orderBy: { path: 'asc' },
    });

    return entities.map(OrganizationUnitPersistenceMapper.toDomain);
  }

  async existsChildWithName(
    organizationId: Identifier,
    parentUnitId: Identifier | null,
    name: string,
  ): Promise<boolean> {
    const count = await this.prisma.organizationUnit.count({
      where: {
        organizationId: organizationId.getValue(),
        parentUnitId: parentUnitId ? parentUnitId.getValue() : null,
        name: {
          equals: name,
          mode: 'insensitive',
        },
        deletedAt: null,
      },
    });
    return count > 0;
  }
}
