import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePositionCommand } from './create-position.command';
import * as positionRepository from '@core/organization/domain/repositories/position.repository';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Position } from '@core/organization/domain/entities/position';
import { EntityAlreadyExistsException } from '@shared-kernel/exceptions';

@CommandHandler(CreatePositionCommand)
export class CreatePositionHandler implements ICommandHandler<CreatePositionCommand> {
  constructor(
    @Inject(positionRepository.POSITION_REPOSITORY)
    private readonly repository: positionRepository.PositionRepository,
  ) {}

  async execute(command: CreatePositionCommand): Promise<Identifier> {
    const { organizationId, dto } = command;

    const exists = await this.repository.existsByCode(
      organizationId,

      dto.code,
    );

    if (exists) {
      throw new EntityAlreadyExistsException('Position', 'code', dto.code);
    }

    const position = Position.create({
      organizationId,
      code: dto.code,
      name: dto.name,
      description: dto.description,
      level: dto.level,
    });
    await this.repository.save(position);
    return position.id;
  }
}
