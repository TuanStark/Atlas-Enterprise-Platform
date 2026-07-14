import { Organization, OrganizationCode, OrganizationRepository } from '@core/organization/domain';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { OrganizationPersistenceMapper } from '../mappers/organization.persistence.mapper';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

@Injectable()
export class PrismaOrganizationRepository implements OrganizationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(organization: Organization): Promise<void> {
    await this.prisma.organization.create({
      data: {
        id: organization.id.getValue(),

        ...OrganizationPersistenceMapper.toPersistence(organization),

        createdAt: organization.createdAt,

        updatedAt: organization.updatedAt,
      },
    });
  }

  async update(organization: Organization): Promise<void> {
    await this.prisma.organization.update({
      where: {
        id: organization.id.getValue(),
      },

      data: {
        ...OrganizationPersistenceMapper.toPersistence(organization),

        updatedAt: new Date(),
      },
    });
  }

  async delete(organization: Organization): Promise<void> {
    await this.prisma.organization.update({
      where: {
        id: organization.id.getValue(),
      },

      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<Organization | null> {
    const entity = await this.prisma.organization.findFirst({
      where: {
        id: id.getValue(),

        tenantId: tenantId.getValue(),
      },
    });

    if (!entity) {
      return null;
    }

    return OrganizationPersistenceMapper.toDomain(entity);
  }

  async findByCode(tenantId: Identifier, code: OrganizationCode): Promise<Organization | null> {
    const entity = await this.prisma.organization.findFirst({
      where: {
        tenantId: tenantId.getValue(),

        code: code.value,
      },
    });

    if (!entity) {
      return null;
    }

    return OrganizationPersistenceMapper.toDomain(entity);
  }

  async existsByCode(tenantId: Identifier, code: OrganizationCode): Promise<boolean> {
    const count = await this.prisma.organization.count({
      where: {
        tenantId: tenantId.getValue(),

        code: code.value,
      },
    });

    return count > 0;
  }

  async findAll(tenantId: Identifier): Promise<Organization[]> {
    const entities = await this.prisma.organization.findMany({
      where: {
        tenantId: tenantId.getValue(),
      },

      orderBy: {
        name: 'asc',
      },
    });

    return entities.map(OrganizationPersistenceMapper.toDomain);
  }
}
