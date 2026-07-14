import { Inject } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ORGANIZATION_UNIT_REPOSITORY } from '@core/organization/domain/repositories/organization-unit.repository';
import type { OrganizationUnitRepository } from '@core/organization/domain/repositories/organization-unit.repository';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

// Get
export class GetOrganizationUnitQuery {
  constructor(
    public readonly orgId: string,
    public readonly id: string,
  ) {}
}

@QueryHandler(GetOrganizationUnitQuery)
export class GetOrganizationUnitHandler implements IQueryHandler<GetOrganizationUnitQuery> {
  constructor(
    @Inject(ORGANIZATION_UNIT_REPOSITORY)
    private readonly repository: OrganizationUnitRepository,
  ) {}

  async execute(query: GetOrganizationUnitQuery) {
    return this.repository.findById(Identifier.create(query.orgId), Identifier.create(query.id));
  }
}

// List
export class ListOrganizationUnitsQuery {
  constructor(public readonly orgId: string) {}
}

@QueryHandler(ListOrganizationUnitsQuery)
export class ListOrganizationUnitsHandler implements IQueryHandler<ListOrganizationUnitsQuery> {
  constructor(
    @Inject(ORGANIZATION_UNIT_REPOSITORY)
    private readonly repository: OrganizationUnitRepository,
  ) {}

  async execute(query: ListOrganizationUnitsQuery) {
    return this.repository.findAll(Identifier.create(query.orgId));
  }
}

// Get Tree
export class GetOrganizationUnitTreeQuery {
  constructor(public readonly orgId: string) {}
}

export interface OrganizationUnitTreeNode {
  id: string;
  code: string;
  name: string;
  unitTypeId: string;
  level: number;
  sortOrder: number;
  isActive: boolean;
  children: OrganizationUnitTreeNode[];
}

@QueryHandler(GetOrganizationUnitTreeQuery)
export class GetOrganizationUnitTreeHandler implements IQueryHandler<GetOrganizationUnitTreeQuery> {
  constructor(
    @Inject(ORGANIZATION_UNIT_REPOSITORY)
    private readonly repository: OrganizationUnitRepository,
  ) {}

  async execute(query: GetOrganizationUnitTreeQuery): Promise<OrganizationUnitTreeNode[]> {
    const orgId = Identifier.create(query.orgId);
    const units = await this.repository.findAll(orgId);

    const nodesMap = new Map<string, OrganizationUnitTreeNode>();
    const roots: OrganizationUnitTreeNode[] = [];

    // Initialize all nodes
    for (const u of units) {
      nodesMap.set(u.id.getValue(), {
        id: u.id.getValue(),
        code: u.code,
        name: u.name,
        unitTypeId: u.unitTypeId.getValue(),
        level: u.level,
        sortOrder: u.sortOrder,
        isActive: u.isActive,
        children: [],
      });
    }

    // Build the tree
    for (const u of units) {
      const node = nodesMap.get(u.id.getValue())!;
      const parentId = u.parentUnitId?.getValue();

      if (parentId && nodesMap.has(parentId)) {
        const parentNode = nodesMap.get(parentId)!;
        parentNode.children.push(node);
      } else {
        roots.push(node);
      }
    }

    // Sort by sortOrder
    const sortNodes = (nodes: OrganizationUnitTreeNode[]) => {
      nodes.sort((a, b) => a.sortOrder - b.sortOrder);
      for (const n of nodes) {
        sortNodes(n.children);
      }
    };

    sortNodes(roots);
    return roots;
  }
}
