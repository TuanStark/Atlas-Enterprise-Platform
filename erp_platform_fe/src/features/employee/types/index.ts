import type { UUID } from '@shared/types';

/**
 * Employee Types — Maps to backend Employee + related models
 *
 * Corresponds to Prisma models:
 * - Employee
 * - EmployeeContact
 * - EmployeeAddress
 * - EmployeeEmergencyContact
 * - EmployeeDocument
 */

export interface Employee {
  id: UUID;
  tenantId: UUID;
  employeeCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  nationality?: string;
  nationalId?: string;
  passportNo?: string;
  taxNumber?: string;
  identificationNumber?: string;
  identificationType?: string;
  taxCode?: string;
  socialInsuranceNumber?: string;
  healthInsuranceNumber?: string;
  maritalStatus?: string;
  photoUrl?: string;
  status: EmployeeStatus;
  joinDate?: string;
  terminationDate?: string;
  terminationReason?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;

  // Relations (loaded conditionally)
  contacts?: EmployeeContact[];
  addresses?: EmployeeAddress[];
  emergencyContacts?: EmployeeEmergencyContact[];
  documents?: EmployeeDocument[];
  employments?: EmploymentSummary[];
}

export type EmployeeStatus = 'probation' | 'active' | 'suspended' | 'resigned' | 'terminated' | 'retired';

export interface EmployeeContact {
  id: UUID;
  type: 'email' | 'phone' | 'mobile' | 'other';
  value: string;
  isPrimary: boolean;
}

export interface EmployeeAddress {
  id: UUID;
  type: 'permanent' | 'temporary' | 'mailing';
  addressLine1: string;
  addressLine2?: string;
  addressLine?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  isPrimary: boolean;
}

export interface EmployeeEmergencyContact {
  id: UUID;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface EmployeeDocument {
  id: UUID;
  type: string;
  name: string;
  fileUrl: string;
  issueDate?: string;
  expiryDate?: string;
  notes?: string;
}

export interface EmploymentSummary {
  id: UUID;
  departmentName: string;
  positionName: string;
  jobTitleName: string;
  employmentType: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
}

export interface CreateEmployeeDto {
  employeeCode?: string;
  employeeNo?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  email?: string;
  phone?: string;
  joinDate?: string;
  departmentId?: string;
  positionId?: string;
  jobTitleId?: string;
  preferredName?: string;
  maritalStatus?: string;
  nationality?: string;
  nationalId?: string;
  passportNo?: string;
  taxNumber?: string;
  addressLine?: string;
  city?: string;
  country?: string;
  createAccount?: boolean;
  password?: string;
  roleId?: string;
}

export interface UpdateEmployeeDto extends Partial<CreateEmployeeDto> {}

/** Filters for employee list query */
export interface EmployeeFilters {
  status?: EmployeeStatus;
  departmentId?: string;
  search?: string;
}
