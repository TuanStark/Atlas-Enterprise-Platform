import { DomainEvent } from '@shared-kernel/domain/events/domain-event';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class PrincipalActivatedEvent implements DomainEvent {
  public readonly eventName = 'principal.activated';
  public readonly occurredOn = new Date();
  constructor(public readonly principalId: Identifier) {}
}
