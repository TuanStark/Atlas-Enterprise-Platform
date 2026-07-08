import {
    HttpStatus,
    Inject,
} from '@nestjs/common';

import {
    CommandHandler,
    ICommandHandler,
} from '@nestjs/cqrs';

import { Result } from '@shared-kernel/application';

import * as domain from '../../../domain';
import { LockUserCommand } from './lock-user.command';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

@CommandHandler(LockUserCommand)
export class LockUserHandler
    implements ICommandHandler<LockUserCommand> {
    constructor(
        @Inject(domain.USER_REPOSITORY)
        private readonly repository: domain.UserRepository,
    ) { }

    async execute(
        command: LockUserCommand,
    ) {

        const user =
            await this.repository.findById(
                Identifier.create(command.id),
            );

        if (!user) {
            return Result.failure({
                statusCode: HttpStatus.NOT_FOUND,
                code: domain.UserErrorCode.NOT_FOUND,
                message: domain.UserMessages.ERROR.NOT_FOUND,
            });
        }

        user.lock();

        await this.repository.update(user);

        return Result.success(undefined, {
            statusCode: HttpStatus.OK,
            code: 'USER_LOCKED',
            message: 'User locked successfully.',
        });
    }
}