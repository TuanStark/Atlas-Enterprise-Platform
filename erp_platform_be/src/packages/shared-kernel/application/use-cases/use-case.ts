export interface Command { }

export interface Query { }

import { Result } from '../result';

export interface UseCase<Input, Output> {
    execute(
        input: Input,
    ): Promise<Result<Output>>;
}