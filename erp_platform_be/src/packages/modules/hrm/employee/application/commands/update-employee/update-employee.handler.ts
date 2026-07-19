import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateEmployeeCommand } from './update-employee.command';
import { BaseCommandHandler } from '@shared-kernel/application';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import * as employeeRepo from '../../../domain/repositories/employee.repository';
import * as employmentRepo from '../../../../employment/domain/repositories/employment.repository';
import * as orgAssignmentRepo from '@core/organization/domain/repositories/organization-assignment.repository';
import { EmploymentStatus, AssignmentStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { Employment } from '@modules/hrm/employment/domain';
import { OrganizationAssignment } from '@core/organization/domain';
import { Employee } from '@modules/hrm/employee/domain/aggregates/employee.aggregate';
import { UpdateEmployeeDto } from '../../dto/update-employee.dto';

@CommandHandler(UpdateEmployeeCommand)
export class UpdateEmployeeHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdateEmployeeCommand> {
  private readonly logger = new Logger(UpdateEmployeeHandler.name);

  constructor(
    @Inject(employeeRepo.EMPLOYEE_REPOSITORY)
    private readonly repository: employeeRepo.EmployeeRepository,
    @Inject(employmentRepo.EMPLOYMENT_REPOSITORY)
    private readonly employmentRepository: employmentRepo.EmploymentRepository,
    @Inject(orgAssignmentRepo.ORGANIZATION_ASSIGNMENT_REPOSITORY)
    private readonly orgAssignmentRepository: orgAssignmentRepo.OrganizationAssignmentRepository,
  ) {
    super();
  }

  async execute(command: UpdateEmployeeCommand): Promise<void> {
    this.logger.log(
      `Executing UpdateEmployeeCommand for employeeId: ${command.employeeId.toString()} with DTO: ${JSON.stringify(
        command.dto,
      )}`,
    );

    try {
      const employee = this.ensureFound(
        await this.repository.findById(command.tenantId, command.employeeId),
        'Employee',
        command.employeeId.toString(),
      );

      const { dto } = command;

      this.updateCoreEmployeeInfo(employee, dto);
      this.updateEmployeeContacts(employee, dto);
      this.updateEmployeeAddress(employee, dto);

      await this.repository.update(employee);

      await this.handleEmploymentAndAssignment(command, employee);
    } catch (error: any) {
      this.logger.error(`Error in UpdateEmployeeHandler: ${error.message}`, error.stack);
      throw error;
    }
  }

  private updateCoreEmployeeInfo(employee: Employee, dto: UpdateEmployeeDto): void {
    if (dto.firstName || dto.lastName) {
      employee.updateName(
        dto.firstName ?? employee.fullName.firstName,
        dto.lastName ?? employee.fullName.lastName,
        dto.preferredName ?? employee.fullName.preferredName,
      );
    } else if (dto.preferredName !== undefined) {
      employee.updateName(
        employee.fullName.firstName,
        employee.fullName.lastName,
        dto.preferredName,
      );
    }

    const hasPersonalInfoChanges =
      dto.gender !== undefined ||
      dto.dateOfBirth !== undefined ||
      dto.maritalStatus !== undefined ||
      dto.nationality !== undefined ||
      dto.nationalId !== undefined ||
      dto.passportNo !== undefined ||
      dto.taxNumber !== undefined;

    if (hasPersonalInfoChanges) {
      employee.updatePersonalInfo({
        gender: dto.gender ?? employee.personalInfo.gender,
        dateOfBirth: dto.dateOfBirth
          ? new Date(dto.dateOfBirth)
          : employee.personalInfo.dateOfBirth,
        maritalStatus: dto.maritalStatus ?? employee.personalInfo.maritalStatus,
        nationality: dto.nationality ?? employee.personalInfo.nationality,
        nationalId: dto.nationalId ?? employee.personalInfo.nationalId,
        passportNo: dto.passportNo ?? employee.personalInfo.passportNo,
        taxNumber: dto.taxNumber ?? employee.personalInfo.taxNumber,
      });
    }

    if (dto.avatarFileId !== undefined) {
      employee.changeAvatar(dto.avatarFileId ?? undefined);
    }

    if (dto.principalId !== undefined) {
      employee.linkPrincipal(Identifier.create(dto.principalId));
    }

    if (dto.status !== undefined) {
      if (dto.status === 'active') {
        employee.activate();
      } else if (dto.status === 'inactive') {
        employee.deactivate();
      }
    }
  }

  private updateEmployeeContacts(employee: Employee, dto: UpdateEmployeeDto): void {
    if (dto.email !== undefined) {
      const primaryEmail = employee.contacts.find((c) => c.contactType === 'email' && c.isPrimary);
      if (primaryEmail) {
        employee.removeContact(primaryEmail.id);
      }
      if (dto.email) {
        employee.addContact({
          contactType: 'email',
          value: dto.email,
          isPrimary: true,
        });
      }
    }

    if (dto.phone !== undefined) {
      const primaryPhone = employee.contacts.find(
        (c) => (c.contactType === 'phone' || c.contactType === 'mobile') && c.isPrimary,
      );
      if (primaryPhone) {
        employee.removeContact(primaryPhone.id);
      }
      if (dto.phone) {
        employee.addContact({
          contactType: 'phone',
          value: dto.phone,
          isPrimary: true,
        });
      }
    }
  }

  private updateEmployeeAddress(employee: Employee, dto: UpdateEmployeeDto): void {
    const hasAddressChanges =
      dto.addressLine !== undefined || dto.city !== undefined || dto.country !== undefined;

    if (hasAddressChanges) {
      const primaryAddress = employee.addresses.find((a) => a.isPrimary);
      const newAddressLine =
        dto.addressLine !== undefined ? dto.addressLine : primaryAddress?.addressLine;
      const newCity = dto.city !== undefined ? dto.city : primaryAddress?.city;
      const newCountry = dto.country !== undefined ? dto.country : primaryAddress?.country;

      if (primaryAddress) {
        // In-place update to preserve address ID due to database schema constraints
        (primaryAddress as any).props.addressLine = newAddressLine || undefined;
        (primaryAddress as any).props.city = newCity || undefined;
        (primaryAddress as any).props.country = newCountry || undefined;
      } else if (newAddressLine || newCity || newCountry) {
        const newAddr = employee.addAddress({
          addressType: 'current',
          addressLine: newAddressLine || undefined,
          city: newCity || undefined,
          country: newCountry || undefined,
          isPrimary: true,
        });
        // Force address ID to match employee ID to satisfy constraint
        (newAddr as any).id = employee.id;
      }
    }
  }

  private async handleEmploymentAndAssignment(
    command: UpdateEmployeeCommand,
    employee: Employee,
  ): Promise<void> {
    const { dto } = command;

    const employments = await this.employmentRepository.findByEmployeeId(
      command.tenantId,
      employee.id,
    );
    let employment = employments.find((e) => !e.deletedAt);

    const deptId = dto.departmentId
      ? this.mapMockUuid(dto.departmentId, '11111111-1111-1111-1111-111111111111')
      : undefined;
    const jobTitleId = dto.jobTitleId
      ? this.mapMockUuid(dto.jobTitleId, '11111111-1111-1111-1111-111111111111')
      : undefined;
    const positionId = dto.positionId
      ? this.mapMockUuid(dto.positionId, '11111111-1111-1111-1111-111111111111')
      : dto.jobTitleId
        ? this.mapMockUuid(dto.jobTitleId, '11111111-1111-1111-1111-111111111111')
        : undefined;

    const hireDate = dto.joinDate ? new Date(dto.joinDate) : new Date();

    if (!employment) {
      this.logger.log(`No active employment record found for employee ${employee.id}. Creating a new fallback.`);

      const allEmployments = await this.employmentRepository.findAll(command.tenantId);
      const standardEmpTypeId =
        allEmployments[0]?.employmentTypeId ||
        Identifier.create('7de9d67c-a2b5-46c7-9036-e29f1e0ee4c2');

      const newEmployment = Employment.create({
        tenantId: command.tenantId,
        employeeId: employee.id,
        employmentTypeId: standardEmpTypeId,
        employeeCode: employee.employeeNo ? employee.employeeNo.getValue() : 'NV001',
        hireDate: hireDate,
        metadata: {
          departmentId: dto.departmentId ?? '1',
          jobTitleId: dto.jobTitleId ?? '1',
          positionId: dto.positionId ?? '1',
        },
      });

      await this.employmentRepository.save(newEmployment);

      const reloadedEmployments = await this.employmentRepository.findByEmployeeId(
        command.tenantId,
        employee.id,
      );
      employment = reloadedEmployments.find((e) => !e.deletedAt);
    } else {
      const employmentStatus =
        dto.status === 'active'
          ? EmploymentStatus.active
          : dto.status === 'inactive'
            ? EmploymentStatus.terminated
            : undefined;

      if (employmentStatus) {
        employment.changeStatus(
          employmentStatus,
          dto.joinDate ? new Date(dto.joinDate) : employment.hireDate,
          'Status updated via employee edit',
        );
      }

      employment.updateEmploymentDetails({
        hireDate: dto.joinDate ? new Date(dto.joinDate) : employment.hireDate,
        metadata: {
          departmentId: dto.departmentId ?? (employment.metadata as any)?.departmentId ?? '1',
          jobTitleId: dto.jobTitleId ?? (employment.metadata as any)?.jobTitleId ?? '1',
          positionId: dto.positionId ?? (employment.metadata as any)?.positionId ?? '1',
        },
      });

      await this.employmentRepository.update(employment);
    }

    if (employment) {
      const assignments = await this.orgAssignmentRepository.findByEmploymentId(
        command.tenantId,
        employment.id,
      );
      const activeOa = assignments.find((oa) => oa.status === 'active');

      if (activeOa) {
        activeOa.updateAssignmentDetails({
          departmentId: deptId ? Identifier.create(deptId) : undefined,
          jobTitleId: jobTitleId ? Identifier.create(jobTitleId) : undefined,
          positionId: positionId ? Identifier.create(positionId) : undefined,
        });
        await this.orgAssignmentRepository.update(activeOa);
      } else {
        const newOa = OrganizationAssignment.create({
          tenantId: command.tenantId,
          employmentId: employment.id,
          departmentId: deptId
            ? Identifier.create(deptId)
            : Identifier.create('11111111-1111-1111-1111-111111111111'),
          positionId: positionId
            ? Identifier.create(positionId)
            : Identifier.create('11111111-1111-1111-1111-111111111111'),
          jobTitleId: jobTitleId ? Identifier.create(jobTitleId) : undefined,
          effectiveFrom: hireDate,
          isPrimary: true,
          status: AssignmentStatus.active,
        });
        await this.orgAssignmentRepository.save(newOa);
      }
    }
  }

  private mapMockUuid(id: string | undefined, defaultVal: string): string {
    if (!id) return defaultVal;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) return id;
    if (id === '1') return '11111111-1111-1111-1111-111111111111';
    if (id === '2') return '22222222-2222-2222-2222-222222222222';
    if (id === '3') return '33333333-3333-3333-3333-333333333333';
    if (id === '4') return '44444444-4444-4444-4444-444444444444';
    return defaultVal;
  }
}
