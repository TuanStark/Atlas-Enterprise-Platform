import { HttpStatus, Inject } from '@nestjs/common';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result } from '@shared-kernel/application';
import { CreateUserCommand } from './create-user.command';
import * as domain from '@core/identity/domain';
import { UserMapper } from '../../mappers';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(domain.USER_REPOSITORY)
    private readonly repository: domain.UserRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<Result<void>> {
    const email = domain.Email.create(command.dto.email);

    const exists = await this.repository.existsByEmail(email);

    if (exists) {
      return Result.failure({
        statusCode: HttpStatus.CONFLICT,
        code: domain.UserErrorCode.EMAIL_ALREADY_EXISTS,
        message: domain.UserMessages.ERROR.EMAIL_ALREADY_EXISTS,
      });
    }

    const user = UserMapper.toDomain(command.dto);

    await this.repository.save(user);

    return Result.success(undefined, {
      statusCode: HttpStatus.CREATED,
      code: domain.UserSuccessCode.CREATED,
      message: domain.UserMessages.SUCCESS.CREATED,
    });
  }
}
