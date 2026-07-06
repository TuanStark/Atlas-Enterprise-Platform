import { UpdatePrincipalDto } from '../../dto';

export class UpdatePrincipalCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdatePrincipalDto,
  ) {}
}
