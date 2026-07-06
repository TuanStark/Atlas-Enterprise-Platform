import { HttpStatus, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Result } from '@shared-kernel/application';
import * as domain from '../../../domain';
import { PrincipalMapper } from '../../mappers';
import { PrincipalDto } from '../../dto';
import { GetPrincipalQuery } from './get-principal.query';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

@QueryHandler(GetPrincipalQuery)
export class GetPrincipalHandler implements IQueryHandler<GetPrincipalQuery> {
  constructor(
    @Inject(domain.PRINCIPAL_REPOSITORY)
    private readonly repository: domain.PrincipalRepository,
  ) {}

  async execute(query: GetPrincipalQuery): Promise<Result<PrincipalDto>> {
    const principal = await this.repository.findById(Identifier.create(query.id));

    if (!principal) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: domain.PrincipalErrorCode.NOT_FOUND,
        message: domain.PrincipalMessages.ERROR.NOT_FOUND,
      });
    }

    return Result.success(PrincipalMapper.toDto(principal), {
      statusCode: HttpStatus.OK,
      code: domain.PrincipalSuccessCode.FOUND,
      message: domain.PrincipalMessages.SUCCESS.FOUND,
    });
  }
}
