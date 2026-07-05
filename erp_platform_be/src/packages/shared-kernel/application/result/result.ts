import { ErrorDetail } from './error-code';
import { ResultMeta } from './result-meta';

export class Result<T = void> {
  private constructor(
    public readonly success: boolean,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly message: string,
    public readonly data?: T,
    public readonly meta?: ResultMeta,
    public readonly errors: ErrorDetail[] = [],
  ) {}

  /**
   * Creates a successful Result.
   *
   * @param data Optional payload of type T.
   * @param options Configuration options for the result (status code, code, message, and meta).
   * @returns A successful Result instance.
   */
  public static success<T = void>(
    data?: T,
    options?: {
      statusCode?: number;
      code?: string;
      message?: string;
      meta?: ResultMeta;
    },
  ): Result<T> {
    return new Result<T>(
      true,
      options?.statusCode ?? 200,
      options?.code ?? 'SUCCESS',
      options?.message ?? 'Success.',
      data,
      options?.meta,
      [],
    );
  }

  /**
   * Creates a failure Result.
   *
   * @param options Configuration options for the failure (status code, business error code, message, error details, and meta).
   * @returns A failed Result instance.
   */
  public static failure<T = any>(options: {
    statusCode: number;
    code: string;
    message: string;
    errors?: ErrorDetail[];
    meta?: ResultMeta;
  }): Result<T> {
    return new Result<T>(
      false,
      options.statusCode,
      options.code,
      options.message,
      undefined,
      options.meta,
      options.errors ?? [],
    );
  }

  /**
   * Type guard that checks if the result is successful.
   * Narrows the type to guarantee that `success` is true and `data` is defined (if T is not void).
   */
  public isSuccess(): this is Result<T> & { success: true; data: T } {
    return this.success;
  }

  /**
   * Type guard that checks if the result is a failure.
   * Narrows the type to guarantee that `success` is false and `errors` contains ErrorDetail[].
   */
  public isFailure(): this is Result<T> & {
    success: false;
    errors: ErrorDetail[];
  } {
    return !this.success;
  }

  /**
   * Unwraps the data. Throws an error if the Result is a failure.
   * Useful when you want to convert the Result back into an exception-throwing flow at boundary limits.
   *
   * @throws Error if the result is a failure.
   * @returns The wrapped data of type T.
   */
  public unwrap(): T {
    if (this.isFailure()) {
      throw new Error(`Cannot unwrap failure result: ${this.message} (${this.code})`);
    }
    return this.data as T;
  }

  /**
   * Unwraps the data, returning a fallback value if the Result is a failure.
   *
   * @param fallback The default value to return if result is a failure.
   * @returns The data of type T or the fallback value.
   */
  public unwrapOr(fallback: T): T {
    if (this.isFailure()) {
      return fallback;
    }
    return this.data as T;
  }

  /**
   * Maps the successful Result's data to a new value/type using the mapping function.
   * Propagates failure states directly without executing the mapping function.
   *
   * @param fn The mapping function to transform T to U.
   * @returns A new Result of type U.
   */
  public map<U>(fn: (data: T) => U): Result<U> {
    if (this.isFailure()) {
      return Result.failure<U>({
        statusCode: this.statusCode,
        code: this.code,
        message: this.message,
        errors: this.errors,
        meta: this.meta,
      });
    }
    return Result.success<U>(fn(this.data as T), {
      statusCode: this.statusCode,
      code: this.code,
      message: this.message,
      meta: this.meta,
    });
  }

  /**
   * Combines multiple Results into a single Result.
   * If all results are successful, returns a success Result containing an array of all data payloads.
   * If one or more results fail, aggregates all of their errors into a single failure Result.
   *
   * @param results Array of Result objects to combine.
   * @returns A combined Result containing an array of successful values, or aggregated errors.
   */
  public static combine(results: Result<unknown>[]): Result<unknown[]> {
    const failures = results.filter((r) => r.isFailure());
    if (failures.length > 0) {
      const errors = failures.reduce<ErrorDetail[]>((acc, current) => {
        return acc.concat(current.errors);
      }, []);

      const firstFailure = failures[0];
      return Result.failure<unknown[]>({
        statusCode: firstFailure.statusCode,
        code: firstFailure.code,
        message: 'Multiple operations failed.',
        errors,
      });
    }

    const data = results.map((r) => r.data);
    return Result.success<unknown[]>(data);
  }
}
