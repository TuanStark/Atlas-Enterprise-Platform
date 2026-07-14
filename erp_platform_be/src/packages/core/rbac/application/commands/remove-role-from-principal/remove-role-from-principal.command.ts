export class RemoveRoleFromPrincipalCommand {
  constructor(
    public readonly principalId: string,
    public readonly roleId: string,
    public readonly scopeId: string,
  ) {}
}
