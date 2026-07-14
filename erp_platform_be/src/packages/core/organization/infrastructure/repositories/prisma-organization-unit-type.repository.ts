import { OrganizationUnitType, OrganizationUnitTypeRepository } from '@core/organization/domain';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { OrganizationUnitTypePersistenceMapper } from '../mappers/organization-unit-type.persistence.mapper';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

@Injectable()
export class PrismaOrganizationUnitTypeRepository implements OrganizationUnitTypeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(type: OrganizationUnitType): Promise<void> {
    await this.prisma.organizationUnitType.create({
      data: {
        id: type.id.getValue(),
        ...OrganizationUnitTypePersistenceMapper.toPersistence(type),
      },
    });
  }

  async update(type: OrganizationUnitType): Promise<void> {
    await this.prisma.organizationUnitType.update({
      where: { id: type.id.getValue() },
      data: OrganizationUnitTypePersistenceMapper.toPersistence(type),
    });
  }

  async delete(type: OrganizationUnitType): Promise<void> {
    await this.prisma.organizationUnitType.delete({
      where: { id: type.id.getValue() },
    });
  }

  async findById(id: Identifier): Promise<OrganizationUnitType | null> {
    const entity = await this.prisma.organizationUnitType.findUnique({
      where: { id: id.getValue() },
    });
    return entity ? OrganizationUnitTypePersistenceMapper.toDomain(entity) : null;
  }

  async findByCode(code: string): Promise<OrganizationUnitType | null> {
    const entity = await this.prisma.organizationUnitType.findUnique({
      where: { code },
    });
    return entity ? OrganizationUnitTypePersistenceMapper.toDomain(entity) : null;
  }

  async existsByCode(code: string): Promise<boolean> {
    const count = await this.prisma.organizationUnitType.count({
      where: { code },
    });
    return count > 0;
  }

  async findAll(): Promise<OrganizationUnitType[]> {
    const entities = await this.prisma.organizationUnitType.findMany({
      orderBy: { name: 'asc' },
    });
    return entities.map(OrganizationUnitTypePersistenceMapper.toDomain);
  }
}
