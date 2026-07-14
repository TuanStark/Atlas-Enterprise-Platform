import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap() {
    this.logger.log('Checking database seed data...');
    try {
      await this.seed();
    } catch (err) {
      this.logger.error('Error during automatic seeding:', err);
    }
  }

  private async seed() {
    // 1. Seed GLOBAL scope
    let globalScope = await this.prisma.scope.findFirst({
      where: { code: 'GLOBAL' },
    });
    if (!globalScope) {
      globalScope = await this.prisma.scope.create({
        data: {
          id: randomUUID(),
          code: 'GLOBAL',
          name: 'Global Scope',
        },
      });
      this.logger.log('Seeded GLOBAL scope.');
    }

    // 2. Create Tenant SYSTEM
    let tenant = await this.prisma.tenant.findUnique({
      where: { code: 'SYSTEM' },
    });
    if (!tenant) {
      tenant = await this.prisma.tenant.create({
        data: {
          id: randomUUID(),
          code: 'SYSTEM',
          name: 'System Tenant',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      this.logger.log('Created SYSTEM tenant.');
    }

    // 3. Create Principal for Admin
    const adminEmail = 'admin@erp.com';
    let user = await this.prisma.user.findFirst({
      where: { email: adminEmail },
    });

    let principalId: string;
    if (!user) {
      principalId = randomUUID();
      await this.prisma.principal.create({
        data: {
          id: principalId,
          tenantId: tenant.id,
          type: 'user',
          status: 'active',
          displayName: 'System Administrator',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const userId = randomUUID();
      user = await this.prisma.user.create({
        data: {
          id: userId,
          principalId: principalId,
          tenantId: tenant.id,
          username: 'admin',
          email: adminEmail,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const passwordHash = await bcrypt.hash('Admin123!', 12);
      await this.prisma.credential.create({
        data: {
          id: randomUUID(),
          principalId: principalId,
          type: 'password',
          passwordHash: passwordHash,
          createdAt: new Date(),
        },
      });
      this.logger.log('Created Admin user, principal, and credentials.');
    } else {
      principalId = user.principalId;
    }

    // 4. Seed Roles and Permissions
    const PERMISSIONS = [
      'role:create', 'role:read', 'role:update', 'role:delete',
      'permission:create', 'permission:read', 'permission:update', 'permission:delete',
      'principal:create', 'principal:read', 'principal:update', 'principal:delete',
      'tenant:create', 'tenant:read', 'tenant:update', 'tenant:delete',
    ];

    // Seed permissions
    for (const code of PERMISSIONS) {
      const parts = code.split(':');
      const resourceCode = parts[0];
      const actionCode = parts[1];

      let resource = await this.prisma.resource.findUnique({ where: { code: resourceCode } });
      if (!resource) {
        resource = await this.prisma.resource.create({ data: { id: randomUUID(), code: resourceCode, name: resourceCode } });
      }

      let action = await this.prisma.action.findUnique({ where: { code: actionCode } });
      if (!action) {
        action = await this.prisma.action.create({ data: { id: randomUUID(), code: actionCode, name: actionCode } });
      }

      const existingPerm = await this.prisma.permission.findUnique({ where: { code } });
      if (!existingPerm) {
        await this.prisma.permission.create({
          data: {
            id: randomUUID(),
            resourceId: resource.id,
            actionId: action.id,
            code,
            description: `Permission to ${actionCode} ${resourceCode}`,
          },
        });
      }
    }

    // Seed SUPER_ADMIN role
    let superAdminRole = await this.prisma.role.findFirst({
      where: { tenantId: tenant.id, code: 'SUPER_ADMIN' },
    });
    if (!superAdminRole) {
      superAdminRole = await this.prisma.role.create({
        data: {
          id: randomUUID(),
          tenantId: tenant.id,
          code: 'SUPER_ADMIN',
          name: 'Super Admin',
          description: 'Full system access with all permissions.',
          isSystem: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      this.logger.log('Created SUPER_ADMIN role.');
    }

    // Assign all permissions to SUPER_ADMIN role
    const allPerms = await this.prisma.permission.findMany({
      where: { code: { in: PERMISSIONS } },
    });
    for (const perm of allPerms) {
      const existingRp = await this.prisma.rolePermission.findUnique({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: perm.id,
          },
        },
      });
      if (!existingRp) {
        await this.prisma.rolePermission.create({
          data: {
            roleId: superAdminRole.id,
            permissionId: perm.id,
            effect: 'allow',
          },
        });
      }
    }

    // 5. Assign SUPER_ADMIN role to Admin Principal
    const existingPr = await this.prisma.principalRole.findUnique({
      where: {
        principalId_roleId_scopeId: {
          principalId: principalId,
          roleId: superAdminRole.id,
          scopeId: globalScope.id,
        },
      },
    });
    if (!existingPr) {
      await this.prisma.principalRole.create({
        data: {
          principalId: principalId,
          roleId: superAdminRole.id,
          scopeId: globalScope.id,
          assignedAt: new Date(),
        },
      });
      this.logger.log('Assigned SUPER_ADMIN role to Admin principal.');
    }

    this.logger.log('Database seeding check finished.');
  }
}
