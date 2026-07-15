import {
  Employee as PrismaEmployee,
  EmployeeContact as PrismaContact,
  EmployeeAddress as PrismaAddress,
  EmployeeEmergencyContact as PrismaEmergencyContact,
  EmployeeDocument as PrismaDocument,
} from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Employee } from '../../domain/aggregates/employee.aggregate';
import {
  EmployeeNumber,
  FullName,
  PersonalInformation,
  EmployeeStatus,
} from '../../domain/value-objects';
import { EmployeeContact } from '../../domain/entities/employee-contact.entity';
import { EmployeeAddress } from '../../domain/entities/employee-address.entity';
import { EmployeeEmergencyContact } from '../../domain/entities/employee-emergency-contact.entity';
import { EmployeeDocument } from '../../domain/entities/employee-document.entity';

export type PrismaEmployeePayload = PrismaEmployee & {
  employeeContacts?: PrismaContact[];
  employeeAddresses?: PrismaAddress[];
  employeeEmergencyContacts?: PrismaEmergencyContact[];
  employeeDocuments?: PrismaDocument[];
};

export class EmployeePersistenceMapper {
  static toDomain(prisma: PrismaEmployeePayload): Employee {
    const employeeId = Identifier.create(prisma.id);

    return Employee.rehydrate(employeeId, {
      tenantId: Identifier.create(prisma.tenantId),
      principalId: Identifier.create(prisma.principalId),
      employeeNo: EmployeeNumber.create(prisma.employeeNo),
      fullName: FullName.create(
        prisma.firstName,
        prisma.lastName,
        prisma.preferredName ?? undefined,
      ),
      personalInfo: PersonalInformation.create({
        gender: prisma.gender ?? undefined,
        dateOfBirth: prisma.dateOfBirth ?? undefined,
        maritalStatus: prisma.maritalStatus ?? undefined,
        nationality: prisma.nationality ?? undefined,
        nationalId: prisma.nationalId ?? undefined,
        passportNo: prisma.passportNo ?? undefined,
        taxNumber: prisma.taxNumber ?? undefined,
      }),
      avatarFileId: prisma.avatarFileId ?? undefined,
      status: (prisma.status as EmployeeStatus) ?? EmployeeStatus.ACTIVE,
      metadata: prisma.metadata as Record<string, unknown> | undefined,
      contacts: (prisma.employeeContacts ?? []).map((c) =>
        EmployeeContact.rehydrate(Identifier.create(c.id), {
          employeeId,
          contactType: c.contactType ?? undefined,
          value: c.value ?? undefined,
          isPrimary: c.isPrimary ?? false,
          verifiedAt: c.verifiedAt ?? undefined,
          createdAt: c.createdAt ?? undefined,
        }),
      ),
      addresses: (prisma.employeeAddresses ?? []).map((a) =>
        EmployeeAddress.rehydrate(Identifier.create(a.id), {
          employeeId,
          addressType: a.addressType ?? undefined,
          country: a.country ?? undefined,
          state: a.state ?? undefined,
          city: a.city ?? undefined,
          district: a.district ?? undefined,
          ward: a.ward ?? undefined,
          addressLine: a.addressLine ?? undefined,
          postalCode: a.postalCode ?? undefined,
          isPrimary: a.isPrimary ?? false,
          createdAt: a.createdAt ?? undefined,
        }),
      ),
      emergencyContacts: (prisma.employeeEmergencyContacts ?? []).map((ec) =>
        EmployeeEmergencyContact.rehydrate(Identifier.create(ec.id), {
          employeeId,
          fullName: ec.fullName ?? undefined,
          relationship: ec.relationship ?? undefined,
          phone: ec.phone ?? undefined,
          email: ec.email ?? undefined,
          address: ec.address ?? undefined,
          priority: ec.priority ?? undefined,
          createdAt: ec.createdAt ?? undefined,
        }),
      ),
      documents: (prisma.employeeDocuments ?? []).map((d) =>
        EmployeeDocument.rehydrate(Identifier.create(d.id), {
          employeeId,
          documentType: d.documentType ?? undefined,
          documentNumber: d.documentNumber ?? undefined,
          issuedDate: d.issuedDate ?? undefined,
          expiryDate: d.expiryDate ?? undefined,
          issuedPlace: d.issuedPlace ?? undefined,
          fileId: d.fileId ?? undefined,
          createdAt: d.createdAt ?? undefined,
        }),
      ),
      createdAt: prisma.createdAt ?? new Date(),
      updatedAt: prisma.updatedAt ?? new Date(),
      deletedAt: prisma.deletedAt ?? undefined,
    });
  }

  static toPersistence(entity: Employee) {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      principalId: entity.principalId.toString(),
      employeeNo: entity.employeeNo.getValue(),
      firstName: entity.fullName.firstName,
      lastName: entity.fullName.lastName,
      preferredName: entity.fullName.preferredName,
      gender: entity.personalInfo.gender,
      dateOfBirth: entity.personalInfo.dateOfBirth,
      maritalStatus: entity.personalInfo.maritalStatus,
      nationality: entity.personalInfo.nationality,
      nationalId: entity.personalInfo.nationalId,
      passportNo: entity.personalInfo.passportNo,
      taxNumber: entity.personalInfo.taxNumber,
      avatarFileId: entity.avatarFileId,
      status: entity.status,
      metadata: entity.metadata as any,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
    };
  }
}
