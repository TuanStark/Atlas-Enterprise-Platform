import { IsString, IsNumber } from 'class-validator';

export class InitializeLeaveBalanceDto {
  @IsString()
  employmentId: string;

  @IsNumber()
  year: number;
}

export class AdjustLeaveBalanceDto {
  @IsNumber()
  entitledDays: number;
}
