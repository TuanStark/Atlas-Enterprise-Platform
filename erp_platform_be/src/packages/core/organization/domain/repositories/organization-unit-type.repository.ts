import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { OrganizationUnitType } from '../entities/organization-unit-type';

export const ORGANIZATION_UNIT_TYPE_REPOSITORY = Symbol('ORGANIZATION_UNIT_TYPE_REPOSITORY');

export interface OrganizationUnitTypeRepository {
  save(type: OrganizationUnitType): Promise<void>;
  update(type: OrganizationUnitType): Promise<void>;
  delete(type: OrganizationUnitType): Promise<void>;
  findById(organizationId: Identifier, id: Identifier): Promise<OrganizationUnitType | null>;
  findByCode(organizationId: Identifier, code: string): Promise<OrganizationUnitType | null>;
  existsByCode(organizationId: Identifier, code: string): Promise<boolean>;
  findAll(organizationId: Identifier): Promise<OrganizationUnitType[]>;
}
