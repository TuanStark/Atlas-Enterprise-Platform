import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '@shared-kernel/application';
import * as domain from '../../../domain';
import { PrincipalMapper } from '../../mappers';
import { CreatePrincipalCommand } from './create-principal.command';

@CommandHandler(CreatePrincipalCommand)
@Injectable()
export class CreatePrincipalHandler implements ICommandHandler<CreatePrincipalCommand> {
  constructor(
    @Inject(domain.PRINCIPAL_REPOSITORY)
    private readonly repository: domain.PrincipalRepository,
  ) {}

  async execute(command: CreatePrincipalCommand): Promise<Result<void>> {
    const principal = PrincipalMapper.toDomain(command.dto);

    await this.repository.save(principal);

    return Result.success(undefined, {
      statusCode: HttpStatus.CREATED,
      code: domain.PrincipalSuccessCode.CREATED,
      message: domain.PrincipalMessages.SUCCESS.CREATED,
    });
  }
}
