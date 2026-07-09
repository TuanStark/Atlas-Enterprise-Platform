import { ValueObject } from '@shared-kernel/domain/value-object';

export class RoleCode extends ValueObject<string> {
  static create(value: string): RoleCode {
    value = value.trim().toUpperCase();

    if (!value) {
      throw new Error('Role code is required.');
    }

    if (!/^[A-Z0-9_]+$/.test(value)) {
      throw new Error('Role code can only contain A-Z, 0-9 and _.');
    }

    return new RoleCode(value);
  }
}
