import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

interface ResetTokenInfo {
  email: string;
  expiresAt: Date;
}

@Injectable()
export class PasswordResetService {
  private readonly tokens = new Map<string, ResetTokenInfo>();

  createToken(email: string): string {
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    this.tokens.set(token, { email: email.toLowerCase(), expiresAt });
    return token;
  }

  getEmailByToken(token: string): string | null {
    const info = this.tokens.get(token);
    if (!info) return null;

    if (new Date() > info.expiresAt) {
      this.tokens.delete(token);
      return null;
    }

    return info.email;
  }

  invalidateToken(token: string): void {
    this.tokens.delete(token);
  }
}
