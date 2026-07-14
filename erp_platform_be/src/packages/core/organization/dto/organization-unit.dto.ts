import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrganizationUnitDto {
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiPropertyOptional({ example: 'parent-unit-uuid' })
  @IsOptional()
  @IsUUID()
  parentUnitId?: string;

  @ApiProperty({ example: 'unit-type-uuid' })
  @IsUUID()
  @IsNotEmpty()
  unitTypeId: string;

  @ApiProperty({ example: 'IT-DEP', description: 'Unique code for the unit' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'Information Technology', description: 'Name of the unit' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  sortOrder?: number = 0;

  @ApiPropertyOptional({ example: { costCenter: 'IT-01' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateOrganizationUnitDto {
  @ApiPropertyOptional({ example: 'Tech Department' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ example: { costCenter: 'IT-02' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class MoveOrganizationUnitDto {
  @ApiPropertyOptional({ example: 'new-parent-unit-uuid' })
  @IsOptional()
  @IsUUID()
  parentUnitId?: string;
}

export class OrganizationUnitDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  @ApiPropertyOptional()
  parentUnitId?: string;

  @ApiProperty()
  unitTypeId: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  path?: string;

  @ApiProperty()
  level: number;

  @ApiProperty()
  sortOrder: number;

  @ApiPropertyOptional()
  metadata?: Record<string, unknown>;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  version: number;
}
