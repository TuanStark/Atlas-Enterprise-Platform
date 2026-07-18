import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { NOTIFICATION_REPOSITORY } from '../../domain/repositories/notification.repository';
import type {
  NotificationRepository,
  NotificationCreateInput,
} from '../../domain/repositories/notification.repository';

export class CreateNotificationCommand {
  constructor(public readonly input: NotificationCreateInput) {}
}

export class MarkNotificationAsReadCommand {
  constructor(public readonly recipientId: Identifier) {}
}

export class MarkAllNotificationsAsReadCommand {
  constructor(public readonly principalId: Identifier) {}
}

@CommandHandler(CreateNotificationCommand)
export class CreateNotificationHandler implements ICommandHandler<CreateNotificationCommand> {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly repository: NotificationRepository,
  ) {}

  async execute(command: CreateNotificationCommand): Promise<any> {
    return this.repository.create(command.input);
  }
}

@CommandHandler(MarkNotificationAsReadCommand)
export class MarkNotificationAsReadHandler implements ICommandHandler<MarkNotificationAsReadCommand> {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly repository: NotificationRepository,
  ) {}

  async execute(command: MarkNotificationAsReadCommand): Promise<void> {
    await this.repository.markAsRead(command.recipientId);
  }
}

@CommandHandler(MarkAllNotificationsAsReadCommand)
export class MarkAllNotificationsAsReadHandler implements ICommandHandler<MarkAllNotificationsAsReadCommand> {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly repository: NotificationRepository,
  ) {}

  async execute(command: MarkAllNotificationsAsReadCommand): Promise<void> {
    await this.repository.markAllAsRead(command.principalId);
  }
}
