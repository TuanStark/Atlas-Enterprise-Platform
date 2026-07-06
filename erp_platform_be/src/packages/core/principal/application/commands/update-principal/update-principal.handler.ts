import { HttpStatus, Inject } from '@nestjs/common';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Result } from '@shared-kernel/application';

import * as domain from '../../../domain';

import { PrincipalDto } from '../../dto';

import { PrincipalMapper } from '../../mappers';

import { UpdatePrincipalCommand } from './update-principal.command';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

@CommandHandler(UpdatePrincipalCommand)
export class UpdatePrincipalHandler implements ICommandHandler<UpdatePrincipalCommand> {
  constructor(
    @Inject(domain.PRINCIPAL_REPOSITORY)
    private readonly repository: domain.PrincipalRepository,
  ) {}

  async execute(command: UpdatePrincipalCommand): Promise<Result<PrincipalDto>> {
    const principal = await this.repository.findById(Identifier.create(command.id));

    if (!principal) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: domain.PrincipalErrorCode.NOT_FOUND,
        message: domain.PrincipalMessages.ERROR.NOT_FOUND,
      });
    }

    principal.rename(command.dto.displayName ?? principal.displayName ?? '');

    await this.repository.update(principal);

    return Result.success(PrincipalMapper.toDto(principal), {
      statusCode: HttpStatus.OK,
      code: domain.PrincipalSuccessCode.UPDATED,
      message: domain.PrincipalMessages.SUCCESS.UPDATED,
    });
  }
}
