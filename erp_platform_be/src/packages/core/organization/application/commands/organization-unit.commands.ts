import { HttpStatus, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  CreateOrganizationUnitDto,
  UpdateOrganizationUnitDto,
  MoveOrganizationUnitDto,
} from '@core/organization/dto';
import { ORGANIZATION_UNIT_REPOSITORY } from '@core/organization/domain/repositories/organization-unit.repository';
import type { OrganizationUnitRepository } from '@core/organization/domain/repositories/organization-unit.repository';
import { OrganizationUnit } from '@core/organization/domain/entities/organization-unit';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Result } from '@shared-kernel/application';

// Create
export class CreateOrganizationUnitCommand {
  constructor(public readonly dto: CreateOrganizationUnitDto) {}
}

@CommandHandler(CreateOrganizationUnitCommand)
export class CreateOrganizationUnitHandler implements ICommandHandler<CreateOrganizationUnitCommand> {
  constructor(
    @Inject(ORGANIZATION_UNIT_REPOSITORY)
    private readonly repository: OrganizationUnitRepository,
  ) {}

  async execute(command: CreateOrganizationUnitCommand): Promise<Result<string>> {
    const { dto } = command;
    const orgId = Identifier.create(dto.organizationId);

    const codeExists = await this.repository.existsByCode(orgId, dto.code);
    if (codeExists) {
      return Result.failure({
        statusCode: HttpStatus.CONFLICT,
        code: 'ORGANIZATION_UNIT_CODE_EXISTS',
        message: 'Organization unit code already exists.',
      });
    }

    const parentUnitId = dto.parentUnitId ? Identifier.create(dto.parentUnitId) : null;

    const nameExists = await this.repository.existsChildWithName(orgId, parentUnitId, dto.name);
    if (nameExists) {
      return Result.failure({
        statusCode: HttpStatus.CONFLICT,
        code: 'ORGANIZATION_UNIT_NAME_EXISTS',
        message: 'A sibling unit with this name already exists.',
      });
    }

    const unitId = Identifier.create();
    let level = 0;
    let path = `/${unitId.getValue()}`;

    if (parentUnitId) {
      const parent = await this.repository.findById(orgId, parentUnitId);
      if (!parent) {
        return Result.failure({
          statusCode: HttpStatus.NOT_FOUND,
          code: 'PARENT_UNIT_NOT_FOUND',
          message: 'Parent unit not found.',
        });
      }
      level = parent.level + 1;
      path = `${parent.path}/${unitId.getValue()}`;
    }

    const unit = OrganizationUnit.rehydrate(unitId, {
      organizationId: orgId,
      parentUnitId: parentUnitId ?? undefined,
      unitTypeId: Identifier.create(dto.unitTypeId),
      code: dto.code,
      name: dto.name,
      path,
      level,
      sortOrder: dto.sortOrder ?? 0,
      metadata: dto.metadata,
      isActive: dto.isActive ?? true,
      version: 1,
    });

    await this.repository.save(unit);
    return Result.success(unit.id.getValue(), {
      statusCode: HttpStatus.CREATED,
    });
  }
}

// Update
export class UpdateOrganizationUnitCommand {
  constructor(
    public readonly orgId: string,
    public readonly id: string,
    public readonly dto: UpdateOrganizationUnitDto,
  ) {}
}

@CommandHandler(UpdateOrganizationUnitCommand)
export class UpdateOrganizationUnitHandler implements ICommandHandler<UpdateOrganizationUnitCommand> {
  constructor(
    @Inject(ORGANIZATION_UNIT_REPOSITORY)
    private readonly repository: OrganizationUnitRepository,
  ) {}

  async execute(command: UpdateOrganizationUnitCommand): Promise<Result<void>> {
    const { orgId, id, dto } = command;
    const organizationId = Identifier.create(orgId);
    const unitId = Identifier.create(id);

    const unit = await this.repository.findById(organizationId, unitId);
    if (!unit) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: 'ORGANIZATION_UNIT_NOT_FOUND',
        message: 'Organization unit not found.',
      });
    }

    if (dto.name && dto.name !== unit.name) {
      const parentUnitId = unit.parentUnitId ?? null;
      const nameExists = await this.repository.existsChildWithName(
        organizationId,
        parentUnitId,
        dto.name,
      );
      if (nameExists) {
        return Result.failure({
          statusCode: HttpStatus.CONFLICT,
          code: 'ORGANIZATION_UNIT_NAME_EXISTS',
          message: 'A sibling unit with this name already exists.',
        });
      }
      unit.rename(dto.name);
    }

    if (dto.sortOrder !== undefined) {
      unit.changeSortOrder(dto.sortOrder);
    }
    if (dto.metadata !== undefined) {
      unit.changeMetadata(dto.metadata);
    }
    if (dto.isActive !== undefined) {
      if (dto.isActive) {
        unit.activate();
      } else {
        unit.deactivate();
      }
    }

    await this.repository.update(unit);
    return Result.success(undefined, {
      statusCode: HttpStatus.OK,
    });
  }
}

