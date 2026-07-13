import { IsUUID } from 'class-validator';

export class AssignRoleDto {
  @IsUUID()
  roleId: string;

  @IsUUID()
  scopeId: string;
}
