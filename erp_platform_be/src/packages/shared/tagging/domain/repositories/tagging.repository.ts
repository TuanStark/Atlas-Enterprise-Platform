import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export const TAGGING_REPOSITORY = 'TAGGING_REPOSITORY';

export interface TagCreateInput {
  tenantId: string;
  code: string;
  name: string;
  color?: string;
  description?: string;
  createdByPrincipalId?: string;
}

export interface TagAssignInput {
  tagId: string;
  targetModule: string;
  targetEntity: string;
  targetRecordId: string;
  assignedByPrincipalId?: string;
}

export interface TaggingRepository {
  createTag(input: TagCreateInput): Promise<any>;
  deleteTag(id: Identifier): Promise<void>;
  listTags(tenantId: Identifier): Promise<any[]>;
  assignTag(input: TagAssignInput): Promise<any>;
  removeAssignment(tagId: Identifier, targetRecordId: Identifier): Promise<void>;
  findAssignmentsForRecord(
    targetModule: string,
    targetEntity: string,
    targetRecordId: Identifier,
  ): Promise<any[]>;
}
