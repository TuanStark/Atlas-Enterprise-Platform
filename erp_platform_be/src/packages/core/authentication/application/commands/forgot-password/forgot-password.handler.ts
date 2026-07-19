import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from 'src/database/prisma.service';
import { PasswordResetService } from '../../services/password-reset.service';
import { ForgotPasswordCommand } from './forgot-password.command';
import { Result } from '@shared-kernel/application';
import { Logger } from '@nestjs/common';
import { MailService } from 'src/packages/shared/mail/mail.service';

@CommandHandler(ForgotPasswordCommand)
export class ForgotPasswordHandler implements ICommandHandler<ForgotPasswordCommand> {
  private readonly logger = new Logger(ForgotPasswordHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordResetService: PasswordResetService,
    private readonly mailService: MailService,
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
    const resetLink = `${process.env.HOST_FE || 'http://localhost:5173'}/reset-password?token=${token}`;

    try {
      await this.mailService.sendMailWithTemplate(
        email,
        '[Atlas Platform] Yêu cầu đặt lại mật khẩu',
        'forgot-password',
        { resetLink },
      );
    } catch (error) {
      this.logger.error(`Error sending forgot password email to ${email}`, error);
      // We don't crash the handler because of mail failure in dev or staging to allow tests
    }

    return Result.success();
  }
}

