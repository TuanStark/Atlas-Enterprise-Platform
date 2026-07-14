export abstract class DomainException extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  protected constructor(message: string, statusCode: number = 400, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = new.target.name;
    this.code = code || this.convertNameToCode(new.target.name);
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, new.target);
  }

  private convertNameToCode(name: string): string {
    return name
      .replace(/Exception$/, '')
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .toUpperCase();
  }
}
