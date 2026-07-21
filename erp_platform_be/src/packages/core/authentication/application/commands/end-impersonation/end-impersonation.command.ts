export class EndImpersonationCommand {
  constructor(
    public readonly impersonatorPrincipalId: string,
    public readonly tenantId: string,
  ) {}
}
