import { Injectable } from '@nestjs/common';
import { Email, User, UserRepository, UserStatus } from '../../domain/index';

import { UserPersistenceMapper } from './user.persistence.mapper';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    include: {
      principal: {
        include: {
          employee: true,
        },
      },
    },
  };

  async save(user: User): Promise<void> {
    await this.prisma.principal.create({
      data: {
        id: user.principalId.getValue(),
        tenantId: user.tenantId.getValue(),
        type: 'user',
        status:
          user.status === UserStatus.ACTIVE
            ? 'active'
            : user.status === UserStatus.LOCKED
              ? 'locked'
              : 'inactive',
        displayName: user.displayName,
        version: user.version,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        user: {
          create: {
            id: user.id.getValue(),
            tenantId: user.tenantId.getValue(),
            username: user.email.value,
            email: user.email.value,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
        employee: {
          create: {
            tenantId: user.tenantId.getValue(),
            employeeNo: `EMP-${user.email.value.split('@')[0]}`,
            firstName: user.firstName,
            lastName: user.lastName,
            preferredName: user.displayName,
            status: 'active',
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
        },
      },
    });
  }

  async update(user: User): Promise<void> {
    // Update User
    await this.prisma.user.update({
      where: {
        id: user.id.getValue(),
      },
      data: UserPersistenceMapper.toPersistence(user),
    });

    // Update Principal
    await this.prisma.principal.update({
      where: {
        id: user.principalId.getValue(),
      },
      data: {
        status:
          user.status === UserStatus.ACTIVE
            ? 'active'
            : user.status === UserStatus.LOCKED
              ? 'locked'
              : 'inactive',
        displayName: user.displayName,
        version: user.version,
        updatedAt: user.updatedAt,
      },
    });

    // Update Employee
    await this.prisma.employee.updateMany({
      where: {
        principalId: user.principalId.getValue(),
      },
      data: {
        firstName: user.firstName,
        lastName: user.lastName,
        preferredName: user.displayName,
        updatedAt: user.updatedAt,
      },
    });
  }

  async delete(user: User): Promise<void> {
    // Soft delete User by updating principal's deletedAt field
    await this.prisma.principal.update({
      where: {
        id: user.principalId.getValue(),
      },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findById(id: Identifier): Promise<User | null> {
    const entity = await this.prisma.user.findUnique({
      where: {
        id: id.getValue(),
      },
      ...this.includeRelations,
    });

    return entity ? UserPersistenceMapper.toDomain(entity) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const entity = await this.prisma.user.findFirst({
      where: {
        email: email.value,
      },
      ...this.includeRelations,
    });

    return entity ? UserPersistenceMapper.toDomain(entity) : null;
  }

  async findByPrincipalId(principalId: Identifier): Promise<User | null> {
    const entity = await this.prisma.user.findUnique({
      where: {
        principalId: principalId.getValue(),
      },
      ...this.includeRelations,
    });

    return entity ? UserPersistenceMapper.toDomain(entity) : null;
  }

  async findByTenant(tenantId: Identifier): Promise<User[]> {
    const entities = await this.prisma.user.findMany({
      where: {
        tenantId: tenantId.getValue(),
        principal: {
          deletedAt: null,
        },
      },
      ...this.includeRelations,
    });

    return entities.map((entity) => UserPersistenceMapper.toDomain(entity));
  }

  async findByStatus(status: UserStatus): Promise<User[]> {
    let prismaStatus: 'active' | 'inactive' | 'locked' = 'inactive';
    if (status === UserStatus.ACTIVE) {
      prismaStatus = 'active';
    } else if (status === UserStatus.LOCKED) {
      prismaStatus = 'locked';
    }

    const entities = await this.prisma.user.findMany({
      where: {
        principal: {
          status: prismaStatus,
          deletedAt: null,
        },
      },
      ...this.includeRelations,
    });

    return entities.map((entity) => UserPersistenceMapper.toDomain(entity));
  }

  async exists(id: Identifier): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: {
        id: id.getValue(),
      },
    });

    return count > 0;
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: {
        email: email.value,
      },
    });

    return count > 0;
  }

  async findAll(): Promise<User[]> {
    const entities = await this.prisma.user.findMany({
      where: {
        principal: {
          deletedAt: null,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...this.includeRelations,
    });

    return entities.map((entity) => UserPersistenceMapper.toDomain(entity));
  }
}
