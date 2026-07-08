import { ValueObject } from '@shared-kernel/domain/value-object';

export class PasswordHash extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(hash: string): PasswordHash {
    return new PasswordHash(hash);
  }
}
