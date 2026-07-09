import { Injectable } from '@nestjs/common';

import * as bcrypt from 'bcrypt';

import { PasswordHasher } from '../../application';

@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
