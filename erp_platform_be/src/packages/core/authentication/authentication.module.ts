import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';

import { JWT_TOKEN_SERVICE } from '@shared-kernel/application';
import { AuthController } from './presentation/auth.controller';
import { LoginHandler, LogoutHandler, RefreshTokenHandler, ForgotPasswordHandler, ResetPasswordHandler } from './application/commands';
import { PasswordResetService } from './application/services/password-reset.service';
import { JwtTokenServiceImpl } from './infrastructure/jwt/jwt-token.service';
import { PrismaModule } from 'src/database/prisma.module';
import { IdentityModule } from '../identity/identity.module';
import { MailModule } from 'src/packages/shared/mail/mail.module';

@Module({
  imports: [
    PrismaModule,
    CqrsModule,
    IdentityModule,
    MailModule,
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
    ForgotPasswordHandler,
    ResetPasswordHandler,
    PasswordResetService,
    {
      provide: JWT_TOKEN_SERVICE,
      useClass: JwtTokenServiceImpl,
    },
  ],

  exports: [JWT_TOKEN_SERVICE],
})
export class AuthenticationModule {}

