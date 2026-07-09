import { HttpStatus, Inject } from '@nestjs/common';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  Result,
  PASSWORD_HASHER,
  JWT_TOKEN_SERVICE,
  TRANSACTION_RUNNER,
} from '@shared-kernel/application';

import type {
  PasswordHasher,
  JwtTokenService,
  TransactionRunner,
} from '@shared-kernel/application';

import {
  USER_REPOSITORY,
  CREDENTIAL_REPOSITORY,
  REFRESH_TOKEN_REPOSITORY,
  Email,
  UserErrorCode,
  UserMessages,
  RefreshToken,
} from '@core/identity/domain';

import type {
  UserRepository,
  CredentialRepository,
  RefreshTokenRepository,
} from '@core/identity/domain';

import { LoginResponseDto } from '../../dto/login-response.dto';

import { LoginCommand } from './login.command';

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject(CREDENTIAL_REPOSITORY)
    private readonly credentialRepository: CredentialRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasher,
    @Inject(JWT_TOKEN_SERVICE)
    private readonly jwtService: JwtTokenService,
    @Inject(TRANSACTION_RUNNER)
    private readonly transaction: TransactionRunner,
  ) {}

  async execute(command: LoginCommand): Promise<Result<LoginResponseDto>> {
    const email = Email.create(command.dto.email);

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return Result.failure({
        statusCode: HttpStatus.UNAUTHORIZED,
        code: UserErrorCode.INVALID_PASSWORD,
        message: UserMessages.ERROR.INVALID_PASSWORD,
      });
    }

    const credential = await this.credentialRepository.findByPrincipalId(user.principalId);

    if (!credential) {
      return Result.failure({
        statusCode: HttpStatus.UNAUTHORIZED,
        code: UserErrorCode.INVALID_PASSWORD,
        message: UserMessages.ERROR.INVALID_PASSWORD,
      });
    }

    const valid = await this.passwordHasher.verify(
      command.dto.password,
      credential.passwordHash.value,
    );

    if (!valid) {
      return Result.failure({
        statusCode: HttpStatus.UNAUTHORIZED,
        code: UserErrorCode.INVALID_PASSWORD,
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
      expiresIn: 3600,
    });
  }
}
