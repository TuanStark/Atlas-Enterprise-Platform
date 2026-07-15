import { BusinessRuleViolationException, EntityNotFoundException } from '../../exceptions';

export abstract class BaseCommandHandler {
  protected ensureFound<T>(entity: T | null, entityName: string, id: string): T {
    if (!entity) {
      throw new EntityNotFoundException(entityName, id);
    }

    return entity;
  }

  protected ensure(condition: boolean, message: string): void {
    if (!condition) {
      throw new BusinessRuleViolationException(message);
    }
  }
}
