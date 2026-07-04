import { ValidationException } from './validation.exception';

export class InvalidIdentifierException extends ValidationException {
    constructor(value: string) {
        super(`Invalid identifier: ${value}`);
    }
}