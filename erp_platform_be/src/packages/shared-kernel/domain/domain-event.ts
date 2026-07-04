import { Identifier } from './primitives/identifier';

export abstract class DomainEvent {
    readonly occurredOn = new Date();

    protected constructor(
        public readonly aggregateId: Identifier,
    ) { }
}