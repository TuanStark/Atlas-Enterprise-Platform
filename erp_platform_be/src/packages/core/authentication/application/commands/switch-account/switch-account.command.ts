import { SwitchAccountDto } from '../../dto/switch-account.dto';

export class SwitchAccountCommand {
  constructor(
    public readonly currentPrincipalId: string,
    public readonly tenantId: string,
    public readonly dto: SwitchAccountDto,
  ) {}
}
