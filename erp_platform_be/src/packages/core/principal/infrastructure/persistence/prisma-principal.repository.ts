import { Injectable } from '@nestjs/common';

import { Principal, PrincipalRepository, PrincipalStatus } from '../../domain';

import { PrincipalPersistenceMapper } from './principal.persistence.mapper';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PrismaRepositoryBase } from '@shared-kernel/infrastructure/prisma/prisma-repository.base';
import { Principal as PrismaPrincipal } from '@prisma/client';

@Injectable()
export class PrismaPrincipalRepository
  extends PrismaRepositoryBase<Principal, PrismaPrincipal>
  implements PrincipalRepository
{
  protected mapper = PrincipalPersistenceMapper;

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async save(principal: Principal): Promise<void> {
    await this.prisma.principal.create({
      data: {
        id: principal.id.getValue(),

        ...PrincipalPersistenceMapper.toPersistence(principal),

        createdAt: principal.createdAt,
      },
    });
  }

  async update(principal: Principal): Promise<void> {
    await this.prisma.principal.update({
      where: {
        id: principal.id.getValue(),
      },
      data: PrincipalPersistenceMapper.toPersistence(principal),
    });
  }

  async delete(principal: Principal): Promise<void> {
    await this.prisma.principal.update({
      where: {
        id: principal.id.getValue(),
      },
      data: {
        deletedAt: principal.deletedAt,
        updatedAt: principal.updatedAt,
        version: principal.version,
      },
    });
  }

  async findById(id: Identifier): Promise<Principal | null> {
    const entity = await this.prisma.principal.findUnique({
      where: {
        id: id.getValue(),
      },
    });

    if (!entity) {
      return null;
    }

    return PrincipalPersistenceMapper.toDomain(entity);
  }

  async findAll(): Promise<Principal[]> {
    const list = await this.prisma.principal.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return list.map((x) => PrincipalPersistenceMapper.toDomain(x));
  }

  async exists(id: Identifier): Promise<boolean> {
    const count = await this.prisma.principal.count({
      where: {
        id: id.getValue(),
      },
    });

    return count > 0;
  }

  async findByTenant(tenantId: Identifier): Promise<Principal[]> {
    const list = await this.prisma.principal.findMany({
      where: {
        tenantId: tenantId.getValue(),
        deletedAt: null,
      },
    });

    return list.map((x) => PrincipalPersistenceMapper.toDomain(x));
  }

  async findByStatus(status: PrincipalStatus): Promise<Principal[]> {
    const list = await this.prisma.principal.findMany({
      where: {
        status: PrincipalPersistenceMapper.toPersistenceStatus(status),
        deletedAt: null,
      },
    });

    return list.map((x) => PrincipalPersistenceMapper.toDomain(x));
  }

  async findByIds(ids: Identifier[]): Promise<Principal[]> {
    const list = await this.prisma.principal.findMany({
      where: {
        id: {
          in: ids.map((x) => x.getValue()),
        },
      },
    });

    return list.map((x) => PrincipalPersistenceMapper.toDomain(x));
  }
}
