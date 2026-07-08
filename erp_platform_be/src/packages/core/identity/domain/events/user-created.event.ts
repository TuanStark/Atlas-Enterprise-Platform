import { Identifier } from "@shared-kernel/domain/primitives/identifier";
import { DomainEvent } from '@shared-kernel/domain/events/domain-event';

export class UserCreatedEvent implements DomainEvent {
    public readonly eventName = 'user.created';
    public readonly occurredOn = new Date();
    constructor(public readonly userId: Identifier, public readonly tenantId: Identifier) { }
}