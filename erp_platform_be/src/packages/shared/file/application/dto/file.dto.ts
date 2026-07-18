import { ApiProperty } from '@nestjs/swagger';

export class CreateFileDto {
  @ApiProperty({ required: false })
  code?: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  extension: string;

  @ApiProperty({ enum: ['public', 'private', 'restricted'] })
  visibility: 'public' | 'private' | 'restricted';

  @ApiProperty()
  size: number;

  @ApiProperty({ required: false })
  checksum?: string;

  @ApiProperty({ required: false })
  metadata?: any;
}

export class FileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty({ required: false })
  code?: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  extension: string;

  @ApiProperty()
  visibility: string;

  @ApiProperty()
  size: number;

  @ApiProperty({ required: false })
  checksum?: string;

  @ApiProperty({ required: false })
  metadata?: any;

  @ApiProperty()
  createdAt: Date;
}
