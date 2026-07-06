import { HttpStatus, Inject } from '@nestjs/common';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result } from '@shared-kernel/application';

import * as domain from '../../../domain';

import { SuspendPrincipalCommand } from './suspend-principal.command';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

@CommandHandler(SuspendPrincipalCommand)
export class SuspendPrincipalHandler implements ICommandHandler<SuspendPrincipalCommand> {
  constructor(
    @Inject(domain.PRINCIPAL_REPOSITORY)
    private readonly repository: domain.PrincipalRepository,
  ) {}

  async execute(command: SuspendPrincipalCommand): Promise<Result<void>> {
    const principal = await this.repository.findById(Identifier.create(command.id));

    if (!principal) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: domain.PrincipalErrorCode.NOT_FOUND,
        message: domain.PrincipalMessages.ERROR.NOT_FOUND,
      });
    }

    principal.suspend();

    await this.repository.update(principal);

    return Result.success(undefined, {
      statusCode: HttpStatus.OK,
      code: domain.PrincipalSuccessCode.SUSPENDED,
      message: domain.PrincipalMessages.SUCCESS.SUSPENDED,
    });
  }
}
