import { ValidationException } from '@shared-kernel/exceptions';
import { Guard } from '@shared-kernel/utils';

export class TenantName {
  private constructor(private readonly value: string) {}

  public static create(value: string): TenantName {
    Guard.againstEmptyString(value, 'Tenant name');

    if (value.length > 255) {
      throw new ValidationException('Tenant name must not exceed 255 characters.');
    }

    return new TenantName(value.trim());
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: TenantName): boolean {
    return this.value === other.value;
  }
}
