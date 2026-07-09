export class RoleDto {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description?: string;
  permissionIds: string[];
}
