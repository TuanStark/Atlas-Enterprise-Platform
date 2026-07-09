import { Injectable } from '@nestjs/common';

import { JwtService, JwtSignOptions } from '@nestjs/jwt';

import { JwtTokenService } from '@shared-kernel/application';

@Injectable()
export class JwtTokenServiceImpl implements JwtTokenService {
  constructor(private readonly jwtService: JwtService) {}

  async generateAccessToken(principalId: string): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: principalId,
        type: 'access',
      },
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
      } as JwtSignOptions,
    );
  }

  async generateRefreshToken(principalId: string): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: principalId,
        type: 'refresh',
      },
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
      } as JwtSignOptions,
    );
  }

  async verifyAccessToken<T>(token: string): Promise<T> {
    return this.jwtService.verifyAsync(token) as Promise<T>;
  }

  async verifyRefreshToken<T>(token: string): Promise<T> {
    return this.jwtService.verifyAsync(token) as Promise<T>;
  }
}
