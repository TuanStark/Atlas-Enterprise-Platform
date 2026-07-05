import { randomUUID } from 'crypto';
import { Guard } from '../../utils';

export class Identifier<T = unknown> {
  private constructor(private readonly value: string) {}

  public static create<T>(value?: string): Identifier<T> {
    const id = value ?? randomUUID();

    Guard.againstEmptyString(id, 'identifier');

    return new Identifier<T>(id);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: Identifier<T>): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }
}
