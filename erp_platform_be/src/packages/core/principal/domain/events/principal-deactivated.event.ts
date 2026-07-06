import { DomainEvent } from '@shared-kernel/domain/events/domain-event';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class PrincipalDeactivatedEvent implements DomainEvent {
  public readonly eventName = 'principal.deactivated';
  public readonly occurredOn = new Date();
  constructor(public readonly principalId: Identifier) {}
}
