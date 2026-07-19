import { ResetPasswordDto } from '../../dto';

export class ResetPasswordCommand {
  constructor(public readonly dto: ResetPasswordDto) {}
}
