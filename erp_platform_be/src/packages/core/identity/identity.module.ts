import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import {
  USER_REPOSITORY,
  CREDENTIAL_REPOSITORY,
  REFRESH_TOKEN_REPOSITORY,
  IDENTITY_SERVICE,
} from './domain/index';
import { PrismaModule } from 'src/database/prisma.module';
import { IdentityController } from './presentation/controllers/identity.controller';
import { CreateUserHandler } from './application/commands/create-user/create-user.handler';
import { UpdateUserHandler } from './application/commands/update-user/update-user.handler';
import { LockUserHandler } from './application/commands/lock-user/lock-user.handler';
import { UnlockUserHandler } from './application/commands/unlock-user/unlock-user.handler';
import { ChangePasswordHandler } from './application/commands/change-password/change-password.handler';
import { GetUserHandler } from './application/queries/get-user/get-user.handler';
import { ListUserHandler } from './application/queries/list-user/list-user.handler';
import { GetUserByEmailHandler } from './application/queries/get-user-by-email/get-user-by-email.handler';
import { ListSwitchableUsersHandler } from './application/queries/list-switchable-users/list-switchable-users.handler';
import { PrismaUserRepository } from './infrastructure/persistence/prisma-user.repository';
import { PrismaCredentialRepository } from './infrastructure/persistence/prisma-credential.repository';
import { PrismaRefreshTokenRepository } from './infrastructure/persistence/prisma-refresh-token.repository';
import { IDENTITY_FACADE } from './application/facades/identity.facade';
import { IdentityFacadeImpl } from './application/facades/identity.facade.impl';
import { PASSWORD_HASHER } from '@shared-kernel/application';
import { BcryptPasswordHasher } from '@shared-kernel/application/security';
import { IdentityServiceImpl } from './infrastructure/services/identity.service';

@Module({
  imports: [PrismaModule, CqrsModule],
  controllers: [IdentityController],
  providers: [
    CreateUserHandler,
    UpdateUserHandler,
    LockUserHandler,
    UnlockUserHandler,
    ChangePasswordHandler,
    GetUserHandler,
    ListUserHandler,
    GetUserByEmailHandler,
    ListSwitchableUsersHandler,

    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },

    {
      provide: CREDENTIAL_REPOSITORY,
      useClass: PrismaCredentialRepository,
    },

    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useClass: PrismaRefreshTokenRepository,
    },

    {
      provide: IDENTITY_FACADE,
      useClass: IdentityFacadeImpl,
    },

    {
      provide: PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },

    {
      provide: IDENTITY_SERVICE,
      useClass: IdentityServiceImpl,
    },
  ],

  exports: [
    USER_REPOSITORY,
    CREDENTIAL_REPOSITORY,
    REFRESH_TOKEN_REPOSITORY,
    IDENTITY_FACADE,
    PASSWORD_HASHER,
    IDENTITY_SERVICE,
  ],
})
export class IdentityModule {}
