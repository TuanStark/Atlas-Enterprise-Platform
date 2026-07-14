import { ValueObject } from '@shared-kernel/domain/value-object';

export class OrganizationCode extends ValueObject<string> {
  public static create(value: string) {
    return new OrganizationCode(value.trim().toUpperCase());
  }
}
