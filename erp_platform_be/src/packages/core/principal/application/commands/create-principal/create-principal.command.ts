import { CreatePrincipalDto } from '../../dto';

export class CreatePrincipalCommand {
  constructor(public readonly dto: CreatePrincipalDto) {}
}
