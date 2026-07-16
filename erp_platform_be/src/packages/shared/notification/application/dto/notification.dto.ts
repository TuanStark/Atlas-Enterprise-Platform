import { ApiProperty } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ required: false })
  templateId?: string;

  @ApiProperty({ required: false })
  targetModule?: string;

  @ApiProperty({ required: false })
  targetEntity?: string;

  @ApiProperty({ required: false })
  targetRecordId?: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  metadata?: any;

  @ApiProperty({ type: [String] })
  recipientPrincipalIds: string[];

  @ApiProperty({ required: false })
  scheduledAt?: string;
}

export class NotificationDto {
  @ApiProperty()
  recipientId: string;

  @ApiProperty()
  notificationId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty({ required: false })
  readAt?: Date;

  @ApiProperty()
  createdAt: Date;
}
