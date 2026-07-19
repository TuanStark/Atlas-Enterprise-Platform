import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateEmployeeCommand } from './update-employee.command';
import { BaseCommandHandler } from '@shared-kernel/application';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import * as employeeRepo from '../../../domain/repositories/employee.repository';
import * as employmentRepo from '../../../../employment/domain/repositories/employment.repository';
import * as orgAssignmentRepo from '@core/organization/domain/repositories/organization-assignment.repository';
import { EmploymentStatus } from '@prisma/client';

@CommandHandler(UpdateEmployeeCommand)
export class UpdateEmployeeHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdateEmployeeCommand>
{
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
    const employee = this.ensureFound(
      await this.repository.findById(command.tenantId, command.employeeId),
      'Employee',
      command.employeeId.toString(),
    );

    const { dto } = command;

    // Update name if provided
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

    // Update personal info
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

    // Update avatar
    if (dto.avatarFileId !== undefined) {
      employee.changeAvatar(dto.avatarFileId ?? undefined);
    }

    // Link existing Principal / User account if provided
    if (dto.principalId !== undefined) {
      employee.linkPrincipal(Identifier.create(dto.principalId));
    }

    // Update status
    if (dto.status !== undefined) {
      if (dto.status === 'active') {
        employee.activate();
      } else if (dto.status === 'inactive') {
        employee.deactivate();
      }
    }

    // Update contacts: Email
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

    // Update contacts: Phone
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

    // Update Address
    const hasAddressChanges =
      dto.addressLine !== undefined || dto.city !== undefined || dto.country !== undefined;
    if (hasAddressChanges) {
      const primaryAddress = employee.addresses.find((a) => a.isPrimary);
      const newAddressLine =
        dto.addressLine !== undefined ? dto.addressLine : primaryAddress?.addressLine;
      const newCity = dto.city !== undefined ? dto.city : primaryAddress?.city;
      const newCountry = dto.country !== undefined ? dto.country : primaryAddress?.country;

      if (primaryAddress) {
        employee.removeAddress(primaryAddress.id);
      }
      if (newAddressLine || newCity || newCountry) {
        employee.addAddress({
          addressType: 'current',
          addressLine: newAddressLine || undefined,
          city: newCity || undefined,
          country: newCountry || undefined,
          isPrimary: true,
        });
      }
    }

    // Update in Repository (persists employee aggregate, contacts, addresses, emergency contacts, documents, and principal avatar file update)
    await this.repository.update(employee);

    // Update Employment and Organization Assignment
    const employments = await this.employmentRepository.findByEmployeeId(
      command.tenantId,
      employee.id,
    );
    const employment = employments.find((e) => !e.deletedAt);

    if (employment) {
      // 1. Update Employment Fields
      const hireDate = dto.joinDate ? new Date(dto.joinDate) : undefined;
      const employmentStatus =
        dto.status === 'active'
          ? EmploymentStatus.active
          : dto.status === 'inactive'
            ? EmploymentStatus.terminated
            : undefined;

      if (employmentStatus) {
        employment.changeStatus(
          employmentStatus,
          hireDate || employment.hireDate,
          'Status updated via employee edit',
        );
      }

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

      const deptId = dto.departmentId
        ? mapMockUuid(dto.departmentId, '11111111-1111-1111-1111-111111111111')
        : undefined;
      const jobTitleId = dto.jobTitleId
        ? mapMockUuid(dto.jobTitleId, '11111111-1111-1111-1111-111111111111')
        : undefined;

      employment.updateEmploymentDetails({
        hireDate: hireDate,
        metadata: {
          departmentId: dto.departmentId ?? (employment.metadata as any)?.departmentId ?? '1',
          jobTitleId: dto.jobTitleId ?? (employment.metadata as any)?.jobTitleId ?? '1',
        },
      });

      await this.employmentRepository.update(employment);

      // 2. Update Organization Assignment
      if (deptId || jobTitleId) {
        const assignments = await this.orgAssignmentRepository.findByEmploymentId(
          command.tenantId,
          employment.id,
        );
        const activeOa = assignments.find((oa) => oa.status === 'active');

        if (activeOa) {
          activeOa.updateAssignmentDetails({
            departmentId: deptId ? Identifier.create(deptId) : undefined,
            jobTitleId: jobTitleId ? Identifier.create(jobTitleId) : undefined,
            positionId: jobTitleId ? Identifier.create(jobTitleId) : undefined,
          });
          await this.orgAssignmentRepository.update(activeOa);
        }
      }
    }
  }
}
