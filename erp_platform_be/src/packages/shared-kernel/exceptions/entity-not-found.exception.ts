import { DomainException } from './domain.exception';

export class EntityNotFoundException extends DomainException {
  constructor(entityName: string, id: string) {
    super(`${entityName} with ID '${id}' was not found.`, 404, 'ENTITY_NOT_FOUND');
  }
}
