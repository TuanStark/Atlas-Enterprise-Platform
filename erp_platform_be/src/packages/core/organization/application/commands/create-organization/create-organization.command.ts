import { CreateOrganizationDto } from '@core/organization/dto';

export class CreateOrganizationCommand {
  constructor(public readonly dto: CreateOrganizationDto) {}
}
