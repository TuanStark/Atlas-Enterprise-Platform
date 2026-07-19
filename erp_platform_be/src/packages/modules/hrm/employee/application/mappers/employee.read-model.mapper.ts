import { Employee } from '../../domain/aggregates/employee.aggregate';
import { EmployeeReadModel } from '../read-models/employee.read-model';

export class EmployeeReadModelMapper {
  static toReadModel(
    employee: Employee,
    employments?: {
      id: string;
      departmentId?: string;
      jobTitleId?: string;
      positionId?: string;
      departmentName: string;
      positionName: string;
      jobTitleName: string;
      employmentType: string;
      startDate: Date;
      endDate?: Date;
      isCurrent: boolean;
      status?: string;
    }[],
  ): EmployeeReadModel {
    const primaryEmail = employee.contacts.find(
      (c) => c.contactType === 'email' && c.isPrimary,
    )?.value;
    const primaryPhone = employee.contacts.find(
      (c) => (c.contactType === 'phone' || c.contactType === 'mobile') && c.isPrimary,
    )?.value;
    const currentEmployment = employments?.find((e) => e.isCurrent) || employments?.[0];
    const joinDate = currentEmployment?.startDate;

    return {
      id: employee.id.toString(),
      tenantId: employee.tenantId.toString(),
      principalId: employee.principalId.toString(),
      employeeNo: employee.employeeNo.getValue(),
      firstName: employee.fullName.firstName,
      lastName: employee.fullName.lastName,
      preferredName: employee.fullName.preferredName,
      displayName: employee.fullName.getDisplayName(),
      gender: employee.personalInfo.gender,
      dateOfBirth: employee.personalInfo.dateOfBirth,
      maritalStatus: employee.personalInfo.maritalStatus,
      nationality: employee.personalInfo.nationality,
      nationalId: employee.personalInfo.nationalId,
      passportNo: employee.personalInfo.passportNo,
      taxNumber: employee.personalInfo.taxNumber,
      avatarFileId: employee.avatarFileId,
      status: employee.status,
      email: primaryEmail,
      phone: primaryPhone,
      joinDate: joinDate,
      contacts: employee.contacts.map((c) => ({
        id: c.id.toString(),
        contactType: c.contactType,
        value: c.value,
        isPrimary: c.isPrimary,
      })),
      addresses: employee.addresses.map((a) => ({
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
      })),
      emergencyContacts: employee.emergencyContacts.map((ec) => ({
        id: ec.id.toString(),
        fullName: ec.fullName,
        relationship: ec.relationship,
        phone: ec.phone,
        email: ec.email,
        address: ec.address,
        priority: ec.priority,
      })),
      documents: employee.documents.map((d) => ({
        id: d.id.toString(),
        documentType: d.documentType,
        documentNumber: d.documentNumber,
        issuedDate: d.issuedDate,
        expiryDate: d.expiryDate,
        issuedPlace: d.issuedPlace,
        fileId: d.fileId,
      })),
      employments,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
    };
  }
}
