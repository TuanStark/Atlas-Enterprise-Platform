import { Email } from '../value-objects';
import { User } from '../entities';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { UserStatus } from '../enums';

export interface UserRepository {
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
  delete(user: User): Promise<void>;
  findById(id: Identifier): Promise<User | null>;
  findByPrincipalId(principalId: Identifier): Promise<User | null>;
  findByPrincipalIds(principalIds: Identifier[]): Promise<User[]>;
  findByEmail(email: Email): Promise<User | null>;
  findByTenant(tenantId: Identifier): Promise<User[]>;
  findByStatus(status: UserStatus): Promise<User[]>;
  exists(id: Identifier): Promise<boolean>;
  existsByEmail(email: Email): Promise<boolean>;
  findAll(): Promise<User[]>;
}
