import { ErrorDetail } from "./error-code";

export class Result<T, E = ErrorDetail[]> {
    private constructor(
        public readonly isSuccess: boolean,
        private readonly _value?: T,
        private readonly _errors?: E,
    ) { }

    public static success<T, E = ErrorDetail[]>(value: T): Result<T, E>;
    public static success<E = ErrorDetail[]>(): Result<void, E>;
    public static success<T, E = ErrorDetail[]>(value?: T): Result<T, E> {
        return new Result<T, E>(true, value, undefined);
    }

    public static failure<T = void, E = ErrorDetail[]>(errors: E): Result<T, E> {
        return new Result<T, E>(false, undefined, errors);
    }

    public get isFailure(): boolean {
        return !this.isSuccess;
    }

    public isSuccessResult(): this is Result<T, never> & { readonly value: T } {
        return this.isSuccess;
    }

    public isFailureResult(): this is Result<never, E> & { readonly errors: E } {
        return !this.isSuccess;
    }

    public get value(): T {
        if (!this.isSuccess) {
            throw new Error('Cannot retrieve the value of a failed result.');
        }
        return this._value as T;
    }

    public get errors(): E {
        if (this.isSuccess) {
            throw new Error('Cannot retrieve the errors of a successful result.');
        }
        return this._errors as E;
    }

    public get errorList(): ReadonlyArray<ErrorDetail> {
        if (this.isSuccess || !this._errors) {
            return [];
        }
        if (Array.isArray(this._errors)) {
            return this._errors;
        }
        return [this._errors as any];
    }

    public map<U>(fn: (val: T) => U): Result<U, E> {
        if (this.isFailure) {
            return Result.failure<U, E>(this.errors);
        }
        return Result.success<U, E>(fn(this.value));
    }

    public flatMap<U>(fn: (val: T) => Result<U, E>): Result<U, E> {
        if (this.isFailure) {
            return Result.failure<U, E>(this.errors);
        }
        return fn(this.value);
    }

    public unwrapOr(defaultValue: T): T {
        return this.isSuccess ? this.value : defaultValue;
    }

    public match<U>(
        onSuccess: (val: T) => U,
        onFailure: (errors: E) => U,
    ): U {
        return this.isSuccess ? onSuccess(this.value) : onFailure(this.errors);
    }

    public static combine<Results extends Result<any, ErrorDetail[]>[]>(
        results: Results,
    ): Result<any[], ErrorDetail[]> {
        const errors: ErrorDetail[] = [];
        const values: any[] = [];

        for (const result of results) {
            if (result.isFailure) {
                errors.push(...result.errorList);
            } else {
                values.push(result.value);
            }
        }

        if (errors.length > 0) {
            return Result.failure<any[], ErrorDetail[]>(errors);
        }

        return Result.success<any[], ErrorDetail[]>(values);
    }

    public toJSON() {
        if (this.isSuccess) {
            return {
                success: true,
                data: this._value !== undefined ? this._value : null,
            };
        }
        return {
            success: false,
            errors: this.errorList,
        };
    }
}
