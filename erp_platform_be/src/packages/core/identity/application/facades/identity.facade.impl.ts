import { Inject, Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { IdentityFacade } from './identity.facade';
import * as domain from '@core/identity/domain';
import { ChangePasswordCommand, LockUserCommand, UnlockUserCommand } from '../commands';
import { Result } from '@shared-kernel/application';

@Injectable()
export class IdentityFacadeImpl implements IdentityFacade {
  constructor(
    @Inject(domain.IDENTITY_SERVICE)
    private readonly identityService: domain.IdentityService,
    private readonly commandBus: CommandBus,
  ) {}

  async authenticate(email: domain.Email, password: string): Promise<domain.User> {
    const result = await this.identityService.authenticate(email, password);
    return result.user;
  }

  async changePassword(
    principalId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const result = await this.commandBus.execute<ChangePasswordCommand, Result<void>>(
      new ChangePasswordCommand(principalId, { oldPassword, newPassword }),
    );
    result.unwrap();
  }

  async lockUser(userId: string): Promise<void> {
    const result = await this.commandBus.execute<LockUserCommand, Result<void>>(
      new LockUserCommand(userId),
    );
    result.unwrap();
  }

  async unlockUser(userId: string): Promise<void> {
    const result = await this.commandBus.execute<UnlockUserCommand, Result<void>>(
      new UnlockUserCommand(userId),
    );
    result.unwrap();
  }
}
