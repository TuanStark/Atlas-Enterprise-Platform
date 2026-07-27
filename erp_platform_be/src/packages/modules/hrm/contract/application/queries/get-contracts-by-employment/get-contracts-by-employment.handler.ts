import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetContractsByEmploymentQuery } from './get-contracts-by-employment.query';
import { IContractRepository } from '../../../domain/repositories/contract.repository';
import * as contractRepo from '../../../domain/repositories/contract.repository';

@QueryHandler(GetContractsByEmploymentQuery)
export class GetContractsByEmploymentHandler implements IQueryHandler<GetContractsByEmploymentQuery> {
  constructor(
    @Inject(contractRepo.IContractRepository)
    private readonly repository: IContractRepository,
  ) {}

  async execute(query: GetContractsByEmploymentQuery): Promise<any[]> {
    const contracts = await this.repository.findByEmploymentId(query.tenantId, query.employmentId);

    // Convert to DTO
    return contracts.map((c) => ({
      id: c.id.toString(),
      employmentId: c.employmentId.toString(),
      contractNumber: c.contractNumber,
      contractTypeId: c.contractTypeId.toString(),
      startDate: c.startDate,
      endDate: c.endDate,
      signedDate: c.signedDate,
      status: c.status,
      baseSalary: c.baseSalary,
      workingHours: c.workingHours,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      annexes: c.annexes.map((a) => ({
        id: a.id.toString(),
        annexNumber: a.annexNumber,
        content: a.content,
        effectiveDate: a.effectiveDate,
      })),
    }));
  }
}
