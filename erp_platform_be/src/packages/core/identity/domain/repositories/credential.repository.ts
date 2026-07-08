import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Credential } from '../entities';

export interface CredentialRepository {
  save(credential: Credential): Promise<void>;
  update(credential: Credential): Promise<void>;
  delete(credential: Credential): Promise<void>;
  findById(id: Identifier): Promise<Credential | null>;
  findByPrincipalId(principalId: Identifier): Promise<Credential | null>;
  exists(id: Identifier): Promise<boolean>;
}
