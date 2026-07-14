import { HttpStatus, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeletePositionCommand } from './delete-position.command';
import * as positionRepository from '@core/organization/domain/repositories/position.repository';
import { OrganizationErrorCode, OrganizationMessages } from '@core/organization/domain';
import { Result } from '@shared-kernel/application';

@CommandHandler(DeletePositionCommand)
export class DeletePositionHandler implements ICommandHandler<DeletePositionCommand> {
  constructor(
    @Inject(positionRepository.POSITION_REPOSITORY)
    private readonly repository: positionRepository.PositionRepository,
  ) {}

  async execute(command: DeletePositionCommand): Promise<Result<void>> {
    const position = await this.repository.findById(
      command.organizationId,

      command.positionId,
    );

    if (!position) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: OrganizationErrorCode.ORGANIZATION_NOT_FOUND,
        message: OrganizationMessages.ERROR.ORGANIZATION_NOT_FOUND,
      });
    }

    await this.repository.delete(position);

    return Result.success(undefined);
  }
}
