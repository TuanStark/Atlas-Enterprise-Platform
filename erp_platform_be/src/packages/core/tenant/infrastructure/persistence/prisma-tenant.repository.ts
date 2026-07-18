import { Injectable } from '@nestjs/common';
import { Tenant, TenantRepository } from '../../domain';
import { TenantCode } from '../../domain/value-objects';
import { TenantPersistenceMapper } from './tenant.persistence.mapper';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

@Injectable()
export class PrismaTenantRepository implements TenantRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findById(id: Identifier): Promise<Tenant | null> {
    const tenant = await this.prisma.tenant.findUnique({
      where: {
        id: id.getValue(),
      },
    });

    if (!tenant) {
      return null;
    }

    return TenantPersistenceMapper.toDomain(tenant);
  }

  async findByCode(code: TenantCode): Promise<Tenant | null> {
    const tenant = await this.prisma.tenant.findUnique({
      where: {
        code: code.getValue(),
      },
    });

    if (!tenant) {
      return null;
    }

    return TenantPersistenceMapper.toDomain(tenant);
  }

  async existsById(id: Identifier): Promise<boolean> {
    const count = await this.prisma.tenant.count({
      where: {
        id: id.getValue(),
      },
    });

    return count > 0;
  }

  async existsByCode(code: TenantCode): Promise<boolean> {
    const count = await this.prisma.tenant.count({
      where: {
        code: code.getValue(),
      },
    });

    return count > 0;
  }

  async save(tenant: Tenant): Promise<void> {
    const data = TenantPersistenceMapper.toPersistence(tenant);

    await this.prisma.tenant.upsert({
      where: {
        id: data.id,
      },
      create: data,
      update: data,
    });
  }

  async delete(tenant: Tenant): Promise<void> {
    await this.prisma.tenant.update({
      where: {
        id: tenant.id.getValue(),
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async findAll(): Promise<Tenant[]> {
    const tenants = await this.prisma.tenant.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return tenants.map((tenant) => TenantPersistenceMapper.toDomain(tenant));
  }
}
