import { DomainException } from './domain.exception';

export class EntityAlreadyExistsException extends DomainException {
  constructor(entityName: string, fieldName: string, value: string) {
    super(
      `${entityName} with ${fieldName} '${value}' already exists.`,
      409,
      'ENTITY_ALREADY_EXISTS',
    );
  }
}
