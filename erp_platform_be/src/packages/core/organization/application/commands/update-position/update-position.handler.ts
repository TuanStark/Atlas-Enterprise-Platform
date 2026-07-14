import { HttpStatus, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePositionCommand } from './update-position.command';
import * as positionRepository from '@core/organization/domain/repositories/position.repository';
import { Result } from '@shared-kernel/application';
import { OrganizationErrorCode, OrganizationMessages } from '@core/organization/domain';

@CommandHandler(UpdatePositionCommand)
export class UpdatePositionHandler implements ICommandHandler<UpdatePositionCommand> {
  constructor(
    @Inject(positionRepository.POSITION_REPOSITORY)
    private readonly repository: positionRepository.PositionRepository,
  ) {}

  async execute(command: UpdatePositionCommand): Promise<Result<void>> {
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

    const dto = command.dto;

    if (dto.code) {
      position.changeCode(dto.code);
    }

    if (dto.name) {
      position.rename(dto.name);
    }

    if (dto.description !== undefined) {
      position.changeDescription(dto.description);
    }

    if (dto.level !== undefined) {
      position.changeLevel(dto.level);
    }

    await this.repository.update(position);

    return Result.success(undefined);
  }
}
