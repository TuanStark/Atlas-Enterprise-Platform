import { BusinessRuleViolationException } from '@shared-kernel/exceptions';

export class FullName {
  private constructor(
    readonly firstName: string,
    readonly lastName: string,
    readonly preferredName?: string,
  ) {}

  static create(firstName: string, lastName: string, preferredName?: string) {
    if (!firstName.trim()) {
      throw new BusinessRuleViolationException('First name is required.');
    }

    if (!lastName.trim()) {
      throw new BusinessRuleViolationException('Last name is required.');
    }

    return new FullName(firstName.trim(), lastName.trim(), preferredName?.trim());
  }

  getDisplayName(): string {
    return this.preferredName ?? `${this.firstName} ${this.lastName}`;
  }
}
