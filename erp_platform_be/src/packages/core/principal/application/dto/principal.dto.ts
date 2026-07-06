import { PrincipalStatus, PrincipalType } from '../../domain';

export class PrincipalDto {
  id: string;
  tenantId: string;
  type: PrincipalType;
  status: PrincipalStatus;
  displayName?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}
