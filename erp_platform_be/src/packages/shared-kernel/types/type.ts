export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type Constructor<T = object> = abstract new (
    ...args: any[]
) => T;

export type Primitive =
    | string
    | number
    | boolean
    | bigint
    | symbol
    | null
    | undefined;