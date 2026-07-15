import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import * as repo from '../../domain/repositories/employee.repository';
import {
  SyncEmployeeContactsDto,
  SyncEmployeeAddressesDto,
  SyncEmployeeEmergencyContactsDto,
  SyncEmployeeDocumentsDto,
} from '../dto/employee-child.dto';

// --- Commands ---

export class SyncEmployeeContactsCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly employeeId: Identifier,
    public readonly dto: SyncEmployeeContactsDto,
  ) {}
}

export class SyncEmployeeAddressesCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly employeeId: Identifier,
    public readonly dto: SyncEmployeeAddressesDto,
  ) {}
}

export class SyncEmployeeEmergencyContactsCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly employeeId: Identifier,
    public readonly dto: SyncEmployeeEmergencyContactsDto,
  ) {}
}

export class SyncEmployeeDocumentsCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly employeeId: Identifier,
    public readonly dto: SyncEmployeeDocumentsDto,
  ) {}
}

// --- Handlers ---

@CommandHandler(SyncEmployeeContactsCommand)
export class SyncEmployeeContactsHandler
  extends BaseCommandHandler
  implements ICommandHandler<SyncEmployeeContactsCommand>
{
  constructor(
    @Inject(repo.EMPLOYEE_REPOSITORY)
    private readonly repository: repo.EmployeeRepository,
  ) {
    super();
  }

  async execute(command: SyncEmployeeContactsCommand): Promise<void> {
    const employee = this.ensureFound(
      await this.repository.findById(command.tenantId, command.employeeId),
      'Employee',
      command.employeeId.toString(),
    );

    // Reset contacts and re-add
    // Using standard DDD clear + add pattern
    const contactIdsToDelete = employee.contacts.map((c) => c.id);
    for (const id of contactIdsToDelete) {
      employee.removeContact(id);
    }

    for (const c of command.dto.contacts) {
      employee.addContact({
        contactType: c.contactType,
        value: c.value,
        isPrimary: c.isPrimary,
      });
    }

    await this.repository.update(employee);
  }
}

@CommandHandler(SyncEmployeeAddressesCommand)
export class SyncEmployeeAddressesHandler
  extends BaseCommandHandler
  implements ICommandHandler<SyncEmployeeAddressesCommand>
{
  constructor(
    @Inject(repo.EMPLOYEE_REPOSITORY)
    private readonly repository: repo.EmployeeRepository,
  ) {
    super();
  }

  async execute(command: SyncEmployeeAddressesCommand): Promise<void> {
    const employee = this.ensureFound(
      await this.repository.findById(command.tenantId, command.employeeId),
      'Employee',
      command.employeeId.toString(),
    );

    const addressIdsToDelete = employee.addresses.map((a) => a.id);
    for (const id of addressIdsToDelete) {
      employee.removeAddress(id);
    }

    for (const a of command.dto.addresses) {
      employee.addAddress({
        addressType: a.addressType,
        country: a.country,
        state: a.state,
        city: a.city,
        district: a.district,
        ward: a.ward,
        addressLine: a.addressLine,
        postalCode: a.postalCode,
        isPrimary: a.isPrimary,
      });
    }

    await this.repository.update(employee);
  }
}

@CommandHandler(SyncEmployeeEmergencyContactsHandler)
export class SyncEmployeeEmergencyContactsHandler
  extends BaseCommandHandler
  implements ICommandHandler<SyncEmployeeEmergencyContactsCommand>
{
  constructor(
    @Inject(repo.EMPLOYEE_REPOSITORY)
    private readonly repository: repo.EmployeeRepository,
  ) {
    super();
  }

  async execute(command: SyncEmployeeEmergencyContactsCommand): Promise<void> {
    const employee = this.ensureFound(
      await this.repository.findById(command.tenantId, command.employeeId),
      'Employee',
      command.employeeId.toString(),
    );

    const contactIdsToDelete = employee.emergencyContacts.map((c) => c.id);
    for (const id of contactIdsToDelete) {
      employee.removeEmergencyContact(id);
    }

    for (const c of command.dto.emergencyContacts) {
      employee.addEmergencyContact({
        fullName: c.fullName,
        relationship: c.relationship,
        phone: c.phone,
        email: c.email,
        address: c.address,
        priority: c.priority,
      });
    }

    await this.repository.update(employee);
  }
}

@CommandHandler(SyncEmployeeDocumentsHandler)
export class SyncEmployeeDocumentsHandler
  extends BaseCommandHandler
  implements ICommandHandler<SyncEmployeeDocumentsCommand>
{
  constructor(
    @Inject(repo.EMPLOYEE_REPOSITORY)
    private readonly repository: repo.EmployeeRepository,
  ) {
    super();
  }

  async execute(command: SyncEmployeeDocumentsCommand): Promise<void> {
    const employee = this.ensureFound(
      await this.repository.findById(command.tenantId, command.employeeId),
      'Employee',
      command.employeeId.toString(),
    );

    const docIdsToDelete = employee.documents.map((d) => d.id);
    for (const id of docIdsToDelete) {
      employee.removeDocument(id);
    }

    for (const d of command.dto.documents) {
      employee.addDocument({
        documentType: d.documentType,
        documentNumber: d.documentNumber,
        issuedDate: d.issuedDate ? new Date(d.issuedDate) : undefined,
        expiryDate: d.expiryDate ? new Date(d.expiryDate) : undefined,
        issuedPlace: d.issuedPlace,
        fileId: d.fileId,
      });
    }

    await this.repository.update(employee);
  }
}
