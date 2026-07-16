import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty()
  targetModule: string;

  @ApiProperty()
  targetEntity: string;

  @ApiProperty()
  targetRecordId: string;

  @ApiProperty({ required: false })
  parentCommentId?: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ required: false })
  metadata?: any;
}

export class UpdateCommentDto {
  @ApiProperty()
  content: string;

  @ApiProperty({ required: false })
  metadata?: any;
}

export class CommentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  targetModule: string;

  @ApiProperty()
  targetEntity: string;

  @ApiProperty()
  targetRecordId: string;

  @ApiProperty({ required: false })
  parentCommentId?: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ enum: ['active', 'edited', 'deleted'] })
  status: string;

  @ApiProperty()
  authorPrincipalId: string;

  @ApiProperty()
  authorName: string;

  @ApiProperty({ required: false })
  authorAvatarUrl?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ required: false })
  updatedAt?: Date;
}
