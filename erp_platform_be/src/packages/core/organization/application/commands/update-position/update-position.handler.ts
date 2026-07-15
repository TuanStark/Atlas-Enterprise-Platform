import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdatePositionCommand } from './update-position.command';
import * as positionRepository from '@core/organization/domain/repositories/position.repository';
import { BaseCommandHandler, Result } from '@shared-kernel/application';

@CommandHandler(UpdatePositionCommand)
export class UpdatePositionHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdatePositionCommand>
{
  constructor(
    @Inject(positionRepository.POSITION_REPOSITORY)
    private readonly repository: positionRepository.PositionRepository,
  ) {
    super();
  }

  async execute(command: UpdatePositionCommand): Promise<Result<void>> {
    const position = this.ensureFound(
      await this.repository.findById(command.organizationId, command.positionId),
      'Position',
      command.positionId.toString(),
    );

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
