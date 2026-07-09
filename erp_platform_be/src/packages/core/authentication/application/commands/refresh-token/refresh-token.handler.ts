import { HttpStatus, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '@shared-kernel/application';
import * as domain from '@core/identity/domain';
import * as application from '@shared-kernel/application';
import { RefreshTokenCommand } from './refresh-token.command';
import { RefreshTokenMapper } from '../../mappers/refresh-token.mapper';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    @Inject(domain.REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: domain.RefreshTokenRepository,
    @Inject(application.JWT_TOKEN_SERVICE)
    private readonly jwtService: application.JwtTokenService,
  ) {}

  async execute(command: RefreshTokenCommand) {
    const oldToken = await this.refreshTokenRepository.findByToken(command.dto.refreshToken);

    if (!oldToken || oldToken.revoked) {
      return Result.failure({
        statusCode: HttpStatus.UNAUTHORIZED,
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Refresh token is invalid.',
      });
    }

    const principalId = oldToken.principalId.getValue();

    const accessToken = await this.jwtService.generateAccessToken(principalId);

    const refreshToken = await this.jwtService.generateRefreshToken(principalId);

    oldToken.revoke();

    await this.refreshTokenRepository.update(oldToken);

    const newRefresh = RefreshTokenMapper.create(oldToken.principalId, refreshToken);

    await this.refreshTokenRepository.save(newRefresh);

    return Result.success({
      accessToken,
      refreshToken,
      expiresIn: 3600,
    });
  }
}
