import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Employee } from '../../domain/aggregates/employee.aggregate';
import { EmployeeRepository } from '../../domain/repositories/employee.repository';
import { EmployeePersistenceMapper } from '../mappers/employee.persistence.mapper';

@Injectable()
export class PrismaEmployeeRepository implements EmployeeRepository {
  constructor(private readonly prisma: PrismaService) { }

  private readonly includeRelations = {
    principal: true,
    employeeContacts: true,
    employeeAddresses: true,
    employeeEmergencyContacts: true,
    employeeDocuments: true,
  };

  async save(employee: Employee): Promise<void> {
    const data = EmployeePersistenceMapper.toPersistence(employee);

    await this.prisma.$transaction(async (tx) => {
      await tx.employee.create({
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

      if (employee.avatarFileId) {
        await tx.principal.update({
          where: { id: employee.principalId.getValue() },
          data: { avatarFileId: employee.avatarFileId },
        });
      }
    });
  }

  async update(employee: Employee): Promise<void> {
    const data = EmployeePersistenceMapper.toPersistence(employee);

    await this.prisma.$transaction(async (tx) => {
      // Update employee core data
      await tx.employee.update({
        where: { id: data.id },
        data: {
          principalId: data.principalId,
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
          status: data.status,
          metadata: data.metadata,
          updatedAt: data.updatedAt,
          deletedAt: data.deletedAt,
        },
      });

      await tx.principal.update({
        where: { id: employee.principalId.getValue() },
        data: {
          displayName: `${employee.fullName.firstName} ${employee.fullName.lastName}`.trim(),
          avatarFileId: employee.avatarFileId || null,
          status: employee.status.toString().toLowerCase().includes('active') ? 'active' : 'inactive',
        },
      });

      const existingUser = await tx.user.findFirst({
        where: { principalId: employee.principalId.getValue() },
      });
      if (existingUser) {
        const primaryEmail = employee.contacts.find((c) => c.contactType === 'email' && c.isPrimary);
        const primaryPhone = employee.contacts.find(
          (c) => (c.contactType === 'phone' || c.contactType === 'mobile') && c.isPrimary,
        );
        await tx.user.update({
          where: { id: existingUser.id },
          data: {
            email: primaryEmail?.value || existingUser.email,
            username: primaryEmail?.value || existingUser.username,
            phone: primaryPhone?.value || null,
          },
        });
      }

      await tx.employeeContact.deleteMany({ where: { employeeId: data.id } });
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

  async findEmploymentsByEmployeeIds(tenantId: Identifier, employeeIds: string[]): Promise<any[]> {
    const empRecords = await this.prisma.employment.findMany({
      where: {
        employeeId: { in: employeeIds },
        tenantId: tenantId.toString(),
        deletedAt: null,
      },
      include: {
        employmentType: true,
        organizationAssignments: {
          include: {
            department: true,
            position: true,
            jobTitle: true,
          },
        },
      },
    });

    return empRecords.map((e) => {
      const activeOa =
        e.organizationAssignments.find((oa) => oa.status === 'active') ||
        e.organizationAssignments[0];
      const deptName = activeOa?.department?.name || '-';
      const posName = activeOa?.position?.name || activeOa?.jobTitle?.name || '-';

      return {
        id: e.id,
        employeeId: e.employeeId,
        departmentId: activeOa?.departmentId || undefined,
        jobTitleId: activeOa?.jobTitleId || undefined,
        positionId: activeOa?.positionId || undefined,
        departmentName: deptName,
        positionName: posName,
        jobTitleName: posName,
        employmentType: e.employmentType?.name || 'Standard',
        startDate: e.hireDate,
        endDate: e.terminationDate ?? undefined,
        isCurrent: e.status === 'active' || e.status === 'probation',
        status: e.status,
      };
    });
  }
}
