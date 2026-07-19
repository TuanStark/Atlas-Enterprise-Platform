import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { PasswordResetService } from '../../services/password-reset.service';
import { ResetPasswordCommand } from './reset-password.command';
import { Result } from '@shared-kernel/application';
import * as bcrypt from 'bcrypt';

@CommandHandler(ResetPasswordCommand)
export class ResetPasswordHandler implements ICommandHandler<ResetPasswordCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordResetService: PasswordResetService,
  ) {}

  async execute(command: ResetPasswordCommand): Promise<Result<void>> {
    const { token, newPassword } = command.dto;
    const email = this.passwordResetService.getEmailByToken(token);

    if (!email) {
      return Result.failure({
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'INVALID_TOKEN',
        message: 'Mã xác nhận khôi phục mật khẩu không hợp lệ hoặc đã hết hạn.',
      });
    }

    const user = await this.prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      return Result.failure({
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'USER_NOT_FOUND',
        message: 'Không tìm thấy tài khoản người dùng liên kết với mã xác nhận này.',
      });
    }

    // Băm mật khẩu mới với salt 12 (giống seeder)
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Cập nhật credentials
    await this.prisma.credential.updateMany({
      where: {
        principalId: user.principalId,
        type: 'password',
      },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
      },
    });

    // Invalidate token
    this.passwordResetService.invalidateToken(token);

    return Result.success();
  }
}
