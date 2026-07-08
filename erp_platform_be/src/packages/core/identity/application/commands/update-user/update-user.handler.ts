import { HttpStatus, Inject } from '@nestjs/common';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Result } from '@shared-kernel/application';

import * as domain from '../../../domain';
import { UserMapper } from '../../mappers';
import { UserDto } from '../../dto';

import { UpdateUserCommand } from './update-user.command';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(
    @Inject(domain.USER_REPOSITORY)
    private readonly repository: domain.UserRepository,
  ) {}

  async execute(command: UpdateUserCommand): Promise<Result<UserDto>> {
    const user = await this.repository.findById(Identifier.create(command.id));

    if (!user) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: domain.UserErrorCode.NOT_FOUND,
        message: domain.UserMessages.ERROR.NOT_FOUND,
      });
    }

    user.rename(command.dto.firstName ?? user.firstName, command.dto.lastName ?? user.lastName);

    if (command.dto.displayName) {
      user.changeDisplayName(command.dto.displayName);
    }

    await this.repository.update(user);

    return Result.success(UserMapper.toDto(user), {
      statusCode: HttpStatus.OK,
      code: domain.UserSuccessCode.UPDATED,
      message: domain.UserMessages.SUCCESS.UPDATED,
    });
  }
}
