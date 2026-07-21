import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { RoleHierarchyRepository } from '../domain/repositories/role-hierarchy.repository';

@Injectable()
export class PrismaRoleHierarchyRepository implements RoleHierarchyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async hasHierarchyRelation(
    parentRoleIds: Identifier[],
    childRoleIds: Identifier[],
  ): Promise<boolean> {
    if (!parentRoleIds.length || !childRoleIds.length) {
      return false;
    }

    const count = await this.prisma.roleHierarchy.count({
      where: {
        parentRoleId: { in: parentRoleIds.map((id) => id.getValue()) },
        childRoleId: { in: childRoleIds.map((id) => id.getValue()) },
      },
    });

    return count > 0;
  }

  async findDescendantRoleIds(parentRoleIds: Identifier[]): Promise<Identifier[]> {
    if (!parentRoleIds.length) {
      return [];
    }

    const list = await this.prisma.roleHierarchy.findMany({
      where: {
        parentRoleId: { in: parentRoleIds.map((id) => id.getValue()) },
      },
      select: { childRoleId: true },
    });

    const uniqueChildIds = [...new Set(list.map((item) => item.childRoleId))];
    return uniqueChildIds.map((id) => Identifier.create(id));
  }
}
