import { CreatePositionDto } from '@core/organization/dto/create-position.dto';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class CreatePositionCommand {
  constructor(
    public readonly organizationId: Identifier,
    public readonly dto: CreatePositionDto,
  ) {}
}
