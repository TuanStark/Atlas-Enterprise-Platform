import { Injectable } from '@nestjs/common';
import { PermissionPersistenceMapper } from './permission.persistence.mapper';
import { Permission, PermissionCode, PermissionRepository } from '../domain';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

@Injectable()
export class PrismaPermissionRepository implements PermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private async resolveResourceAndAction(codeStr: string) {
    const [resourceCode, actionCode] = codeStr.split(':');

    const resource = await this.prisma.resource.upsert({
      where: { code: resourceCode },
      update: {},
      create: {
        id: Identifier.create().getValue(),
        code: resourceCode,
        name: this.capitalize(resourceCode),
      },
    });

    const action = await this.prisma.action.upsert({
      where: { code: actionCode },
      update: {},
      create: {
        id: Identifier.create().getValue(),
        code: actionCode,
        name: this.capitalize(actionCode),
      },
    });

    return { resourceId: resource.id, actionId: action.id };
  }

  async save(permission: Permission): Promise<void> {
    const { resourceId, actionId } = await this.resolveResourceAndAction(permission.code.value);

    await this.prisma.permission.create({
      data: {
        id: permission.id.getValue(),
        code: permission.code.value,
        description: permission.description ?? null,
        resourceId,
        actionId,
      },
    });
  }

  async update(permission: Permission): Promise<void> {
    const { resourceId, actionId } = await this.resolveResourceAndAction(permission.code.value);

    await this.prisma.permission.update({
      where: {
        id: permission.id.getValue(),
      },
      data: {
        code: permission.code.value,
        description: permission.description ?? null,
        resourceId,
        actionId,
      },
    });
  }

  async delete(permission: Permission): Promise<void> {
    await this.prisma.permission.delete({
      where: {
        id: permission.id.getValue(),
      },
    });
  }

  async findById(id: Identifier): Promise<Permission | null> {
    const entity = await this.prisma.permission.findUnique({
      where: {
        id: id.getValue(),
      },
      include: {
        resource: true,
        action: true,
      },
    });

    return entity ? PermissionPersistenceMapper.toDomain(entity) : null;
  }

  async findByCode(code: PermissionCode): Promise<Permission | null> {
    const entity = await this.prisma.permission.findUnique({
      where: {
        code: code.value,
      },
      include: {
        resource: true,
        action: true,
      },
    });

    return entity ? PermissionPersistenceMapper.toDomain(entity) : null;
  }

  async existsByCode(code: PermissionCode): Promise<boolean> {
    const count = await this.prisma.permission.count({
      where: {
        code: code.value,
      },
    });

    return count > 0;
  }

  async findAll(): Promise<Permission[]> {
    const entities = await this.prisma.permission.findMany({
      orderBy: {
        code: 'asc',
      },
      include: {
        resource: true,
        action: true,
      },
    });

    return entities.map((entity) => PermissionPersistenceMapper.toDomain(entity));
  }
}
