import { ForgotPasswordDto } from '../../dto';

export class ForgotPasswordCommand {
  constructor(public readonly dto: ForgotPasswordDto) {}
}
