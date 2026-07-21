import { HttpStatus, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result, JWT_TOKEN_SERVICE, TRANSACTION_RUNNER } from '@shared-kernel/application';
import type { JwtTokenService, TransactionRunner } from '@shared-kernel/application';
import { REFRESH_TOKEN_REPOSITORY, RefreshToken } from '@core/identity/domain';
import type { RefreshTokenRepository } from '@core/identity/domain';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { LoginResponseDto } from '../../dto/login-response.dto';
import { EndImpersonationCommand } from './end-impersonation.command';
import { CreateAuditLogCommand } from '@shared/audit/application/commands/create-audit-log.command';

@CommandHandler(EndImpersonationCommand)
export class EndImpersonationHandler implements ICommandHandler<EndImpersonationCommand> {
  constructor(
    @Inject(JWT_TOKEN_SERVICE)
    private readonly jwtService: JwtTokenService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(TRANSACTION_RUNNER)
    private readonly transaction: TransactionRunner,
    private readonly configService: ConfigService,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: EndImpersonationCommand): Promise<Result<LoginResponseDto>> {
    const { impersonatorPrincipalId, tenantId } = command;

    const accessToken = await this.jwtService.generateAccessToken(impersonatorPrincipalId);
    const refreshToken = await this.jwtService.generateRefreshToken(impersonatorPrincipalId);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const refreshEntity = RefreshToken.create({
      principalId: Identifier.create(impersonatorPrincipalId),
      token: refreshToken,
      expiresAt,
    });

    await this.transaction.run(async () => {
      await this.refreshTokenRepository.save(refreshEntity);
    });

    void this.commandBus.execute(
      new CreateAuditLogCommand({
        tenantId,
        targetModule: 'auth',
        action: 'end_impersonation',
        targetEntity: 'principal',
        targetRecordId: impersonatorPrincipalId,
        actorPrincipalId: impersonatorPrincipalId,
        metadata: {
          description: 'Admin kết thúc phiên đóng vai, quay lại tài khoản gốc.',
        },
      }),
    );

    return Result.success({
      accessToken,
      refreshToken,
      expiresIn: this.configService.get<number>('JWT.ACCESS_TOKEN_EXPIRATION') ?? 3600,
    });
  }
}
