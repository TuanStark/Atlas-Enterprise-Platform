import { EntityNotFoundException } from '@shared-kernel/exceptions';

export abstract class BaseQueryHandler {
  protected ensureFound<T>(entity: T | null, entityName: string, id: string): T {
    if (!entity) {
      throw new EntityNotFoundException(entityName, id);
    }
    return entity;
  }
}
