import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrganizationUnitTypeDto {
  @ApiProperty({ example: 'DEP', description: 'Unique code for the unit type' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @ApiProperty({ example: 'Department', description: 'Name of the unit type' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'A branch or functional unit within the organization' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateOrganizationUnitTypeDto {
  @ApiPropertyOptional({ example: 'Division' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class OrganizationUnitTypeDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  code: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string;
}
