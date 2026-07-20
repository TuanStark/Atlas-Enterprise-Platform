import { ICommand } from '@nestjs/cqrs';

export class RemovePermissionFromRoleCommand implements ICommand {
  constructor(
    public readonly roleId: string,
    public readonly permissionId: string,
  ) {}
}
