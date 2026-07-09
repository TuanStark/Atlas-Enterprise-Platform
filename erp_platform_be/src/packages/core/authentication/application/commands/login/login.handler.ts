import { HttpStatus, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result, JWT_TOKEN_SERVICE, TRANSACTION_RUNNER } from '@shared-kernel/application';
import type { JwtTokenService, TransactionRunner } from '@shared-kernel/application';
import {
  REFRESH_TOKEN_REPOSITORY,
  Email,
  UserErrorCode,
  UserMessages,
  RefreshToken,
  IDENTITY_SERVICE,
} from '@core/identity/domain';
import type { RefreshTokenRepository, IdentityService } from '@core/identity/domain';
import { LoginResponseDto } from '../../dto/login-response.dto';
import { LoginCommand } from './login.command';
import * as identity from '@core/identity';
@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(IDENTITY_SERVICE)
    private readonly identityService: IdentityService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(JWT_TOKEN_SERVICE)
    private readonly jwtService: JwtTokenService,
    @Inject(TRANSACTION_RUNNER)
    private readonly transaction: TransactionRunner,
    private readonly configService: ConfigService,
    @Inject(identity.IDENTITY_FACADE)
    private readonly identityFacade: identity.IdentityFacade,
  ) {}

  async execute(command: LoginCommand): Promise<Result<LoginResponseDto>> {
    const user = await this.identityFacade.authenticate(
      Email.create(command.dto.email),
      command.dto.password,
    );

    if (!user) {
      return Result.failure({
        statusCode: HttpStatus.UNAUTHORIZED,
        code: UserErrorCode.NOT_FOUND,
        message: UserMessages.ERROR.INVALID_PASSWORD,
      });
    }

    const accessToken = await this.jwtService.generateAccessToken(user.principalId.getValue());
    const refreshToken = await this.jwtService.generateRefreshToken(user.principalId.getValue());

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const refreshEntity = RefreshToken.create({
      principalId: user.principalId,
      token: refreshToken,
      expiresAt,
    });

    await this.transaction.run(async () => {
      await this.refreshTokenRepository.save(refreshEntity);
    });

    return Result.success({
      accessToken,
      refreshToken,
      expiresIn: this.configService.get<number>('JWT.ACCESS_TOKEN_EXPIRATION') ?? 3600,
    });
  }
}
