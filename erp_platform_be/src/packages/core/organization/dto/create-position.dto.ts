import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePositionDto {
  @ApiProperty({ description: 'Position code', example: 'POS001' })
  @IsString()
  @MaxLength(50)
  code!: string;

  @ApiProperty({ description: 'Position name', example: 'Senior Software Engineer' })
  @IsString()
  @MaxLength(150)
  name!: string;

  @ApiPropertyOptional({
    description: 'Position description',
    example: 'Software development leadership role',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Position hierarchy level', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  level?: number;
}
