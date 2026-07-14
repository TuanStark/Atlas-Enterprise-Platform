import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class ListPositionsQuery {
  constructor(public readonly organizationId: Identifier) {}
}
