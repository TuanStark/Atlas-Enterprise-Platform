export class GetOrganizationQuery {
  constructor(
    public readonly tenantId: string,
    public readonly organizationId: string,
  ) {}
}
