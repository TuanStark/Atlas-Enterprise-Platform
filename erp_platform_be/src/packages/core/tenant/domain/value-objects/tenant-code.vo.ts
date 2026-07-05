import { Guard } from '@shared-kernel/utils';
import { ValidationException } from '@shared-kernel/exceptions';

export class TenantCode {
  private constructor(private readonly value: string) {}

  public static create(value: string): TenantCode {
    Guard.againstEmptyString(value, 'tenantCode');

    const normalizedValue = value.trim().toUpperCase();

    if (!/^[A-Z0-9_]{2,20}$/.test(normalizedValue)) {
      throw new ValidationException('Invalid tenant code.');
    }

    return new TenantCode(normalizedValue);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: TenantCode): boolean {
    return this.value === other.value;
  }
}
