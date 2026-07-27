import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListContractsQuery } from './list-contracts.query';
import { IContractRepository } from '../../../domain/repositories/contract.repository';
import * as contractRepo from '../../../domain/repositories/contract.repository';

@QueryHandler(ListContractsQuery)
export class ListContractsHandler implements IQueryHandler<ListContractsQuery> {
  constructor(
    @Inject(contractRepo.IContractRepository)
    private readonly repository: IContractRepository,
  ) {}

  async execute(query: ListContractsQuery): Promise<{ data: any[]; total: number }> {
    return this.repository.findAll(query.tenantId, {
      page: query.page,
      pageSize: query.pageSize,
      status: query.status,
    });
  }
}
