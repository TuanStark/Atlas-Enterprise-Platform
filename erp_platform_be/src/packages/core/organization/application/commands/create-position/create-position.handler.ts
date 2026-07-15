import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePositionCommand } from './create-position.command';
import { PositionApplicationService } from '../../services/position-application.service';

@CommandHandler(CreatePositionCommand)
export class CreatePositionHandler implements ICommandHandler<CreatePositionCommand> {
  constructor(private readonly service: PositionApplicationService) {}

  async execute(command: CreatePositionCommand) {
    const position = await this.service.create(command.organizationId, command.dto);
    return position.id;
  }
}
