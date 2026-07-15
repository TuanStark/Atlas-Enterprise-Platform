import { DomainException } from './domain.exception';

export class BusinessRuleViolationException extends DomainException {
  constructor(message: string) {
    super(message, 400, 'BUSINESS_RULE_VIOLATION');
  }
}
