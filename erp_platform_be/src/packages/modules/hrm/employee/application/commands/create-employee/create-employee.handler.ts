import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateEmployeeCommand } from './create-employee.command';
import { EmployeeDomainService } from '../../../domain/services/employee-domain.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PrismaService } from 'src/database/prisma.service';

@CommandHandler(CreateEmployeeCommand)
export class CreateEmployeeHandler implements ICommandHandler<CreateEmployeeCommand> {
  constructor(
    private readonly domainService: EmployeeDomainService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(command: CreateEmployeeCommand): Promise<Identifier> {
    const { tenantId, dto } = command;

    // Create an inactive Principal for this Employee (Option A from plan)
    const principalId = Identifier.create();
    await this.prisma.principal.create({
      data: {
        id: principalId.toString(),
        tenantId: tenantId.toString(),
        type: 'user',
        status: 'inactive',
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

    // Auto-create initial Employment for the new employee
    let empType = await this.prisma.employmentType.findFirst({
      where: { tenantId: tenantId.toString() },
    });
    if (!empType) {
      const { randomUUID } = require('crypto');
      empType = await this.prisma.employmentType.create({
        data: {
          id: randomUUID(),
          tenantId: tenantId.toString(),
          code: 'STANDARD',
          name: 'Standard',
        },
      });
    }

    const { randomUUID } = require('crypto');
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
