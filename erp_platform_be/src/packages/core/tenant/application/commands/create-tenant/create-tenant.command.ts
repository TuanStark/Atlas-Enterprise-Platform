import { CreateTenantDto } from '../../dto/create-tenant.dto';

export class CreateTenantCommand {
  constructor(public readonly dto: CreateTenantDto) {}
}
