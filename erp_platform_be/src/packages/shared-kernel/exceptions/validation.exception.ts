import { DomainException } from './domain.exception';

export class ValidationException extends DomainException {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}
