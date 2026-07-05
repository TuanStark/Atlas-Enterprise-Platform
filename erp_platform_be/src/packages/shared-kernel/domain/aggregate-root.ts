import { Entity } from './entity';
import { Identifier } from './primitives/identifier';
import type { DomainEvent } from './events/domain-event';

export abstract class AggregateRoot<Props> extends Entity<Props> {
    private readonly domainEvents: DomainEvent[] = [];

    protected constructor(
        id: Identifier,
        props: Props,
    ) {
        super(id, props);
    }

    protected addDomainEvent(event: DomainEvent): void {
        this.domainEvents.push(event);
    }

    public pullDomainEvents(): DomainEvent[] {
        const events = [...this.domainEvents];

        this.domainEvents.length = 0;

        return events;
    }
}