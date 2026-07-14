import { HttpStatus, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  CreateOrganizationUnitTypeDto,
  UpdateOrganizationUnitTypeDto,
} from '@core/organization/dto';
import { ORGANIZATION_UNIT_TYPE_REPOSITORY } from '@core/organization/domain/repositories/organization-unit-type.repository';
import type { OrganizationUnitTypeRepository } from '@core/organization/domain/repositories/organization-unit-type.repository';
import { OrganizationUnitType } from '@core/organization/domain/entities/organization-unit-type';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Result } from '@shared-kernel/application';

// Create
export class CreateOrganizationUnitTypeCommand {
  constructor(public readonly dto: CreateOrganizationUnitTypeDto) {}
}

@CommandHandler(CreateOrganizationUnitTypeCommand)
export class CreateOrganizationUnitTypeHandler implements ICommandHandler<CreateOrganizationUnitTypeCommand> {
  constructor(
    @Inject(ORGANIZATION_UNIT_TYPE_REPOSITORY)
    private readonly repository: OrganizationUnitTypeRepository,
  ) {}

  async execute(command: CreateOrganizationUnitTypeCommand): Promise<Result<string>> {
    const exists = await this.repository.existsByCode(command.dto.code);
    if (exists) {
      return Result.failure({
        statusCode: HttpStatus.CONFLICT,
        code: 'ORGANIZATION_UNIT_TYPE_ALREADY_EXISTS',
        message: 'Organization unit type code already exists.',
      });
    }

    const unitType = OrganizationUnitType.create({
      code: command.dto.code,
      name: command.dto.name,
      description: command.dto.description,
    });

    await this.repository.save(unitType);
    return Result.success(unitType.id.getValue(), {
      statusCode: HttpStatus.CREATED,
    });
  }
}

// Update
export class UpdateOrganizationUnitTypeCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateOrganizationUnitTypeDto,
  ) {}
}

@CommandHandler(UpdateOrganizationUnitTypeCommand)
export class UpdateOrganizationUnitTypeHandler implements ICommandHandler<UpdateOrganizationUnitTypeCommand> {
  constructor(
    @Inject(ORGANIZATION_UNIT_TYPE_REPOSITORY)
    private readonly repository: OrganizationUnitTypeRepository,
  ) {}

  async execute(command: UpdateOrganizationUnitTypeCommand): Promise<Result<void>> {
    const unitType = await this.repository.findById(Identifier.create(command.id));
    if (!unitType) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: 'ORGANIZATION_UNIT_TYPE_NOT_FOUND',
        message: 'Organization unit type not found.',
      });
    }

    if (command.dto.name) {
      unitType.rename(command.dto.name);
    }
    if (command.dto.description !== undefined) {
      unitType.changeDescription(command.dto.description);
    }

    await this.repository.update(unitType);
    return Result.success(undefined, {
      statusCode: HttpStatus.OK,
    });
  }
}

// Delete
export class DeleteOrganizationUnitTypeCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteOrganizationUnitTypeCommand)
export class DeleteOrganizationUnitTypeHandler implements ICommandHandler<DeleteOrganizationUnitTypeCommand> {
  constructor(
    @Inject(ORGANIZATION_UNIT_TYPE_REPOSITORY)
    private readonly repository: OrganizationUnitTypeRepository,
  ) {}

  async execute(command: DeleteOrganizationUnitTypeCommand): Promise<Result<void>> {
    const unitType = await this.repository.findById(Identifier.create(command.id));
    if (!unitType) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: 'ORGANIZATION_UNIT_TYPE_NOT_FOUND',
        message: 'Organization unit type not found.',
      });
    }

    await this.repository.delete(unitType);
    return Result.success(undefined, {
      statusCode: HttpStatus.OK,
    });
  }
}
