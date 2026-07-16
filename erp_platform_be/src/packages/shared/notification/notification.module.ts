import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from 'src/database/prisma.module';
import { NotificationController } from './presentation/controllers/notification.controller';
import { CreateNotificationHandler, MarkNotificationAsReadHandler, MarkAllNotificationsAsReadHandler } from './application/commands/notification.commands';
import { ListNotificationsForUserHandler } from './application/queries/notification.queries';
import { NOTIFICATION_REPOSITORY } from './domain/repositories/notification.repository';
import { PrismaNotificationRepository } from './infrastructure/persistence/prisma-notification.repository';

const CommandHandlers = [CreateNotificationHandler, MarkNotificationAsReadHandler, MarkAllNotificationsAsReadHandler];
const QueryHandlers = [ListNotificationsForUserHandler];

@Module({
  imports: [PrismaModule, CqrsModule],
  controllers: [NotificationController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: PrismaNotificationRepository,
    },
  ],
  exports: [NOTIFICATION_REPOSITORY],
})
export class NotificationModule {}
