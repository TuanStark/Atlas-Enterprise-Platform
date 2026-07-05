import { ValidationException } from '../exceptions';

export class Guard {
  private constructor() {}

  public static againstNullOrUndefined<T>(value: T | null | undefined, argumentName: string): void {
    if (value === null || value === undefined) {
      throw new ValidationException(`${argumentName} cannot be null or undefined.`);
    }
  }

  public static againstEmptyString(value: string, argumentName: string): void {
    this.againstNullOrUndefined(value, argumentName);

    if (value.trim().length === 0) {
      throw new ValidationException(`${argumentName} cannot be empty.`);
    }
  }

  public static againstOutOfRange(
    value: number,
    min: number,
    max: number,
    argumentName: string,
  ): void {
    if (value < min || value > max) {
      throw new ValidationException(`${argumentName} must be between ${min} and ${max}.`);
    }
  }
}
