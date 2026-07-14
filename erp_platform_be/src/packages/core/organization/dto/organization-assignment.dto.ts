import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssignmentStatus } from '@prisma/client';

export class CreateOrganizationAssignmentDto {
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @ApiProperty({ example: 'employment-uuid' })
  @IsUUID()
  @IsNotEmpty()
  employmentId: string;

  @ApiProperty({ example: 'department-uuid' })
  @IsUUID()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({ example: 'position-uuid' })
  @IsUUID()
  @IsNotEmpty()
  positionId: string;

  @ApiPropertyOptional({ example: 'job-title-uuid' })
  @IsOptional()
  @IsUUID()
  jobTitleId?: string;

  @ApiPropertyOptional({ example: 'manager-employment-uuid' })
  @IsOptional()
  @IsUUID()
  managerEmploymentId?: string;

  @ApiPropertyOptional({ example: 'work-location-uuid' })
  @IsOptional()
  @IsUUID()
  workLocationId?: string;

  @ApiPropertyOptional({ example: 'cost-center-uuid' })
  @IsOptional()
  @IsUUID()
  costCenterId?: string;

  @ApiProperty({ example: '2026-07-14' })
  @IsDateString()
  @IsNotEmpty()
  effectiveFrom: string;

  @ApiPropertyOptional({ example: '2027-07-14' })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean = true;

  @ApiPropertyOptional({ enum: AssignmentStatus, example: AssignmentStatus.active })
  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus = AssignmentStatus.active;
}

export class UpdateOrganizationAssignmentDto {
  @ApiPropertyOptional({ example: 'department-uuid' })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({ example: 'position-uuid' })
  @IsOptional()
  @IsUUID()
  positionId?: string;

  @ApiPropertyOptional({ example: 'job-title-uuid' })
  @IsOptional()
  @IsUUID()
  jobTitleId?: string;

  @ApiPropertyOptional({ example: 'manager-employment-uuid' })
  @IsOptional()
  @IsUUID()
  managerEmploymentId?: string;

  @ApiPropertyOptional({ example: 'work-location-uuid' })
  @IsOptional()
  @IsUUID()
  workLocationId?: string;

  @ApiPropertyOptional({ example: 'cost-center-uuid' })
  @IsOptional()
  @IsUUID()
  costCenterId?: string;

  @ApiPropertyOptional({ example: '2026-07-20' })
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @ApiPropertyOptional({ example: '2027-07-20' })
  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ enum: AssignmentStatus, example: AssignmentStatus.active })
  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;
}

export class OrganizationAssignmentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  tenantId: string;

  @ApiProperty()
  employmentId: string;

  @ApiProperty()
  departmentId: string;

  @ApiProperty()
  positionId: string;

  @ApiPropertyOptional()
  jobTitleId?: string;

  @ApiPropertyOptional()
  managerEmploymentId?: string;

  @ApiPropertyOptional()
  workLocationId?: string;

  @ApiPropertyOptional()
  costCenterId?: string;

  @ApiProperty()
  effectiveFrom: Date;

  @ApiPropertyOptional()
  effectiveTo?: Date;

  @ApiProperty()
  isPrimary: boolean;

  @ApiProperty()
  status: AssignmentStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
