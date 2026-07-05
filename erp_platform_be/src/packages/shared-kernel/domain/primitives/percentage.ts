import { ValidationException } from '../../exceptions/validation.exception';

export class Percentage {
  private constructor(private readonly value: number) {}

  public static from(value: number): Percentage {
    if (value < 0 || value > 100) {
      throw new ValidationException('Percentage must be between 0 and 100.');
    }

    return new Percentage(value);
  }

  public valueOf(): number {
    return this.value;
  }

  public toDecimal(): number {
    return this.value / 100;
  }

  public equals(other: Percentage): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return `${this.value}%`;
  }
}
