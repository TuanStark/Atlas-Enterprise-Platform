import { ValueObject } from '@shared-kernel/domain/value-object';

export class Email extends ValueObject<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): Email {
    const email = value.trim().toLowerCase();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) {
      throw new Error('Invalid email.');
    }
    return new Email(email);
  }
}
