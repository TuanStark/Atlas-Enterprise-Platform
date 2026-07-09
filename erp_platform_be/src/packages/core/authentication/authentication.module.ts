import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';

import { PASSWORD_HASHER, JWT_TOKEN_SERVICE } from '@shared-kernel/application';
import { AuthController } from './presentation/auth.controller';
import { LoginHandler } from './application/commands/login/login.handler';
import { LogoutHandler } from './application/commands/logout/logout.handler';
import { RefreshTokenHandler } from './application/commands/refresh-token/refresh-token.handler';
import { BcryptPasswordHasher } from '@shared-kernel/application/security';
import { JwtTokenServiceImpl } from './infrastructure/jwt/jwt-token.service';
import { PrismaModule } from 'src/database/prisma.module';

@Module({
  imports: [
    PrismaModule,
    CqrsModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        issuer: 'erp-platform',
      },
    }),
  ],

  controllers: [AuthController],

  providers: [
    LoginHandler,
    LogoutHandler,
    RefreshTokenHandler,
    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },

    {
      provide: JWT_TOKEN_SERVICE,
      useClass: JwtTokenServiceImpl,
    },
  ],

  exports: [JWT_TOKEN_SERVICE, PASSWORD_HASHER],
})
export class AuthenticationModule {}
