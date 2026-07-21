import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SwitchAccountDto {
  @ApiProperty({ description: 'PrincipalId of the target user to impersonate' })
  @IsUUID()
  targetPrincipalId: string;
}
