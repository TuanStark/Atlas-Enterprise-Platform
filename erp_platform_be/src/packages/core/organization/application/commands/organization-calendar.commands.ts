import { HttpStatus, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  CreateOrganizationCalendarDto,
  UpdateOrganizationCalendarDto,
} from '@core/organization/dto';
import { ORGANIZATION_CALENDAR_REPOSITORY } from '@core/organization/domain/repositories/organization-calendar.repository';
import type { OrganizationCalendarRepository } from '@core/organization/domain/repositories/organization-calendar.repository';
import { OrganizationCalendar } from '@core/organization/domain/entities/organization-calendar';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Result } from '@shared-kernel/application';

// Create
export class CreateOrganizationCalendarCommand {
  constructor(public readonly dto: CreateOrganizationCalendarDto) {}
}

@CommandHandler(CreateOrganizationCalendarCommand)
export class CreateOrganizationCalendarHandler implements ICommandHandler<CreateOrganizationCalendarCommand> {
  constructor(
    @Inject(ORGANIZATION_CALENDAR_REPOSITORY)
    private readonly repository: OrganizationCalendarRepository,
  ) {}

  async execute(command: CreateOrganizationCalendarCommand): Promise<Result<string>> {
    const { dto } = command;
    const orgId = Identifier.create(dto.organizationId);

    const calendar = OrganizationCalendar.create({
      organizationId: orgId,
      name: dto.name,
      timezone: dto.timezone,
      workDays: dto.workDays,
    });

    await this.repository.save(calendar);
    return Result.success(calendar.id.getValue(), {
      statusCode: HttpStatus.CREATED,
    });
  }
}

// Update
export class UpdateOrganizationCalendarCommand {
  constructor(
    public readonly orgId: string,
    public readonly id: string,
    public readonly dto: UpdateOrganizationCalendarDto,
  ) {}
}

@CommandHandler(UpdateOrganizationCalendarCommand)
export class UpdateOrganizationCalendarHandler implements ICommandHandler<UpdateOrganizationCalendarCommand> {
  constructor(
    @Inject(ORGANIZATION_CALENDAR_REPOSITORY)
    private readonly repository: OrganizationCalendarRepository,
  ) {}

  async execute(command: UpdateOrganizationCalendarCommand): Promise<Result<void>> {
    const { orgId, id, dto } = command;
    const organizationId = Identifier.create(orgId);
    const calendarId = Identifier.create(id);

    const calendar = await this.repository.findById(organizationId, calendarId);
    if (!calendar) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: 'ORGANIZATION_CALENDAR_NOT_FOUND',
        message: 'Organization calendar not found.',
      });
    }

    calendar.updateDetails(
      dto.name ?? calendar.name,
      dto.timezone ?? calendar.timezone,
      dto.workDays ?? calendar.workDays,
    );

    await this.repository.update(calendar);
    return Result.success(undefined, {
      statusCode: HttpStatus.OK,
    });
  }
}

// Delete
export class DeleteOrganizationCalendarCommand {
  constructor(
    public readonly orgId: string,
    public readonly id: string,
  ) {}
}

@CommandHandler(DeleteOrganizationCalendarCommand)
export class DeleteOrganizationCalendarHandler implements ICommandHandler<DeleteOrganizationCalendarCommand> {
  constructor(
    @Inject(ORGANIZATION_CALENDAR_REPOSITORY)
    private readonly repository: OrganizationCalendarRepository,
  ) {}

  async execute(command: DeleteOrganizationCalendarCommand): Promise<Result<void>> {
    const { orgId, id } = command;
    const organizationId = Identifier.create(orgId);
    const calendarId = Identifier.create(id);

    const calendar = await this.repository.findById(organizationId, calendarId);
    if (!calendar) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: 'ORGANIZATION_CALENDAR_NOT_FOUND',
        message: 'Organization calendar not found.',
      });
    }

    await this.repository.delete(calendar);
    return Result.success(undefined, {
      statusCode: HttpStatus.OK,
    });
  }
}
