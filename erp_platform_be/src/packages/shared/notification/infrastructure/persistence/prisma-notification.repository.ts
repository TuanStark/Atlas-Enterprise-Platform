import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import {
  NotificationRepository,
  NotificationCreateInput,
} from '../../domain/repositories/notification.repository';

@Injectable()
export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: NotificationCreateInput): Promise<any> {
    return this.prisma.notification.create({
      data: {
        id: undefined,
        tenantId: input.tenantId,
        templateId: input.templateId || undefined,
        targetModule: input.targetModule || undefined,
        targetEntity: input.targetEntity || undefined,
        targetRecordId: input.targetRecordId || undefined,
        title: input.title,
        message: input.message,
        metadata: input.metadata || undefined,
        createdByPrincipalId: input.createdByPrincipalId || undefined,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
        notificationRecipients: {
          create: input.recipientPrincipalIds.map((pId) => ({
            principalId: pId,
            isRead: false,
          })),
        },
      },
      include: {
        notificationRecipients: true,
      },
    });
  }

  async markAsRead(recipientId: Identifier): Promise<void> {
    await this.prisma.notificationRecipient.update({
      where: { id: recipientId.getValue() },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(principalId: Identifier): Promise<void> {
    await this.prisma.notificationRecipient.updateMany({
      where: {
        principalId: principalId.getValue(),
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async findForPrincipal(principalId: Identifier): Promise<any[]> {
    return this.prisma.notificationRecipient.findMany({
      where: { principalId: principalId.getValue() },
      include: {
        notification: {
          include: {
            createdByPrincipal: {
              include: {
                user: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
