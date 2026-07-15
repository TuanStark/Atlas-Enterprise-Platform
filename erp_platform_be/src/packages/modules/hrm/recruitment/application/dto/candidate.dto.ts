import { IsString, IsOptional, IsEmail } from 'class-validator';

export class CreateCandidateDto {
  @IsString()
  fullName: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  resumeFileId?: string;
}

export class UpdateCandidateDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  resumeFileId?: string;
}
