import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class GetPositionQuery {
  constructor(
    public readonly organizationId: Identifier,
    public readonly positionId: Identifier,
  ) {}
}
