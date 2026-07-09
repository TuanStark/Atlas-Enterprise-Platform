import { Email } from '../value-objects';
import { User } from '../entities';

export const IDENTITY_SERVICE = Symbol('IDENTITY_SERVICE');

export interface LoginIdentity {
  user: User;
}

export interface IdentityService {
  authenticate(email: Email, password: string): Promise<LoginIdentity>;
}
