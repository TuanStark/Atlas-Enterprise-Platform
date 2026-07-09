import {
    HttpStatus,
    Inject,
} from '@nestjs/common';
import {
    QueryHandler,
    IQueryHandler,
} from '@nestjs/cqrs';
import {
    Result,
} from '@shared-kernel/application';
import { GetUserByEmailQuery } from './get-user-by-email.query';
import * as domain from '@core/identity/domain';
import { UserMapper } from '../../mappers';

@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler
    implements IQueryHandler<GetUserByEmailQuery> {

    constructor(
        @Inject(domain.USER_REPOSITORY)
        private readonly repository: domain.UserRepository,

    ) { }

    async execute(query: GetUserByEmailQuery) {
        const user = await this.repository.findByEmail(domain.Email.create(query.email));
        if (!user) {
            return Result.failure({
                statusCode: HttpStatus.NOT_FOUND,
                code: domain.UserErrorCode.NOT_FOUND,
                message: domain.UserMessages.ERROR.NOT_FOUND,
            });
        }

        return Result.success(
            UserMapper.toDto(user),
        );
    }
}