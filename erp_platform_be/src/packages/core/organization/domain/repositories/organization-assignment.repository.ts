import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { OrganizationAssignment } from '../entities/organization-assignment';

export const ORGANIZATION_ASSIGNMENT_REPOSITORY = Symbol('ORGANIZATION_ASSIGNMENT_REPOSITORY');

export interface OrganizationAssignmentRepository {
  save(assignment: OrganizationAssignment): Promise<void>;
  update(assignment: OrganizationAssignment): Promise<void>;
  delete(assignment: OrganizationAssignment): Promise<void>;
  findById(tenantId: Identifier, id: Identifier): Promise<OrganizationAssignment | null>;
  findByEmploymentId(
    tenantId: Identifier,
    employmentId: Identifier,
  ): Promise<OrganizationAssignment[]>;
  findAll(tenantId: Identifier): Promise<OrganizationAssignment[]>;
}
