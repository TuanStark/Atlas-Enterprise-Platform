import { Inject, Injectable } from '@nestjs/common';
import { Email, IdentityService, UserMessages } from '../../domain';
import * as domain from '../../domain';
import * as application from '@shared-kernel/application';
import { UnauthorizedException } from '@shared-kernel/exceptions';

@Injectable()
export class IdentityServiceImpl implements IdentityService {
  constructor(
    @Inject(domain.USER_REPOSITORY)
    private readonly userRepository: domain.UserRepository,
    @Inject(domain.CREDENTIAL_REPOSITORY)
    private readonly credentialRepository: domain.CredentialRepository,
    @Inject(application.PASSWORD_HASHER)
    private readonly passwordHasher: application.PasswordHasher,
  ) {}

  async authenticate(email: Email, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(UserMessages.ERROR.INVALID_PASSWORD);
    }

    const credential = await this.credentialRepository.findByPrincipalId(user.principalId);

    if (!credential) {
      throw new UnauthorizedException(UserMessages.ERROR.INVALID_PASSWORD);
    }

    const valid = await this.passwordHasher.verify(password, credential.passwordHash.value);

    if (!valid) {
      throw new UnauthorizedException(UserMessages.ERROR.INVALID_PASSWORD);
    }

    return {
      user,
    };
  }
}

