import { randomUUID } from 'node:crypto';
import { validate as isUuid } from 'uuid';
import { InvalidIdentifierException } from '../exceptions/invalid-identifier.exception';


export class Identifier {
    private constructor(
        private readonly value: string,
    ) { }

    static generate(): Identifier {
        return new Identifier(randomUUID());
    }

    static from(value: string): Identifier {
        if (!isUuid(value)) {
            throw new InvalidIdentifierException(value);
        }

        return new Identifier(value);
    }

    equals(other: Identifier): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }

    toJSON(): string {
        return this.value;
    }
}