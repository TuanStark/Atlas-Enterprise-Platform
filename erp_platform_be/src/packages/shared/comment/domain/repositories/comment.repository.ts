import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export const COMMENT_REPOSITORY = 'COMMENT_REPOSITORY';

export interface CommentCreateInput {
  tenantId: string;
  targetModule: string;
  targetEntity: string;
  targetRecordId: string;
  parentCommentId?: string;
  authorPrincipalId: string;
  content: string;
  metadata?: any;
}

export interface CommentUpdateInput {
  content: string;
  metadata?: any;
}

export interface CommentRepository {
  create(input: CommentCreateInput): Promise<any>;
  update(id: Identifier, input: CommentUpdateInput): Promise<any>;
  delete(id: Identifier): Promise<void>;
  findById(id: Identifier): Promise<any | null>;
  findForRecord(
    tenantId: Identifier,
    targetModule: string,
    targetEntity: string,
    targetRecordId: Identifier,
  ): Promise<any[]>;
}
