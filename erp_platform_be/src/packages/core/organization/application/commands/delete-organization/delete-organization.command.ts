export class DeleteOrganizationCommand {
  constructor(
    public readonly tenantId: string,
    public readonly organizationId: string,
  ) {}
}
