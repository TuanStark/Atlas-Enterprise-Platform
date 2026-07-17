import { BusinessRuleViolationException } from '@shared-kernel/exceptions';

export class EmployeeNumber {
  private constructor(private readonly value: string) {}

  static create(value: string): EmployeeNumber {
    if (!value || typeof value !== 'string' || !value.trim()) {
      throw new BusinessRuleViolationException('Employee number is required.');
    }

    return new EmployeeNumber(value.trim());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: EmployeeNumber): boolean {
    return this.value === other.value;
  }
}
