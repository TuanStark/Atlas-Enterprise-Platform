import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  color?: string;

  @ApiProperty({ required: false })
  description?: string;
}

export class AssignTagDto {
  @ApiProperty()
  tagId: string;

  @ApiProperty()
  targetModule: string;

  @ApiProperty()
  targetEntity: string;

  @ApiProperty()
  targetRecordId: string;
}

export class TagDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  color?: string;

  @ApiProperty({ required: false })
  description?: string;
}

export class TagAssignmentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tagId: string;

  @ApiProperty()
  targetModule: string;

  @ApiProperty()
  targetEntity: string;

  @ApiProperty()
  targetRecordId: string;

  @ApiProperty({ type: TagDto })
  tag: TagDto;
}
