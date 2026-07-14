import { IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrganizationCalendarDto {
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiProperty({ example: 'Standard Calendar' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Asia/Ho_Chi_Minh' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  timezone?: string;

  @ApiPropertyOptional({
    example: { Monday: true, Tuesday: true, Wednesday: true, Thursday: true, Friday: true },
  })
  @IsOptional()
  @IsObject()
  workDays?: Record<string, unknown>;
}

export class UpdateOrganizationCalendarDto {
  @ApiPropertyOptional({ example: 'Updated Calendar Name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'Asia/Tokyo' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  timezone?: string;

  @ApiPropertyOptional({ example: { Monday: true } })
  @IsOptional()
  @IsObject()
  workDays?: Record<string, unknown>;
}

export class OrganizationCalendarDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  timezone?: string;

  @ApiPropertyOptional()
  workDays?: Record<string, unknown>;

  @ApiProperty()
  createdAt: Date;
}
