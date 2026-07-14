import { UpdateOrganizationDto } from '@core/organization/dto';

export class UpdateOrganizationCommand {
  constructor(
    public readonly tenantId: string,
    public readonly organizationId: string,
    public readonly dto: UpdateOrganizationDto,
  ) {}
}
