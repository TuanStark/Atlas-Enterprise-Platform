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
    // Resource definitions with human-readable names
    const RESOURCE_NAMES: Record<string, string> = {
      // Core RBAC
      role: 'Vai trò',
      permission: 'Quyền hạn',
      principal: 'Chủ thể',
      tenant: 'Tổ chức thuê',
      // HRM
      'hrm.employee': 'Nhân viên',
      'hrm.leave': 'Nghỉ phép',
      'hrm.attendance': 'Chấm công',
      'hrm.shift': 'Ca làm việc',
      'hrm.payroll': 'Bảng lương',
      'hrm.recruitment': 'Tuyển dụng',
      'hrm.performance': 'Đánh giá',
      // Organization
      'org.structure': 'Cơ cấu tổ chức',
      'org.position': 'Vị trí công việc',
      // Admin
      'admin.user': 'Tài khoản',
      'admin.role': 'Vai trò hệ thống',
      'admin.audit': 'Nhật ký kiểm toán',
      'admin.settings': 'Cài đặt hệ thống',
      'admin.impersonate': 'Đóng vai tài khoản',
    };

    const ACTION_NAMES: Record<string, string> = {
      create: 'Tạo mới',
      read: 'Xem',
      update: 'Cập nhật',
      delete: 'Xóa',
      export: 'Xuất dữ liệu',
      approve: 'Phê duyệt',
      reject: 'Từ chối',
      execute: 'Thực thi',
    };

    const PERMISSION_DEFINITIONS: { code: string; description: string }[] = [
      // Core RBAC permissions
      { code: 'role:create', description: 'Tạo vai trò mới' },
      { code: 'role:read', description: 'Xem danh sách vai trò' },
      { code: 'role:update', description: 'Cập nhật vai trò' },
      { code: 'role:delete', description: 'Xóa vai trò' },
      { code: 'permission:create', description: 'Tạo quyền hạn' },
      { code: 'permission:read', description: 'Xem quyền hạn' },
      { code: 'permission:update', description: 'Cập nhật quyền hạn' },
      { code: 'permission:delete', description: 'Xóa quyền hạn' },
      { code: 'principal:create', description: 'Tạo chủ thể' },
      { code: 'principal:read', description: 'Xem chủ thể' },
      { code: 'principal:update', description: 'Cập nhật chủ thể' },
      { code: 'principal:delete', description: 'Xóa chủ thể' },
      { code: 'tenant:create', description: 'Tạo tổ chức thuê' },
      { code: 'tenant:read', description: 'Xem tổ chức thuê' },
      { code: 'tenant:update', description: 'Cập nhật tổ chức thuê' },
      { code: 'tenant:delete', description: 'Xóa tổ chức thuê' },

      // HRM · Employee
      { code: 'hrm.employee:read', description: 'Xem danh sách và chi tiết nhân viên' },
      { code: 'hrm.employee:create', description: 'Tạo hồ sơ nhân viên mới' },
      { code: 'hrm.employee:update', description: 'Chỉnh sửa hồ sơ nhân viên' },
      { code: 'hrm.employee:delete', description: 'Xóa hồ sơ nhân viên' },
      { code: 'hrm.employee:export', description: 'Xuất danh sách nhân viên ra Excel' },

      // HRM · Leave
      { code: 'hrm.leave:read', description: 'Xem danh sách đơn nghỉ phép' },
      { code: 'hrm.leave:create', description: 'Tạo đơn nghỉ phép mới' },
      { code: 'hrm.leave:approve', description: 'Phê duyệt đơn nghỉ phép' },
      { code: 'hrm.leave:reject', description: 'Từ chối đơn nghỉ phép' },

      // HRM · Attendance
      { code: 'hrm.attendance:read', description: 'Xem dữ liệu chấm công' },
      { code: 'hrm.attendance:create', description: 'Tạo bản ghi chấm công' },
      { code: 'hrm.attendance:update', description: 'Chỉnh sửa dữ liệu chấm công' },

      // HRM · Shift
      { code: 'hrm.shift:read', description: 'Xem danh sách ca làm việc' },
      { code: 'hrm.shift:create', description: 'Tạo ca làm việc mới' },
      { code: 'hrm.shift:update', description: 'Chỉnh sửa ca làm việc' },
      { code: 'hrm.shift:delete', description: 'Xóa ca làm việc' },

      // HRM · Payroll
      { code: 'hrm.payroll:read', description: 'Xem bảng lương' },
      { code: 'hrm.payroll:create', description: 'Tạo kỳ tính lương' },
      { code: 'hrm.payroll:export', description: 'Xuất bảng lương ra Excel' },

      // HRM · Recruitment
      { code: 'hrm.recruitment:read', description: 'Xem thông tin tuyển dụng' },
      { code: 'hrm.recruitment:create', description: 'Tạo tin tuyển dụng mới' },
      { code: 'hrm.recruitment:update', description: 'Cập nhật tin tuyển dụng' },

      // HRM · Performance
      { code: 'hrm.performance:read', description: 'Xem đánh giá hiệu suất' },
      { code: 'hrm.performance:create', description: 'Tạo kỳ đánh giá mới' },
      { code: 'hrm.performance:update', description: 'Cập nhật đánh giá hiệu suất' },

      // Organization · Structure
      { code: 'org.structure:read', description: 'Xem cơ cấu tổ chức' },
      { code: 'org.structure:create', description: 'Tạo đơn vị tổ chức mới' },
      { code: 'org.structure:update', description: 'Cập nhật cơ cấu tổ chức' },
      { code: 'org.structure:delete', description: 'Xóa đơn vị tổ chức' },

      // Organization · Position
      { code: 'org.position:read', description: 'Xem danh mục vị trí công việc' },
      { code: 'org.position:create', description: 'Thêm vị trí công việc mới' },
      { code: 'org.position:update', description: 'Chỉnh sửa vị trí công việc' },
      { code: 'org.position:delete', description: 'Xóa vị trí công việc' },

      // Admin · User
      { code: 'admin.user:read', description: 'Xem danh sách tài khoản' },
      { code: 'admin.user:create', description: 'Tạo tài khoản mới' },
      { code: 'admin.user:update', description: 'Cập nhật tài khoản, gán vai trò' },
      { code: 'admin.user:delete', description: 'Xóa tài khoản' },

      // Admin · Role
      { code: 'admin.role:read', description: 'Xem vai trò và phân quyền' },
      { code: 'admin.role:create', description: 'Tạo vai trò mới' },
      { code: 'admin.role:update', description: 'Chỉnh sửa vai trò, gán/gỡ quyền' },
      { code: 'admin.role:delete', description: 'Xóa vai trò' },

      // Admin · Audit
      { code: 'admin.audit:read', description: 'Xem nhật ký kiểm toán hệ thống' },

      // Admin · Settings
      { code: 'admin.settings:read', description: 'Xem cài đặt hệ thống' },
      { code: 'admin.settings:update', description: 'Thay đổi cài đặt hệ thống' },

      // Admin · Impersonation
      { code: 'admin.impersonate:execute', description: 'Đóng vai tài khoản khác (Act As)' },
    ];

    // Seed permissions
    for (const permDef of PERMISSION_DEFINITIONS) {
      const parts = permDef.code.split(':');
      const resourceCode = parts[0];
      const actionCode = parts[1];

      let resource = await this.prisma.resource.findUnique({ where: { code: resourceCode } });
      if (!resource) {
        resource = await this.prisma.resource.create({
          data: {
            id: randomUUID(),
            code: resourceCode,
            name: RESOURCE_NAMES[resourceCode] || resourceCode,
          },
        });
      }

      let action = await this.prisma.action.findUnique({ where: { code: actionCode } });
      if (!action) {
        action = await this.prisma.action.create({
          data: {
            id: randomUUID(),
            code: actionCode,
            name: ACTION_NAMES[actionCode] || actionCode,
          },
        });
      }

      const existingPerm = await this.prisma.permission.findUnique({
        where: { code: permDef.code },
      });
      if (!existingPerm) {
        await this.prisma.permission.create({
          data: {
            id: randomUUID(),
            resourceId: resource.id,
            actionId: action.id,
            code: permDef.code,
            description: permDef.description,
          },
        });
        this.logger.log(`Seeded permission: ${permDef.code}`);
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

    // Assign ALL permissions to SUPER_ADMIN role
    const allPerms = await this.prisma.permission.findMany();
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

    // 5.5 Seed Role Hierarchy for Impersonation support
    // Hierarchy: SUPER_ADMIN > ADMIN > HR_MANAGER/FINANCE_MANAGER > USER
    const ROLE_HIERARCHY_SEEDS = [
      { parentCode: 'SUPER_ADMIN', childCode: 'ADMIN' },
      { parentCode: 'SUPER_ADMIN', childCode: 'HR_MANAGER' },
      { parentCode: 'SUPER_ADMIN', childCode: 'FINANCE_MANAGER' },
      { parentCode: 'SUPER_ADMIN', childCode: 'USER' },
      { parentCode: 'ADMIN', childCode: 'HR_MANAGER' },
      { parentCode: 'ADMIN', childCode: 'FINANCE_MANAGER' },
      { parentCode: 'ADMIN', childCode: 'USER' },
      { parentCode: 'HR_MANAGER', childCode: 'USER' },
      { parentCode: 'FINANCE_MANAGER', childCode: 'USER' },
    ];

    for (const hierarchy of ROLE_HIERARCHY_SEEDS) {
      const parentRole = await this.prisma.role.findFirst({
        where: { tenantId: tenant.id, code: hierarchy.parentCode },
      });
      const childRole = await this.prisma.role.findFirst({
        where: { tenantId: tenant.id, code: hierarchy.childCode },
      });

      if (parentRole && childRole) {
        const existing = await this.prisma.roleHierarchy.findUnique({
          where: {
            parentRoleId_childRoleId: {
              parentRoleId: parentRole.id,
              childRoleId: childRole.id,
            },
          },
        });
        if (!existing) {
          await this.prisma.roleHierarchy.create({
            data: {
              parentRoleId: parentRole.id,
              childRoleId: childRole.id,
            },
          });
          this.logger.log(
            `Seeded role hierarchy: ${hierarchy.parentCode} > ${hierarchy.childCode}`,
          );
        }
      }
    }

    // 6. Seed mock HRM data (Departments, Positions, Job Titles)
    this.logger.log('Seeding mock HRM master data...');

    let org = await this.prisma.organization.findFirst({
      where: { tenantId: tenant.id },
    });
    if (!org) {
      org = await this.prisma.organization.create({
        data: {
          id: randomUUID(),
          tenantId: tenant.id,
          code: 'ORG',
          name: 'Default Organization',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    let unitType = await this.prisma.organizationUnitType.findUnique({
      where: { code: 'DEPT' },
    });
    if (!unitType) {
      unitType = await this.prisma.organizationUnitType.create({
        data: {
          id: randomUUID(),
          code: 'DEPT',
          name: 'Department',
        },
      });
    }

    const DEPARTMENTS = [
      { id: '11111111-1111-1111-1111-111111111111', code: 'IT', name: 'Phòng IT' },
      { id: '22222222-2222-2222-2222-222222222222', code: 'HR', name: 'Phòng Nhân sự' },
      { id: '33333333-3333-3333-3333-333333333333', code: 'FIN', name: 'Phòng Tài chính' },
      { id: '44444444-4444-4444-4444-444444444444', code: 'MKT', name: 'Phòng Marketing' },
    ];

    for (const dept of DEPARTMENTS) {
      const exists = await this.prisma.organizationUnit.findUnique({ where: { id: dept.id } });
      if (!exists) {
        await this.prisma.organizationUnit.create({
          data: {
            id: dept.id,
            organizationId: org.id,
            unitTypeId: unitType.id,
            code: dept.code,
            name: dept.name,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }
    }

    const POSITIONS = [
      { id: '11111111-1111-1111-1111-111111111111', code: 'SR_DEV', name: 'Senior Developer' },
      { id: '22222222-2222-2222-2222-222222222222', code: 'JR_DEV', name: 'Junior Developer' },
      { id: '33333333-3333-3333-3333-333333333333', code: 'HR_MGR', name: 'HR Manager' },
      { id: '44444444-4444-4444-4444-444444444444', code: 'ACCT', name: 'Accountant' },
    ];

    for (const pos of POSITIONS) {
      const existsPos = await this.prisma.position.findUnique({ where: { id: pos.id } });
      if (!existsPos) {
        await this.prisma.position.create({
          data: {
            id: pos.id,
            organizationId: org.id,
            code: pos.code,
            name: pos.name,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      const existsJob = await this.prisma.jobTitle.findUnique({ where: { id: pos.id } });
      if (!existsJob) {
        await this.prisma.jobTitle.create({
          data: {
            id: pos.id,
            tenantId: tenant.id,
            code: pos.code,
            name: pos.name,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }
    }

    this.logger.log('Database seeding check finished.');
  }
}
