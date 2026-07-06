import { DomainEvent } from '@shared-kernel/domain/events/domain-event';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class PrincipalCreatedEvent implements DomainEvent {
  public readonly eventName = 'principal.created';
  public readonly occurredOn = new Date();
  constructor(public readonly principalId: Identifier) {}
}
