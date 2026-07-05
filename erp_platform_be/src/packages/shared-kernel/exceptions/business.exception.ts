import { DomainException } from './domain.exception';

export class BusinessException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
