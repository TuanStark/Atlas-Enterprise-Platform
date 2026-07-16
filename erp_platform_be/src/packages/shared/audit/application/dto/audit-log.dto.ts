import { ApiProperty } from '@nestjs/swagger';

export class AuditDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fieldName: string;

  @ApiProperty({ required: false })
  oldValue?: string;

  @ApiProperty({ required: false })
  newValue?: string;
}

export class AuditLogDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty({ required: false })
  targetModule?: string;

  @ApiProperty({ required: false })
  targetEntity?: string;

  @ApiProperty({ required: false })
  targetRecordId?: string;

  @ApiProperty({ enum: ['create', 'update', 'delete', 'login', 'logout', 'approve', 'reject', 'export', 'import'] })
  action: string;

  @ApiProperty({ required: false })
  actorPrincipalId?: string;

  @ApiProperty({ required: false })
  actorName?: string;

  @ApiProperty({ required: false })
  ipAddress?: string;

  @ApiProperty({ required: false })
  userAgent?: string;

  @ApiProperty({ required: false })
  requestId?: string;

  @ApiProperty({ required: false })
  metadata?: any;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: [AuditDetailDto], default: [] })
  details: AuditDetailDto[];
}
