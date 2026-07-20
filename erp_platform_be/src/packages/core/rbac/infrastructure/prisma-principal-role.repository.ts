import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { PrincipalRoleRepository, PrincipalRole } from '../domain';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PrincipalRolePersistenceMapper } from './principal-role.persistence.mapper';

@Injectable()
export class PrismaPrincipalRoleRepository implements PrincipalRoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByPrincipalId(principalId: Identifier): Promise<PrincipalRole[]> {
    const entities = await this.prisma.principalRole.findMany({
      where: {
        principalId: principalId.getValue(),
      },
      orderBy: {
        assignedAt: 'asc',
      },
    });
    return entities.map((e) => PrincipalRolePersistenceMapper.toDomain(e));
  }

  async findByRoleIds(roleIds: Identifier[]): Promise<PrincipalRole[]> {
    const entities = await this.prisma.principalRole.findMany({
      where: {
        roleId: {
          in: roleIds.map((id) => id.getValue()),
        },
      },
    });
    return entities.map((e) => PrincipalRolePersistenceMapper.toDomain(e));
  }

  async save(principalRole: PrincipalRole): Promise<void> {
    await this.prisma.principalRole.create({
      data: PrincipalRolePersistenceMapper.toPersistence(principalRole),
    });
  }

  async delete(principalId: Identifier, roleId: Identifier, scopeId: Identifier): Promise<void> {
    await this.prisma.principalRole.delete({
      where: {
        principalId_roleId_scopeId: {
          principalId: principalId.getValue(),
          roleId: roleId.getValue(),
          scopeId: scopeId.getValue(),
        },
      },
    });
  }

  async exists(principalId: Identifier, roleId: Identifier, scopeId: Identifier): Promise<boolean> {
    const count = await this.prisma.principalRole.count({
      where: {
        principalId: principalId.getValue(),
        roleId: roleId.getValue(),
        scopeId: scopeId.getValue(),
      },
    });
    return count > 0;
  }
}
