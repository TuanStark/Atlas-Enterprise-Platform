import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateEmployeeCommand } from './update-employee.command';
import { BaseCommandHandler } from '@shared-kernel/application';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import * as employeeRepo from '../../../domain/repositories/employee.repository';

@CommandHandler(UpdateEmployeeCommand)
export class UpdateEmployeeHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdateEmployeeCommand>
{
  constructor(
    @Inject(employeeRepo.EMPLOYEE_REPOSITORY)
    private readonly repository: employeeRepo.EmployeeRepository,
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
      employee.changeAvatar(dto.avatarFileId);
    }

    // Link existing Principal / User account if provided
    if (dto.principalId !== undefined) {
      employee.linkPrincipal(Identifier.create(dto.principalId));
    }

    await this.repository.update(employee);
  }
}
