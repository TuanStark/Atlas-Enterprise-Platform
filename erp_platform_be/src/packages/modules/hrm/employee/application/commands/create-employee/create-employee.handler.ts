import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateEmployeeCommand } from './create-employee.command';
import { EmployeeDomainService } from '../../../domain/services/employee-domain.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PrismaService } from 'src/database/prisma.service';
import { Inject } from '@nestjs/common';
import { PASSWORD_HASHER } from '@shared-kernel/application';
import type { PasswordHasher } from '@shared-kernel/application';
import { randomUUID } from 'crypto';

@CommandHandler(CreateEmployeeCommand)
export class CreateEmployeeHandler implements ICommandHandler<CreateEmployeeCommand> {
  constructor(
    private readonly domainService: EmployeeDomainService,
    private readonly prisma: PrismaService,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
  ) { }

  async execute(command: CreateEmployeeCommand): Promise<Identifier> {
    const { tenantId, dto } = command;

    const principalId = Identifier.create();
    const isCreateAccount = dto.createAccount === true || dto.createAccount === 'true';

    await this.prisma.principal.create({
      data: {
        id: principalId.toString(),
        tenantId: tenantId.toString(),
        type: 'user',
        status: isCreateAccount ? 'active' : 'inactive',
        displayName: `${dto.firstName} ${dto.lastName}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const employee = await this.domainService.create({
      tenantId,
      principalId,
      employeeNo: dto.employeeNo,
      firstName: dto.firstName,
      lastName: dto.lastName,
      preferredName: dto.preferredName,
      personalInfo: {
        gender: dto.gender,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        maritalStatus: dto.maritalStatus,
        nationality: dto.nationality,
        nationalId: dto.nationalId,
        passportNo: dto.passportNo,
        taxNumber: dto.taxNumber,
      },
    });

    if (dto.addressLine || dto.city || dto.country) {
      await this.prisma.employeeAddress.create({
        data: {
          id: employee.id.toString(),
          employeeId: employee.id.toString(),
          addressType: 'current',
          country: dto.country || undefined,
          city: dto.city || undefined,
          addressLine: dto.addressLine || undefined,
          isPrimary: true,
          createdAt: new Date(),
        },
      });
    } else {
      await this.prisma.employeeAddress.create({
        data: {
          id: employee.id.toString(),
          employeeId: employee.id.toString(),
          addressType: 'current',
          isPrimary: true,
          createdAt: new Date(),
        },
      });
    }

    if (dto.email) {
      await this.prisma.employeeContact.create({
        data: {
          id: randomUUID(),
          employeeId: employee.id.toString(),
          contactType: 'email',
          value: dto.email,
          isPrimary: true,
          createdAt: new Date(),
        },
      });
    }

    if (dto.phone) {
      await this.prisma.employeeContact.create({
        data: {
          id: randomUUID(),
          employeeId: employee.id.toString(),
          contactType: 'phone',
          value: dto.phone,
          isPrimary: true,
          createdAt: new Date(),
        },
      });
    }

    if (isCreateAccount && dto.email && dto.password) {
      const userId = randomUUID();
      await this.prisma.user.create({
        data: {
          id: userId,
          principalId: principalId.toString(),
          tenantId: tenantId.toString(),
          username: dto.email,
          email: dto.email,
          phone: dto.phone || undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const hash = await this.passwordHasher.hash(dto.password);
      await this.prisma.credential.create({
        data: {
          id: randomUUID(),
          principalId: principalId.toString(),
          type: 'password',
          passwordHash: hash,
          createdAt: new Date(),
        },
      });

      if (dto.roleId) {
        const globalScope = await this.prisma.scope.findFirst({
          where: { code: 'GLOBAL' },
        });
        if (globalScope) {
          await this.prisma.principalRole.create({
            data: {
              principalId: principalId.toString(),
              roleId: dto.roleId,
              scopeId: globalScope.id,
              assignedAt: new Date(),
            },
          });
        }
      }
    }

    let empType = await this.prisma.employmentType.findFirst({
      where: { tenantId: tenantId.toString() },
    });
    if (!empType) {
      empType = await this.prisma.employmentType.create({
        data: {
          id: randomUUID(),
          tenantId: tenantId.toString(),
          code: 'STANDARD',
          name: 'Standard',
        },
      });
    }

    const employmentId = randomUUID();
    const hireDate = (dto as any).joinDate ? new Date((dto as any).joinDate) : new Date();

    const mapMockUuid = (id: string | undefined, defaultVal: string) => {
      if (!id) return defaultVal;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(id)) return id;
      if (id === '1') return '11111111-1111-1111-1111-111111111111';
      if (id === '2') return '22222222-2222-2222-2222-222222222222';
      if (id === '3') return '33333333-3333-3333-3333-333333333333';
      if (id === '4') return '44444444-4444-4444-4444-444444444444';
      return defaultVal;
    };

    const deptId = mapMockUuid((dto as any).departmentId, '11111111-1111-1111-1111-111111111111');
    const jobTitleId = mapMockUuid((dto as any).jobTitleId, '11111111-1111-1111-1111-111111111111');
    const positionId = jobTitleId;

    await this.prisma.employment.create({
      data: {
        id: employmentId,
        tenantId: tenantId.toString(),
        employeeId: employee.id.toString(),
        employmentTypeId: empType.id,
        employeeCode: dto.employeeNo,
        hireDate: hireDate,
        status: (dto as any).status === 'active' ? 'active' : 'probation',
        metadata: {
          departmentId: (dto as any).departmentId ?? '1',
          jobTitleId: (dto as any).jobTitleId ?? '1',
        },
      },
    });

    await this.prisma.organizationAssignment.create({
      data: {
        id: randomUUID(),
        tenantId: tenantId.toString(),
        employmentId: employmentId,
        departmentId: deptId,
        positionId: positionId,
        jobTitleId: jobTitleId,
        effectiveFrom: hireDate,
        isPrimary: true,
        status: 'active',
      },
    });

    return employee.id;
  }
}
