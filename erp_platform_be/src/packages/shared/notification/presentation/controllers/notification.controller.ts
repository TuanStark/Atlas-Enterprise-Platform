import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentContext } from '@core/identity/presentation/decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { CreateNotificationDto, NotificationDto } from '../../application/dto/notification.dto';
import {
  CreateNotificationCommand,
  MarkNotificationAsReadCommand,
  MarkAllNotificationsAsReadCommand,
} from '../../application/commands/notification.commands';
import { ListNotificationsForUserQuery } from '../../application/queries/notification.queries';
import { RequirePermission } from '@core/rbac/presentation/decorators/require-permission.decorator';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermission('shared.notification:write')
  @ApiOperation({ summary: 'Send a new notification' })
  @ApiCreatedResponse({ description: 'Notification scheduled/sent successfully' })
  async create(
    @CurrentContext() context: RequestContext,
    @Body() dto: CreateNotificationDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new CreateNotificationCommand({
        tenantId: context.tenantId,
        templateId: dto.templateId,
        targetModule: dto.targetModule,
        targetEntity: dto.targetEntity,
        targetRecordId: dto.targetRecordId,
        title: dto.title,
        message: dto.message,
        metadata: dto.metadata,
        createdByPrincipalId: context.principalId,
        scheduledAt: dto.scheduledAt,
        recipientPrincipalIds: dto.recipientPrincipalIds,
      }),
    );
  }

  @Get()
  @RequirePermission('shared.notification:read')
  @ApiOperation({ summary: 'List notifications for current user' })
  @ApiOkResponse({ type: [NotificationDto] })
  async listMyNotifications(@CurrentContext() context: RequestContext): Promise<NotificationDto[]> {
    return this.queryBus.execute(
      new ListNotificationsForUserQuery(Identifier.create(context.principalId)),
    );
  }

  @Patch(':recipientId/read')
  @RequirePermission('shared.notification:read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiOkResponse({ description: 'Notification marked as read' })
  async readOne(@Param('recipientId') recipientId: string): Promise<void> {
    await this.commandBus.execute(
      new MarkNotificationAsReadCommand(Identifier.create(recipientId)),
    );
  }

  @Post('read-all')
  @RequirePermission('shared.notification:read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiOkResponse({ description: 'All notifications marked as read' })
  async readAll(@CurrentContext() context: RequestContext): Promise<void> {
    await this.commandBus.execute(
      new MarkAllNotificationsAsReadCommand(Identifier.create(context.principalId)),
    );
  }
}
