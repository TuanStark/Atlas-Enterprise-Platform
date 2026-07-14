import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreatePositionDto {
  @IsString()
  @MaxLength(50)
  code!: string;

  @IsString()
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  level?: number;
}
