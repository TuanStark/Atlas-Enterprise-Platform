import {
    HttpStatus,
    Inject,
} from '@nestjs/common';

import {
    CommandHandler,
    ICommandHandler,
} from '@nestjs/cqrs';

import { Result } from '@shared-kernel/application';



import { UnlockUserCommand } from './unlock-user.command';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import * as domain from '../../../domain';
@CommandHandler(UnlockUserCommand)
export class UnlockUserHandler
    implements ICommandHandler<UnlockUserCommand> {
    constructor(
        @Inject(domain.USER_REPOSITORY)
        private readonly repository: domain.UserRepository,
    ) { }

    async execute(
        command: UnlockUserCommand,
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

        user.activate();

        await this.repository.update(user);

        return Result.success(undefined, {
            statusCode: HttpStatus.OK,
            code: 'USER_UNLOCKED',
            message: 'User unlocked successfully.',
        });
    }
}