import { HttpStatus, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Result } from '@shared-kernel/application';
import { GetUserQuery } from './get-user.query';
import * as domain from '@core/identity/domain';
import { UserDto } from '../../dto';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { UserErrorCode } from '@core/identity/domain';
import { UserMapper } from '../../mappers';

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(
    @Inject(domain.USER_REPOSITORY)
    private readonly repository: domain.UserRepository,
  ) {}

  async execute(query: GetUserQuery): Promise<Result<UserDto>> {
    const user = await this.repository.findById(Identifier.create(query.id));

    if (!user) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: UserErrorCode.NOT_FOUND,
        message: domain.UserMessages.ERROR.NOT_FOUND,
      });
    }

    return Result.success(UserMapper.toDto(user), {
      statusCode: HttpStatus.OK,
      code: 'USER_FOUND',
      message: 'Success',
    });
  }
}
