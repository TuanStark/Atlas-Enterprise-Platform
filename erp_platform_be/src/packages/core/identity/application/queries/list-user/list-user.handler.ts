import {
    HttpStatus,
    Inject,
} from '@nestjs/common';
import {
    IQueryHandler,
    QueryHandler,
} from '@nestjs/cqrs';
import {
    Page,
    Result,
} from '@shared-kernel/application';
import {
    ListUserQuery,
} from './list-user.query';
import * as domain from '@core/identity/domain';
import { UserMapper } from '../../mappers';

@QueryHandler(ListUserQuery)
export class ListUserHandler
    implements IQueryHandler<ListUserQuery> {
    constructor(
        @Inject(domain.USER_REPOSITORY)
        private readonly repository: domain.UserRepository,
    ) { }

    async execute(
        query: ListUserQuery,
    ) {
        const users = await this.repository.findAll();
        const items = users.map(UserMapper.toDto);
        return Result.success(
            Page.of(
                items,
                items.length,
                query.pagination?.page ?? 1,
                query.pagination?.limit ?? items.length,
            ),
            {
                statusCode: HttpStatus.OK,
                code: 'USER_LIST_SUCCESS',
                message: 'Success',
            },
        );
    }
}