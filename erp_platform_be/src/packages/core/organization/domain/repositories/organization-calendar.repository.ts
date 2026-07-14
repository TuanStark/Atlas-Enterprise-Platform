import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { OrganizationCalendar } from '../entities/organization-calendar';

export const ORGANIZATION_CALENDAR_REPOSITORY = Symbol('ORGANIZATION_CALENDAR_REPOSITORY');

export interface OrganizationCalendarRepository {
  save(calendar: OrganizationCalendar): Promise<void>;
  update(calendar: OrganizationCalendar): Promise<void>;
  delete(calendar: OrganizationCalendar): Promise<void>;
  findById(organizationId: Identifier, id: Identifier): Promise<OrganizationCalendar | null>;
  findAll(organizationId: Identifier): Promise<OrganizationCalendar[]>;
}
