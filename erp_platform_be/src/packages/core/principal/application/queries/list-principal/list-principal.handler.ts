import { HttpStatus, Inject } from '@nestjs/common';

import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Page, Result } from '@shared-kernel/application';

import * as domain from '../../../domain';

import { PrincipalMapper } from '../../mappers';

import { PrincipalDto } from '../../dto';

import { ListPrincipalQuery } from './list-principal.query';

@QueryHandler(ListPrincipalQuery)
export class ListPrincipalHandler implements IQueryHandler<ListPrincipalQuery> {
  constructor(
    @Inject(domain.PRINCIPAL_REPOSITORY)
    private readonly repository: domain.PrincipalRepository,
  ) {}

  async execute(query: ListPrincipalQuery): Promise<Result<Page<PrincipalDto>>> {
    const principals = await this.repository.findAll();

    const items = principals.map((x) => PrincipalMapper.toDto(x));

    const page = Page.of(
      items,
      items.length,
      query.pagination?.page ?? 1,
      query.pagination?.limit ?? items.length,
    );

    return Result.success(page, {
      statusCode: HttpStatus.OK,
      code: domain.PrincipalSuccessCode.LIST_SUCCESS,
      message: domain.PrincipalMessages.SUCCESS.LIST_SUCCESS,
    });
  }
}
