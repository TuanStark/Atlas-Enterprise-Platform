export class ObjectUtil {
  private constructor() {}

  public static isObject(value: unknown): value is object {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  public static isEmpty(value: object): boolean {
    return Object.keys(value).length === 0;
  }

  public static clone<T>(value: T): T {
    return structuredClone(value);
  }
}
