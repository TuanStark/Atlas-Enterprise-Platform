import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';

import { JWT_TOKEN_SERVICE } from '@shared-kernel/application';
import { AuthController } from './presentation/auth.controller';
import { LoginHandler } from './application/commands/login/login.handler';
import { LogoutHandler } from './application/commands/logout/logout.handler';
import { RefreshTokenHandler } from './application/commands/refresh-token/refresh-token.handler';
import { JwtTokenServiceImpl } from './infrastructure/jwt/jwt-token.service';
import { PrismaModule } from 'src/database/prisma.module';
import { IdentityModule } from '../identity/identity.module';
import { IDENTITY_SERVICE } from '@core/identity';
import { IdentityServiceImpl } from '@core/identity/infrastructure/services/identity.service';

@Module({
  imports: [
    PrismaModule,
    CqrsModule,
    IdentityModule,
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
      provide: JWT_TOKEN_SERVICE,
      useClass: JwtTokenServiceImpl,
    },
  ],

  exports: [JWT_TOKEN_SERVICE],
})
export class AuthenticationModule {}
