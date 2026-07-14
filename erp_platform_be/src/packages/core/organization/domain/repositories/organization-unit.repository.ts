import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { OrganizationUnit } from '../entities/organization-unit';

export const ORGANIZATION_UNIT_REPOSITORY = Symbol('ORGANIZATION_UNIT_REPOSITORY');

export interface OrganizationUnitRepository {
  save(unit: OrganizationUnit): Promise<void>;
  update(unit: OrganizationUnit): Promise<void>;
  delete(unit: OrganizationUnit): Promise<void>;
  findById(organizationId: Identifier, id: Identifier): Promise<OrganizationUnit | null>;
  findByCode(organizationId: Identifier, code: string): Promise<OrganizationUnit | null>;
  existsByCode(organizationId: Identifier, code: string): Promise<boolean>;
  findAll(organizationId: Identifier): Promise<OrganizationUnit[]>;
  findRootUnits(organizationId: Identifier): Promise<OrganizationUnit[]>;
  findChildren(organizationId: Identifier, parentUnitId: Identifier): Promise<OrganizationUnit[]>;
  findParent(organizationId: Identifier, unitId: Identifier): Promise<OrganizationUnit | null>;
  findDescendants(organizationId: Identifier, unitId: Identifier): Promise<OrganizationUnit[]>;
  existsChildWithName(
    organizationId: Identifier,
    parentUnitId: Identifier | null,
    name: string,
  ): Promise<boolean>;
}
