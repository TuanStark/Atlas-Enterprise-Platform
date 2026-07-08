import { DomainEvent } from '@shared-kernel/domain/events/domain-event';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class TenantCreatedEvent implements DomainEvent {
  public readonly eventName = 'tenant.created';
  public readonly occurredOn = new Date();
  constructor(public readonly tenantId: Identifier) { }
}
