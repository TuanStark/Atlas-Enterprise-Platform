import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

const GLOBAL_SCOPE_CODE = 'GLOBAL';

const PERMISSIONS = [
  'role:create',
  'role:read',
  'role:update',
  'role:delete',
  'permission:create',
  'permission:read',
  'permission:update',
  'permission:delete',
  'principal:create',
  'principal:read',
  'principal:update',
  'principal:delete',
  'tenant:create',
  'tenant:read',
  'tenant:update',
  'tenant:delete',
];

interface RoleSeed {
  code: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissionCodes: string[];
}

const ROLES: RoleSeed[] = [
  {
    code: 'SUPER_ADMIN',
    name: 'Super Admin',
    description: 'Full system access with all permissions.',
    isSystem: true,
    permissionCodes: PERMISSIONS,
  },
  {
    code: 'HR_MANAGER',
    name: 'HR Manager',
    description: 'Manages principals and roles.',
    isSystem: true,
    permissionCodes: [
      'principal:create',
      'principal:read',
      'principal:update',
      'principal:delete',
      'role:read',
      'role:update',
    ],
  },
  {
    code: 'EMPLOYEE',
    name: 'Employee',
    description: 'Read-only access.',
    isSystem: true,
    permissionCodes: ['role:read', 'permission:read', 'principal:read', 'tenant:read'],
  },
];

@Injectable()
export class RbacSeeder {
  private readonly logger = new Logger(RbacSeeder.name);

  constructor(private readonly prisma: PrismaService) {}

  async seed(tenantId: string): Promise<void> {
    this.logger.log(`Seeding RBAC for tenant: ${tenantId}`);

    await this.seedScope();
    await this.seedPermissions();
    await this.seedRoles(tenantId);

    this.logger.log('RBAC seed completed.');
  }

  private async seedScope(): Promise<void> {
    const exists = await this.prisma.scope.findFirst({
      where: { code: GLOBAL_SCOPE_CODE },
    });

    if (!exists) {
      await this.prisma.scope.create({
        data: {
          id: Identifier.create().getValue(),
          code: GLOBAL_SCOPE_CODE,
          name: 'Global Scope',
        },
      });
      this.logger.log('Created GLOBAL scope.');
    }
  }

  private async seedPermissions(): Promise<void> {
    for (const code of PERMISSIONS) {
      const exists = await this.prisma.permission.findUnique({
        where: { code },
      });

      if (!exists) {
        const [resourceCode, actionCode] = code.split(':');

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

        await this.prisma.permission.create({
          data: {
            id: Identifier.create().getValue(),
            code,
            description: `${this.capitalize(actionCode)} ${this.capitalize(resourceCode)}`,
            resourceId: resource.id,
            actionId: action.id,
          },
        });

        this.logger.log(`Created permission: ${code}`);
      }
    }
  }

  private async seedRoles(tenantId: string): Promise<void> {
    for (const roleSeed of ROLES) {
      const existingRole = await this.prisma.role.findFirst({
        where: {
          tenantId,
          code: roleSeed.code,
        },
      });

      let roleId: string;

      if (!existingRole) {
        roleId = Identifier.create().getValue();
        await this.prisma.role.create({
          data: {
            id: roleId,
            tenantId,
            code: roleSeed.code,
            name: roleSeed.name,
            description: roleSeed.description,
            isSystem: roleSeed.isSystem,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        this.logger.log(`Created role: ${roleSeed.code}`);
      } else {
        roleId = existingRole.id;
      }

      // Sync permissions with diff
      const currentPermissions = await this.prisma.rolePermission.findMany({
        where: { roleId },
        include: { permission: { select: { code: true } } },
      });
      const currentCodes = new Set(currentPermissions.map((rp) => rp.permission.code));

      for (const permCode of roleSeed.permissionCodes) {
        if (!currentCodes.has(permCode)) {
          const permission = await this.prisma.permission.findUnique({
            where: { code: permCode },
          });

          if (permission) {
            await this.prisma.rolePermission.create({
              data: {
                roleId,
                permissionId: permission.id,
                effect: 'allow',
              },
            });
            this.logger.log(`Assigned ${permCode} to ${roleSeed.code}`);
          }
        }
      }
    }
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
