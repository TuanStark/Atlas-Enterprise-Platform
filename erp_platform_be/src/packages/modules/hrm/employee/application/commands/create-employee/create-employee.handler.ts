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

    return employee.id;
  }
}
