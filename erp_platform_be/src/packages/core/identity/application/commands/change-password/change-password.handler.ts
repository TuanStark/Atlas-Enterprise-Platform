import { HttpStatus, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '@shared-kernel/application';
import * as application from '@shared-kernel/application';
import { ChangePasswordCommand } from './change-password.command';
import * as domain from '@core/identity/domain';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PasswordHash, UserMessages, UserSuccessCode } from '@core/identity/domain';

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand> {
  constructor(
    @Inject(domain.CREDENTIAL_REPOSITORY)
    private readonly credentialRepository: domain.CredentialRepository,

    @Inject(application.PASSWORD_HASHER)
    private readonly passwordHasher: application.PasswordHasher,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<Result<void>> {
    const credential = await this.credentialRepository.findByPrincipalId(
      Identifier.create(command.principalId),
    );

    if (!credential) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: domain.UserErrorCode.NOT_FOUND,
        message: domain.UserMessages.ERROR.NOT_FOUND,
      });
    }

    const matched = await this.passwordHasher.verify(
      command.dto.oldPassword,
      credential.passwordHash.value,
    );

    if (!matched) {
      return Result.failure({
        statusCode: HttpStatus.BAD_REQUEST,
        code: domain.UserErrorCode.INVALID_PASSWORD,
        message: domain.UserMessages.ERROR.INVALID_PASSWORD,
      });
    }

    const hash = await this.passwordHasher.hash(command.dto.newPassword);

    credential.changePassword(PasswordHash.create(hash));

    await this.credentialRepository.update(credential);

    return Result.success(undefined, {
      statusCode: HttpStatus.OK,
      code: UserSuccessCode.PASSWORD_CHANGED,
      message: UserMessages.SUCCESS.PASSWORD_CHANGED,
    });
  }
}
