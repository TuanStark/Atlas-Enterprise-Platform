import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { NOTIFICATION_REPOSITORY } from '../../domain/repositories/notification.repository';
import type { NotificationRepository } from '../../domain/repositories/notification.repository';
import { NotificationDto } from '../dto/notification.dto';

export class ListNotificationsForUserQuery {
  constructor(public readonly principalId: Identifier) {}
}

@QueryHandler(ListNotificationsForUserQuery)
export class ListNotificationsForUserHandler implements IQueryHandler<ListNotificationsForUserQuery> {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly repository: NotificationRepository,
  ) {}

  async execute(query: ListNotificationsForUserQuery): Promise<NotificationDto[]> {
    const recipients = await this.repository.findForPrincipal(query.principalId);

    return recipients.map((r) => ({
      recipientId: r.id,
      notificationId: r.notificationId,
      title: r.notification.title || '',
      message: r.notification.message || '',
      isRead: r.isRead || false,
      readAt: r.readAt || undefined,
      createdAt: r.createdAt,
    }));
  }
}
