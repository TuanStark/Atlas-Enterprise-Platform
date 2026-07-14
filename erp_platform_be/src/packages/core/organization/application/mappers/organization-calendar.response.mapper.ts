import { OrganizationCalendar } from '@core/organization/domain/entities/organization-calendar';
import { OrganizationCalendarDto } from '@core/organization/dto';

export class OrganizationCalendarResponseMapper {
  static toResponse(domain: OrganizationCalendar): OrganizationCalendarDto {
    return {
      id: domain.id.getValue(),
      organizationId: domain.organizationId.getValue(),
      name: domain.name ?? undefined,
      timezone: domain.timezone ?? undefined,
      workDays: domain.workDays ?? undefined,
      createdAt: domain.createdAt ?? new Date(),
    };
  }
}