// Delete
export class DeleteOrganizationUnitCommand {
  constructor(
    public readonly orgId: string,
    public readonly id: string,
  ) {}
}

@CommandHandler(DeleteOrganizationUnitCommand)
export class DeleteOrganizationUnitHandler implements ICommandHandler<DeleteOrganizationUnitCommand> {
  constructor(
    @Inject(ORGANIZATION_UNIT_REPOSITORY)
    private readonly repository: OrganizationUnitRepository,
  ) {}

  async execute(command: DeleteOrganizationUnitCommand): Promise<Result<void>> {
    const { orgId, id } = command;
    const organizationId = Identifier.create(orgId);
    const unitId = Identifier.create(id);

    const unit = await this.repository.findById(organizationId, unitId);
    if (!unit) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: 'ORGANIZATION_UNIT_NOT_FOUND',
        message: 'Organization unit not found.',
      });
    }

    // Check if it has active child units
    const children = await this.repository.findChildren(organizationId, unitId);
    if (children.length > 0) {
      return Result.failure({
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'ORGANIZATION_UNIT_HAS_CHILDREN',
        message: 'Cannot delete a unit that contains sub-units.',
      });
    }

    await this.repository.delete(unit);
    return Result.success(undefined, {
      statusCode: HttpStatus.OK,
    });
  }
}

// Move
export class MoveOrganizationUnitCommand {
  constructor(
    public readonly orgId: string,
    public readonly id: string,
    public readonly dto: MoveOrganizationUnitDto,
  ) {}
}

@CommandHandler(MoveOrganizationUnitCommand)
export class MoveOrganizationUnitHandler implements ICommandHandler<MoveOrganizationUnitCommand> {
  constructor(
    @Inject(ORGANIZATION_UNIT_REPOSITORY)
    private readonly repository: OrganizationUnitRepository,
  ) {}

  async execute(command: MoveOrganizationUnitCommand): Promise<Result<void>> {
    const { orgId, id, dto } = command;
    const organizationId = Identifier.create(orgId);
    const unitId = Identifier.create(id);

    const unit = await this.repository.findById(organizationId, unitId);
    if (!unit) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: 'ORGANIZATION_UNIT_NOT_FOUND',
        message: 'Organization unit not found.',
      });
    }

    const parentUnitId = dto.parentUnitId ? Identifier.create(dto.parentUnitId) : null;

    if (parentUnitId && parentUnitId.equals(unitId)) {
      return Result.failure({
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'INVALID_HIERARCHY',
        message: 'A unit cannot be its own parent.',
      });
    }

    // Check hierarchy cycle
    if (parentUnitId) {
      const descendants = await this.repository.findDescendants(organizationId, unitId);
      const isDescendant = descendants.some((d) => d.id.equals(parentUnitId));
      if (isDescendant) {
        return Result.failure({
          statusCode: HttpStatus.BAD_REQUEST,
          code: 'HIERARCHY_CYCLE_DETECTED',
          message: 'A unit cannot be moved under one of its descendants.',
        });
      }
    }

    // Name collision in target parent
    const nameExists = await this.repository.existsChildWithName(
      organizationId,
      parentUnitId,
      unit.name,
    );
    if (nameExists) {
      return Result.failure({
        statusCode: HttpStatus.CONFLICT,
        code: 'ORGANIZATION_UNIT_NAME_EXISTS',
        message: 'A sibling unit with this name already exists under the target parent.',
      });
    }

    const oldPath = unit.path;
    const oldLevel = unit.level;

    let newLevel = 0;
    let newPath = `/${unitId.getValue()}`;

    if (parentUnitId) {
      const parent = await this.repository.findById(organizationId, parentUnitId);
      if (!parent) {
        return Result.failure({
          statusCode: HttpStatus.NOT_FOUND,
          code: 'PARENT_UNIT_NOT_FOUND',
          message: 'Parent unit not found.',
        });
      }
      newLevel = parent.level + 1;
      newPath = `${parent.path}/${unitId.getValue()}`;
    }

    unit.moveTo(parentUnitId ?? undefined);
    unit.updateHierarchy(newPath, newLevel);

    // Update unit
    await this.repository.update(unit);

    // Update all descendants' hierarchy paths and levels
    if (oldPath) {
      const descendants = await this.repository.findDescendants(organizationId, unitId);
      for (const d of descendants) {
        if (d.path) {
          const relativePath = d.path.substring(oldPath.length);
          const descendantNewPath = `${newPath}${relativePath}`;
          const descendantNewLevel = d.level + (newLevel - oldLevel);
          d.updateHierarchy(descendantNewPath, descendantNewLevel);
          await this.repository.update(d);
        }
      }
    }

    return Result.success(undefined, {
      statusCode: HttpStatus.OK,
    });
  }
}
