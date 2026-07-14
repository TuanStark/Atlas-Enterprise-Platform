import { UpdatePositionDto } from '@core/organization/dto/update-position.dto';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class UpdatePositionCommand {
  constructor(
    public readonly organizationId: Identifier,
    public readonly positionId: Identifier,
    public readonly dto: UpdatePositionDto,
  ) {}
}
