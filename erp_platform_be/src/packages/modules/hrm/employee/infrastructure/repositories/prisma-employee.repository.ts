import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Employee } from '../../domain/aggregates/employee.aggregate';
import { EmployeeRepository } from '../../domain/repositories/employee.repository';
import { EmployeePersistenceMapper } from '../mappers/employee.persistence.mapper';

@Injectable()
export class PrismaEmployeeRepository implements EmployeeRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    employeeContacts: true,
    employeeAddresses: true,
    employeeEmergencyContacts: true,
    employeeDocuments: true,
  };

  async save(employee: Employee): Promise<void> {
    const data = EmployeePersistenceMapper.toPersistence(employee);

    await this.prisma.employee.create({
      data: {
        ...data,
        employeeContacts: {
          create: employee.contacts.map((c) => ({
            id: c.id.toString(),
            contactType: c.contactType,
            value: c.value,
            isPrimary: c.isPrimary,
            verifiedAt: c.verifiedAt,
            createdAt: c.createdAt,
          })),
        },
        employeeAddresses: {
          create: employee.addresses.map((a) => ({
            id: a.id.toString(),
            addressType: a.addressType,
            country: a.country,
            state: a.state,
            city: a.city,
            district: a.district,
            ward: a.ward,
            addressLine: a.addressLine,
            postalCode: a.postalCode,
            isPrimary: a.isPrimary,
            createdAt: a.createdAt,
          })),
        },
        employeeEmergencyContacts: {
          create: employee.emergencyContacts.map((ec) => ({
            id: ec.id.toString(),
            fullName: ec.fullName,
            relationship: ec.relationship,
            phone: ec.phone,
            email: ec.email,
            address: ec.address,
            priority: ec.priority,
            createdAt: ec.createdAt,
          })),
        },
        employeeDocuments: {
          create: employee.documents.map((d) => ({
            id: d.id.toString(),
            documentType: d.documentType,
            documentNumber: d.documentNumber,
            issuedDate: d.issuedDate,
            expiryDate: d.expiryDate,
            issuedPlace: d.issuedPlace,
            fileId: d.fileId,
            createdAt: d.createdAt,
          })),
        },
      },
    });
  }

  async update(employee: Employee): Promise<void> {
    const data = EmployeePersistenceMapper.toPersistence(employee);

    await this.prisma.$transaction(async (tx) => {
      // Update employee core data
      await tx.employee.update({
        where: { id: data.id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          preferredName: data.preferredName,
          gender: data.gender,
          dateOfBirth: data.dateOfBirth,
          maritalStatus: data.maritalStatus,
          nationality: data.nationality,
          nationalId: data.nationalId,
          passportNo: data.passportNo,
          taxNumber: data.taxNumber,
          avatarFileId: data.avatarFileId,
          status: data.status,
          metadata: data.metadata,
          updatedAt: data.updatedAt,
          deletedAt: data.deletedAt,
        },
      });

      // Sync contacts: delete all, re-create
      await tx.employeeContact.deleteMany({ where: { employeeId: data.id } });
      if (employee.contacts.length > 0) {
        await tx.employeeContact.createMany({
          data: employee.contacts.map((c) => ({
            id: c.id.toString(),
            employeeId: data.id,
            contactType: c.contactType,
            value: c.value,
            isPrimary: c.isPrimary,
            verifiedAt: c.verifiedAt,
            createdAt: c.createdAt,
          })),
        });
      }

      // Sync addresses
      await tx.employeeAddress.deleteMany({ where: { employeeId: data.id } });
      if (employee.addresses.length > 0) {
        await tx.employeeAddress.createMany({
          data: employee.addresses.map((a) => ({
            id: a.id.toString(),
            employeeId: data.id,
            addressType: a.addressType,
            country: a.country,
            state: a.state,
            city: a.city,
            district: a.district,
            ward: a.ward,
            addressLine: a.addressLine,
            postalCode: a.postalCode,
            isPrimary: a.isPrimary,
            createdAt: a.createdAt,
          })),
        });
      }

      // Sync emergency contacts
      await tx.employeeEmergencyContact.deleteMany({ where: { employeeId: data.id } });
      if (employee.emergencyContacts.length > 0) {
        await tx.employeeEmergencyContact.createMany({
          data: employee.emergencyContacts.map((ec) => ({
            id: ec.id.toString(),
            employeeId: data.id,
            fullName: ec.fullName,
            relationship: ec.relationship,
            phone: ec.phone,
            email: ec.email,
            address: ec.address,
            priority: ec.priority,
            createdAt: ec.createdAt,
          })),
        });
      }

      // Sync documents
      await tx.employeeDocument.deleteMany({ where: { employeeId: data.id } });
      if (employee.documents.length > 0) {
        await tx.employeeDocument.createMany({
          data: employee.documents.map((d) => ({
            id: d.id.toString(),
            employeeId: data.id,
            documentType: d.documentType,
            documentNumber: d.documentNumber,
            issuedDate: d.issuedDate,
            expiryDate: d.expiryDate,
            issuedPlace: d.issuedPlace,
            fileId: d.fileId,
            createdAt: d.createdAt,
          })),
        });
      }
    });
  }

  async delete(employee: Employee): Promise<void> {
    await this.prisma.employee.update({
      where: { id: employee.id.toString() },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<Employee | null> {
    const record = await this.prisma.employee.findFirst({
      where: {
        id: id.toString(),
        tenantId: tenantId.toString(),
        deletedAt: null,
      },
      include: this.includeRelations,
    });

    return record ? EmployeePersistenceMapper.toDomain(record) : null;
  }

  async findByEmployeeNo(tenantId: Identifier, employeeNo: string): Promise<Employee | null> {
    const record = await this.prisma.employee.findFirst({
      where: {
        tenantId: tenantId.toString(),
        employeeNo,
        deletedAt: null,
      },
      include: this.includeRelations,
    });

    return record ? EmployeePersistenceMapper.toDomain(record) : null;
  }

  async existsByEmployeeNo(tenantId: Identifier, employeeNo: string): Promise<boolean> {
    const count = await this.prisma.employee.count({
      where: {
        tenantId: tenantId.toString(),
        employeeNo,
        deletedAt: null,
      },
    });

    return count > 0;
  }

  async findAll(tenantId: Identifier): Promise<Employee[]> {
    const records = await this.prisma.employee.findMany({
      where: {
        tenantId: tenantId.toString(),
        deletedAt: null,
      },
      include: this.includeRelations,
      orderBy: { createdAt: 'desc' },
    });

    return records.map(EmployeePersistenceMapper.toDomain);
  }
}
