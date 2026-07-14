import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class DeletePositionCommand {
  constructor(
    public readonly organizationId: Identifier,
    public readonly positionId: Identifier,
  ) {}
}
