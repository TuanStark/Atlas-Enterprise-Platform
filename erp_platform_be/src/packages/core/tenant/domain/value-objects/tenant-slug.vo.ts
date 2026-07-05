import { Guard } from '@shared-kernel/utils';
import { ValidationException } from '@shared-kernel/exceptions';

export class TenantSlug {
  private constructor(private readonly value: string) {}

  public static create(value: string): TenantSlug {
    Guard.againstEmptyString(value, 'tenantSlug');

    const normalizedValue = value.trim().toLowerCase();

    if (!/^[a-z0-9-]{2,100}$/.test(normalizedValue)) {
      throw new ValidationException('Invalid tenant slug.');
    }

    return new TenantSlug(normalizedValue);
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: TenantSlug): boolean {
    return this.value === other.value;
  }
}
