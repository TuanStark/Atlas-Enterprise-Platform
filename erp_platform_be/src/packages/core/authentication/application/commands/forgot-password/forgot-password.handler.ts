import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from 'src/database/prisma.service';
import { PasswordResetService } from '../../services/password-reset.service';
import { ForgotPasswordCommand } from './forgot-password.command';
import { Result } from '@shared-kernel/application';
import { Logger } from '@nestjs/common';

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler implements ICommandHandler<ForgotPasswordCommand> {
  private readonly logger = new Logger(ForgotPasswordHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordResetService: PasswordResetService,
  ) { }

  async execute(command: ForgotPasswordCommand): Promise<Result<void>> {
    const email = command.dto.email.toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      this.logger.warn(`ForgotPassword: User with email ${email} not found.`);
      return Result.success();
    }

    const token = this.passwordResetService.createToken(email);
    const resetLink = `${process.env.HOST_FE}/reset-password?token=${token}`;

    this.logger.log(
      `\n======================================================\n[Dev] Liên kết đặt lại mật khẩu cho ${email}:\n${resetLink}\n======================================================\n`,
    );

    return Result.success();
  }
}
