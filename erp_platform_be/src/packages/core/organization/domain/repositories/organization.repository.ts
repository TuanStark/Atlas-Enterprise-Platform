import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Organization } from '../entities/organization';
import { OrganizationCode } from '../value-objects/organization-code';

export const ORGANIZATION_REPOSITORY = Symbol('ORGANIZATION_REPOSITORY');

export interface OrganizationRepository {
  save(organization: Organization): Promise<void>;
  update(organization: Organization): Promise<void>;
  delete(organization: Organization): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<Organization | null>;
  findByCode(tenantId: Identifier, code: OrganizationCode): Promise<Organization | null>;
  existsByCode(tenantId: Identifier, code: OrganizationCode): Promise<boolean>;
  findAll(tenantId: Identifier): Promise<Organization[]>;
}
