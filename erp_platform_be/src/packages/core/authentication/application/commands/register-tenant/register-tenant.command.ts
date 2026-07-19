import { RegisterTenantDto } from '../../dto/register-tenant.dto';

export class RegisterTenantCommand {
  constructor(readonly dto: RegisterTenantDto) {}
}
