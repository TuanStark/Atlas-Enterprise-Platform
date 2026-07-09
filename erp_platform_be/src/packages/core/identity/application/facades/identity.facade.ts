import { Email } from '../../domain';
import { User } from '../../domain/entities';

export const IDENTITY_FACADE = Symbol('IDENTITY_FACADE');

export interface IdentityFacade {
  authenticate(email: Email, password: string): Promise<User>;
  changePassword(principalId: string, oldPassword: string, newPassword: string): Promise<void>;
  lockUser(userId: string): Promise<void>;
  unlockUser(userId: string): Promise<void>;
}
