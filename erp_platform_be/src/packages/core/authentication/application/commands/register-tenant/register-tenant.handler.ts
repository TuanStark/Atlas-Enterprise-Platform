import { ConflictException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RegisterTenantCommand } from './register-tenant.command';
import { PrismaService } from 'src/database/prisma.service';
import { Result, PASSWORD_HASHER } from '@shared-kernel/application';
import type { PasswordHasher } from '@shared-kernel/application';
import { randomUUID } from 'crypto';

@CommandHandler(RegisterTenantCommand)
export class RegisterTenantHandler implements ICommandHandler<RegisterTenantCommand> {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) { }

  async execute(command: RegisterTenantCommand): Promise<Result<void>> {
    const dto = command.dto;
    const tenantCode = dto.code.toLowerCase().trim();
    const adminEmail = dto.adminEmail.toLowerCase().trim();

    const tenantExists = await this.prisma.tenant.findUnique({
      where: { code: tenantCode },
    });
    if (tenantExists) {
      return Result.failure({
        statusCode: HttpStatus.CONFLICT,
        code: 'TENANT_CODE_ALREADY_EXISTS',
        message: `Mã doanh nghiệp '${tenantCode}' đã được sử dụng.`,
      });
    }

    const userExists = await this.prisma.user.findFirst({
      where: { email: adminEmail },
    });
    if (userExists) {
      return Result.failure({
        statusCode: HttpStatus.CONFLICT,
        code: 'EMAIL_ALREADY_EXISTS',
        message: `Email đăng ký '${adminEmail}' đã tồn tại trong hệ thống.`,
      });
    }

    const globalScope = await this.prisma.scope.findFirst({
      where: { code: 'GLOBAL' },
    });
    if (!globalScope) {
      return Result.failure({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: 'GLOBAL_SCOPE_NOT_FOUND',
        message: 'Không tìm thấy cấu hình GLOBAL scope trong hệ thống.',
      });
    }

    const tenantId = randomUUID();
    const principalId = randomUUID();
    const userId = randomUUID();
    const credentialId = randomUUID();
    const roleId = randomUUID();

    const passwordHash = await this.passwordHasher.hash(dto.adminPassword);

    try {
      await this.prisma.$transaction(async (tx) => {
        //Create Tenant
        await tx.tenant.create({
          data: {
            id: tenantId,
            code: tenantCode,
            name: dto.name,
            legalName: dto.legalName,
            taxCode: dto.taxCode,
            phone: dto.phone,
            timezone: dto.timezone || 'Asia/Ho_Chi_Minh',
            locale: dto.locale || 'vi',
            currency: dto.currency || 'VND',
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        //Create Principal
        await tx.principal.create({
          data: {
            id: principalId,
            tenantId: tenantId,
            type: 'user',
            status: 'active',
            displayName: `${dto.adminFirstName} ${dto.adminLastName}`.trim(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        //Create User
        await tx.user.create({
          data: {
            id: userId,
            principalId: principalId,
            tenantId: tenantId,
            username: adminEmail,
            email: adminEmail,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        //Create Credential (password)
        await tx.credential.create({
          data: {
            id: credentialId,
            principalId: principalId,
            type: 'password',
            passwordHash: passwordHash,
            createdAt: new Date(),
          },
        });

        //Create SUPER_ADMIN Role for this tenant
        await tx.role.create({
          data: {
            id: roleId,
            tenantId: tenantId,
            code: 'SUPER_ADMIN',
            name: 'Super Admin',
            description: 'Quyền quản trị tối cao của doanh nghiệp.',
            isSystem: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });

        //Assign all system permissions to the new SUPER_ADMIN role
        const allPermissions = await tx.permission.findMany();
        const rolePermissions = allPermissions.map((perm) => ({
          roleId: roleId,
          permissionId: perm.id,
          effect: 'allow' as const,
        }));
        if (rolePermissions.length > 0) {
          await tx.rolePermission.createMany({
            data: rolePermissions,
          });
        }

        //Assign SUPER_ADMIN role to Admin Principal
        await tx.principalRole.create({
          data: {
            principalId: principalId,
            roleId: roleId,
            scopeId: globalScope.id,
            assignedAt: new Date(),
          },
        });
      });

      return Result.success(undefined, {
        statusCode: HttpStatus.CREATED,
        code: 'TENANT_REGISTERED',
        message: 'Đăng ký doanh nghiệp và tài khoản quản trị thành công!',
      });
    } catch (error) {
      return Result.failure({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: 'REGISTRATION_TRANSACTION_FAILED',
        message: `Quá trình đăng ký thất bại: ${error instanceof Error ? error.message : 'Lỗi hệ thống.'}`,
      });
    }
  }
}
