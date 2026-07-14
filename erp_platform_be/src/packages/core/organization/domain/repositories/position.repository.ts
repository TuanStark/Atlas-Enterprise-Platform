import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Position } from '../entities/position';

export const POSITION_REPOSITORY = Symbol('POSITION_REPOSITORY');

export interface PositionRepository {
  save(position: Position): Promise<void>;
  update(position: Position): Promise<void>;
  delete(position: Position): Promise<void>;
  findById(organizationId: Identifier, id: Identifier): Promise<Position | null>;
  findByCode(organizationId: Identifier, code: string): Promise<Position | null>;
  existsByCode(organizationId: Identifier, code: string): Promise<boolean>;
  findAll(organizationId: Identifier): Promise<Position[]>;
}
