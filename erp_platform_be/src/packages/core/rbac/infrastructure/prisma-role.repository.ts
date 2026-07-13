import { Injectable } from '@nestjs/common';
import { Role, RoleCode, RoleRepository } from '../domain';
import { PrismaService } from 'src/database/prisma.service';
import { RolePersistenceMapper } from './role.persistence.mapper';
import { RolePermissionPersistenceMapper } from './role-permission.persistence.mapper';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

@Injectable()
export class PrismaRoleRepository implements RoleRepository {
  constructor(private readonly prisma: PrismaService) { }

  async save(role: Role): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.role.create({
        data: {
          id: role.id.getValue(),
          ...RolePersistenceMapper.toPersistence(role),
          createdAt: role.createdAt,
        },
      });

      if (role.permissions.length) {
        await tx.rolePermission.createMany({
          data: role.permissions.map((permission) =>
            RolePermissionPersistenceMapper.toPersistence(role.id, permission),
          ),
        });
      }
    });
  }

  async update(role: Role): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.role.update({
        where: {
          id: role.id.getValue(),
        },
        data: RolePersistenceMapper.toPersistence(role),
      });
      await tx.rolePermission.deleteMany({
        where: {
          roleId: role.id.getValue(),
        },
      });

      if (role.permissions.length) {
        await tx.rolePermission.createMany({
          data: role.permissions.map((permission) =>
            RolePermissionPersistenceMapper.toPersistence(role.id, permission),
          ),
        });
      }
    });
  }

  async delete(role: Role): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({
        where: {
          roleId: role.id.getValue(),
        },
      });
      await tx.role.delete({
        where: {
          id: role.id.getValue(),
        },
      });
    });
  }

  async findById(id: Identifier): Promise<Role | null> {
    const entity = await this.prisma.role.findUnique({
      where: {
        id: id.getValue(),
      },
      include: {
        rolePermissions: true,
      },
    });

    if (!entity) {
      return null;
    }

    return RolePersistenceMapper.toDomain(entity);
  }

  async findByCode(code: RoleCode): Promise<Role | null> {
    const entity = await this.prisma.role.findFirst({
      where: {
        code: code.value,
      },
      include: {
        rolePermissions: true,
      },
    });

    return entity ? RolePersistenceMapper.toDomain(entity) : null;
  }

  async existsByCode(tenantId: Identifier, code: RoleCode): Promise<boolean> {
    const count = await this.prisma.role.count({
      where: {
        tenantId: tenantId.getValue(),
        code: code.value,
      },
    });
    return count > 0;
  }

  async findByTenantId(tenantId: Identifier): Promise<Role[]> {
    const entities = await this.prisma.role.findMany({
      where: {
        tenantId: tenantId.getValue(),
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        rolePermissions: true,
      },
    });
    return entities.map((entity) => RolePersistenceMapper.toDomain(entity));
  }

  async findAll(): Promise<Role[]> {
    const entities = await this.prisma.role.findMany({
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        rolePermissions: true,
      },
    });

    return entities.map((entity) => RolePersistenceMapper.toDomain(entity));
  }
}
