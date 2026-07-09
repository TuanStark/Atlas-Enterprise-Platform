import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Credential, CredentialType, PasswordHash } from '../../domain';

export class CredentialMapper {
  static createPassword(principalId: Identifier, hash: string) {
    return Credential.create({
      principalId,
      type: CredentialType.PASSWORD,
      passwordHash: PasswordHash.create(hash),
      passwordChangedAt: new Date(),
    });
  }
}
