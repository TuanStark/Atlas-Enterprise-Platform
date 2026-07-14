import { Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ORGANIZATION_ASSIGNMENT_REPOSITORY } from '@core/organization/domain/repositories/organization-assignment.repository';
import type { OrganizationAssignmentRepository } from '@core/organization/domain/repositories/organization-assignment.repository';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

// Get
export class GetOrganizationAssignmentQuery {
  constructor(
    public readonly tenantId: string,
    public readonly id: string,
  ) {}
}

@QueryHandler(GetOrganizationAssignmentQuery)
export class GetOrganizationAssignmentHandler implements IQueryHandler<GetOrganizationAssignmentQuery> {
  constructor(
    @Inject(ORGANIZATION_ASSIGNMENT_REPOSITORY)
    private readonly repository: OrganizationAssignmentRepository,
  ) {}

  async execute(query: GetOrganizationAssignmentQuery) {
    return this.repository.findById(Identifier.create(query.tenantId), Identifier.create(query.id));
  }
}

// List
export class ListOrganizationAssignmentsQuery {
  constructor(public readonly tenantId: string) {}
}

@QueryHandler(ListOrganizationAssignmentsQuery)
export class ListOrganizationAssignmentsHandler implements IQueryHandler<ListOrganizationAssignmentsQuery> {
  constructor(
    @Inject(ORGANIZATION_ASSIGNMENT_REPOSITORY)
    private readonly repository: OrganizationAssignmentRepository,
  ) {}

  async execute(query: ListOrganizationAssignmentsQuery) {
    return this.repository.findAll(Identifier.create(query.tenantId));
  }
}

// List by Employment
export class ListAssignmentsByEmploymentQuery {
  constructor(
    public readonly tenantId: string,
    public readonly employmentId: string,
  ) {}
}

@QueryHandler(ListAssignmentsByEmploymentQuery)
export class ListAssignmentsByEmploymentHandler implements IQueryHandler<ListAssignmentsByEmploymentQuery> {
  constructor(
    @Inject(ORGANIZATION_ASSIGNMENT_REPOSITORY)
    private readonly repository: OrganizationAssignmentRepository,
  ) {}

  async execute(query: ListAssignmentsByEmploymentQuery) {
    return this.repository.findByEmploymentId(
      Identifier.create(query.tenantId),
      Identifier.create(query.employmentId),
    );
  }
}
