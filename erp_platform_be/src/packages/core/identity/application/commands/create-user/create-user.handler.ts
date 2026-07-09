import { HttpStatus, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result, TRANSACTION_RUNNER, PASSWORD_HASHER } from '@shared-kernel/application';
import type { TransactionRunner, PasswordHasher } from '@shared-kernel/application';
import { CreateUserCommand } from './create-user.command';
import * as domain from '@core/identity/domain';
import { UserMapper, CredentialMapper } from '../../mappers';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(domain.USER_REPOSITORY)
    private readonly userRepository: domain.UserRepository,
    @Inject(domain.CREDENTIAL_REPOSITORY)
    private readonly credentialRepository: domain.CredentialRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(TRANSACTION_RUNNER)
    private readonly transaction: TransactionRunner,
  ) { }

  async execute(command: CreateUserCommand): Promise<Result<void>> {
    const email = domain.Email.create(command.dto.email);

    const exists = await this.userRepository.existsByEmail(email);

    if (exists) {
      return Result.failure({
        statusCode: HttpStatus.CONFLICT,
        code: domain.UserErrorCode.EMAIL_ALREADY_EXISTS,
        message: domain.UserMessages.ERROR.EMAIL_ALREADY_EXISTS,
      });
    }

    const user = UserMapper.toDomain(command.dto);

    const hash = await this.passwordHasher.hash(command.dto.password);

    const credential = CredentialMapper.createPassword(user.principalId, hash);

    await this.transaction.run(async () => {
      await this.userRepository.save(user);

      await this.credentialRepository.save(credential);
    });

    return Result.success(undefined, {
      statusCode: HttpStatus.CREATED,
      code: domain.UserSuccessCode.CREATED,
      message: domain.UserMessages.SUCCESS.CREATED,
    });
  }
}
