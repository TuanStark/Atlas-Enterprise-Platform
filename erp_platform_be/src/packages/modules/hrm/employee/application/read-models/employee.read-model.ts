import { Gender, MaritalStatus } from '@prisma/client';

export interface EmployeeReadModel {
  id: string;
  tenantId: string;
  principalId: string;
  employeeNo: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  displayName: string;
  gender?: Gender;
  dateOfBirth?: Date;
  maritalStatus?: MaritalStatus;
  nationality?: string;
  nationalId?: string;
  passportNo?: string;
  taxNumber?: string;
  avatarFileId?: string;
  status: string;
  contacts: EmployeeContactReadModel[];
  addresses: EmployeeAddressReadModel[];
  emergencyContacts: EmployeeEmergencyContactReadModel[];
  documents: EmployeeDocumentReadModel[];
  employments?: {
    id: string;
    departmentName: string;
    positionName: string;
    jobTitleName: string;
    employmentType: string;
    startDate: Date;
    endDate?: Date;
    isCurrent: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeContactReadModel {
  id: string;
  contactType?: string;
  value?: string;
  isPrimary?: boolean;
}

export interface EmployeeAddressReadModel {
  id: string;
  addressType?: string;
  country?: string;
  state?: string;
  city?: string;
  district?: string;
  ward?: string;
  addressLine?: string;
  postalCode?: string;
  isPrimary?: boolean;
}

export interface EmployeeEmergencyContactReadModel {
  id: string;
  fullName?: string;
  relationship?: string;
  phone?: string;
  email?: string;
  address?: string;
  priority?: number;
}

export interface EmployeeDocumentReadModel {
  id: string;
  documentType?: string;
  documentNumber?: string;
  issuedDate?: Date;
  expiryDate?: Date;
  issuedPlace?: string;
  fileId?: string;
}
