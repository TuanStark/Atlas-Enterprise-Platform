import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export const NOTIFICATION_REPOSITORY = 'NOTIFICATION_REPOSITORY';

export interface NotificationCreateInput {
  tenantId: string;
  templateId?: string;
  targetModule?: string;
  targetEntity?: string;
  targetRecordId?: string;
  title: string;
  message: string;
  metadata?: any;
  createdByPrincipalId?: string;
  scheduledAt?: string;
  recipientPrincipalIds: string[];
}

export interface NotificationRepository {
  create(input: NotificationCreateInput): Promise<any>;
  markAsRead(recipientId: Identifier): Promise<void>;
  markAllAsRead(principalId: Identifier): Promise<void>;
  findForPrincipal(principalId: Identifier): Promise<any[]>;
}
