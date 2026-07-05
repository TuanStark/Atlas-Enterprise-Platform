// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Command {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Query {}

import { Result } from '../result';

export interface UseCase<Input, Output> {
  execute(input: Input): Promise<Result<Output>>;
}
