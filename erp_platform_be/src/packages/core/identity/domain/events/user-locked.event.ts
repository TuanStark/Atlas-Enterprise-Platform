import { Identifier } from "@shared-kernel/domain/primitives/identifier";
import { DomainEvent } from '@shared-kernel/domain/events/domain-event';

export class UserLockedEvent implements DomainEvent {
    public readonly eventName = 'user.locked';
    public readonly occurredOn = new Date();
    constructor(public readonly userId: Identifier, public readonly reason: string) { }
}