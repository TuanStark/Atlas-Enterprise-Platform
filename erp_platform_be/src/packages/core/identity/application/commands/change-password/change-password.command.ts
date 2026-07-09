import { ChangePasswordDto } from '../../dto';

export class ChangePasswordCommand {
  constructor(
    public readonly principalId: string,
    public readonly dto: ChangePasswordDto,
  ) {}
}
