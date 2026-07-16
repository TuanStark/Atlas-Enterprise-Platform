import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export const FILE_REPOSITORY = 'FILE_REPOSITORY';

export interface FileCreateInput {
  tenantId: string;
  code?: string;
  fileName: string;
  mimeType: string;
  extension: string;
  visibility: 'public' | 'private' | 'restricted';
  size: number;
  checksum?: string;
  metadata?: any;
  createdByPrincipalId?: string;
}

export interface FileRepository {
  create(input: FileCreateInput): Promise<any>;
  delete(id: Identifier): Promise<void>;
  findById(id: Identifier): Promise<any | null>;
  listAll(tenantId: Identifier): Promise<any[]>;
}
