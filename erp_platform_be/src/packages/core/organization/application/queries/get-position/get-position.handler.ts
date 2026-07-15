import { HttpStatus, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPositionQuery } from './get-position.query';
import * as positionRepository from '@core/organization/domain/repositories/position.repository';
import { PositionReadModel } from '../../read-models/position.read-model';
import { Result } from '@shared-kernel/application';
import { OrganizationErrorCode, OrganizationMessages } from '@core/organization/domain';
import { PositionReadModelMapper } from '../../mappers/position.read-model.mapper';

@QueryHandler(GetPositionQuery)
export class GetPositionHandler implements IQueryHandler<GetPositionQuery> {
  constructor(
    @Inject(positionRepository.POSITION_REPOSITORY)
    private readonly repository: positionRepository.PositionRepository,
  ) {}

  async execute(query: GetPositionQuery): Promise<Result<PositionReadModel>> {
    const position = await this.repository.findById(query.organizationId, query.positionId);

    if (!position) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: OrganizationErrorCode.ORGANIZATION_NOT_FOUND,
        message: OrganizationMessages.ERROR.ORGANIZATION_NOT_FOUND,
      });
    }

    return Result.success(PositionReadModelMapper.toReadModel(position));
  }
}
