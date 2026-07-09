import { HttpStatus, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '@shared-kernel/application';
import * as domain from '@core/identity/domain';
import { LogoutCommand } from './logout.command';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand> {
  constructor(
    @Inject(domain.REFRESH_TOKEN_REPOSITORY)
    private readonly repository: domain.RefreshTokenRepository,
  ) {}

  async execute(command: LogoutCommand) {
    const token = await this.repository.findByToken(command.refreshToken);

    if (!token) {
      return Result.success(undefined, {
        statusCode: HttpStatus.OK,
      });
    }

    token.revoke();

    await this.repository.update(token);

    return Result.success(undefined, {
      statusCode: HttpStatus.OK,
    });
  }
}
