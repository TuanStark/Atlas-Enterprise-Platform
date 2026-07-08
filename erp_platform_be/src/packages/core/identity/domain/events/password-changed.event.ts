import { DomainEvent } from '@shared-kernel/domain/events/domain-event';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class PasswordChangedEvent implements DomainEvent {
  public readonly eventName = 'password.changed';
  public readonly occurredOn = new Date();
  constructor(public readonly principalId: Identifier) {}
}
