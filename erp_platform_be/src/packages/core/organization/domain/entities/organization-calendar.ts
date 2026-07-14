import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface OrganizationCalendarProps {
  organizationId: Identifier;
  name?: string;
  timezone?: string;
  workDays?: Record<string, unknown>; // JSON
  createdAt?: Date;
}

export class OrganizationCalendar extends AggregateRoot<OrganizationCalendarProps> {
  static create(props: Omit<OrganizationCalendarProps, 'createdAt'>) {
    return new OrganizationCalendar(Identifier.create(), {
      ...props,
      createdAt: new Date(),
    });
  }

  static rehydrate(id: Identifier, props: OrganizationCalendarProps) {
    return new OrganizationCalendar(id, props);
  }

  get organizationId() {
    return this.props.organizationId;
  }

  get name() {
    return this.props.name;
  }

  get timezone() {
    return this.props.timezone;
  }

  get workDays() {
    return this.props.workDays;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  updateDetails(name?: string, timezone?: string, workDays?: Record<string, unknown>) {
    this.props.name = name;
    this.props.timezone = timezone;
    this.props.workDays = workDays;
  }
}
