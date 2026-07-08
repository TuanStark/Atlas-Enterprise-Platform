import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { RefreshToken } from '../entities';

export interface RefreshTokenRepository {
  save(token: RefreshToken): Promise<void>;
  update(token: RefreshToken): Promise<void>;
  revoke(token: RefreshToken): Promise<void>;
  findByToken(token: string): Promise<RefreshToken | null>;
  findByPrincipal(principalId: Identifier): Promise<RefreshToken[]>;
  deleteExpired(): Promise<void>;
}
