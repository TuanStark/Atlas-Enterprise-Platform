export interface Organization {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizationUnitType {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface OrganizationUnit {
  id: string;
  organizationId: string;
  parentUnitId?: string | null;
  unitTypeId: string;
  code: string;
  name: string;
  path?: string | null;
  level?: number;
  sortOrder?: number;
  isActive: boolean;
  unitType?: OrganizationUnitType;
  children?: OrganizationUnit[];
}

export interface CreateOrganizationUnitDto {
  organizationId?: string;
  parentUnitId?: string | null;
  unitTypeId: string;
  code: string;
  name: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateOrganizationUnitDto {
  parentUnitId?: string | null;
  unitTypeId?: string;
  code?: string;
  name?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface MoveOrganizationUnitDto {
  parentUnitId: string | null;
}
