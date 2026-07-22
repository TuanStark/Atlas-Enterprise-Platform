import { HttpStatus, Inject } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { Result, JWT_TOKEN_SERVICE, TRANSACTION_RUNNER } from '@shared-kernel/application';
import type { JwtTokenService, TransactionRunner } from '@shared-kernel/application';
import { REFRESH_TOKEN_REPOSITORY, RefreshToken } from '@core/identity/domain';
import type { RefreshTokenRepository } from '@core/identity/domain';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { LoginResponseDto } from '../../dto/login-response.dto';
import { SwitchAccountCommand } from './switch-account.command';
import { CreateAuditLogCommand } from '@shared/audit/application/commands/create-audit-log.command';
import { AuthErrorCode, AuthMessages } from '../../constant/constant';

import { GetPrincipalQuery } from '@core/principal/application/queries/get-principal/get-principal.query';
import { PrincipalDto } from '@core/principal/application/dto/principal.dto';
import { PrincipalStatus } from '@core/principal/domain';
import {
  ListPrincipalRolesQuery,
  PrincipalRoleDto,
  GetRoleQuery,
  RoleDto,
  CheckRoleHierarchyQuery,
} from '@core/rbac/application';

@CommandHandler(SwitchAccountCommand)
export class SwitchAccountHandler implements ICommandHandler<SwitchAccountCommand> {
  constructor(
    @Inject(JWT_TOKEN_SERVICE)
    private readonly jwtService: JwtTokenService,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(TRANSACTION_RUNNER)
    private readonly transaction: TransactionRunner,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) { }

  async execute(command: SwitchAccountCommand): Promise<Result<LoginResponseDto>> {
    const { currentPrincipalId, tenantId, dto } = command;

    if (currentPrincipalId === dto.targetPrincipalId) {
      return Result.failure({
        statusCode: HttpStatus.BAD_REQUEST,
        code: AuthErrorCode.IMPERSONATE_SELF,
        message: AuthMessages.ERROR.IMPERSONATE_SELF,
      });
    }

    const targetPrincipalResult = await this.queryBus.execute<
      GetPrincipalQuery,
      Result<PrincipalDto>
    >(new GetPrincipalQuery(dto.targetPrincipalId));

    if (!targetPrincipalResult.isSuccess()) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: AuthErrorCode.TARGET_NOT_FOUND,
        message: AuthMessages.ERROR.TARGET_NOT_FOUND,
      });
    }

    const targetPrincipal = targetPrincipalResult.data;

    const currentRolesResult = await this.queryBus.execute<
      ListPrincipalRolesQuery,
      Result<PrincipalRoleDto[]>
    >(new ListPrincipalRolesQuery(currentPrincipalId));

    let isSuperAdmin = false;
    if (currentRolesResult.isSuccess()) {
      for (const pr of currentRolesResult.data) {
        const roleResult = await this.queryBus.execute<GetRoleQuery, Result<RoleDto>>(
          new GetRoleQuery(pr.roleId),
        );
        if (roleResult.isSuccess() && roleResult.data.code === 'SUPER_ADMIN') {
          isSuperAdmin = true;
          break;
        }
      }
    }

    if (!isSuperAdmin && targetPrincipal.tenantId !== tenantId) {
      return Result.failure({
        statusCode: HttpStatus.FORBIDDEN,
        code: AuthErrorCode.CROSS_TENANT,
        message: AuthMessages.ERROR.CROSS_TENANT,
      });
    }

    if (targetPrincipal.status !== PrincipalStatus.ACTIVE) {
      return Result.failure({
        statusCode: HttpStatus.FORBIDDEN,
        code: AuthErrorCode.TARGET_INACTIVE,
        message: AuthMessages.ERROR.TARGET_INACTIVE,
      });
    }

    const currentPrincipalResult = await this.queryBus.execute<
      GetPrincipalQuery,
      Result<PrincipalDto>
    >(new GetPrincipalQuery(currentPrincipalId));

    if (!currentPrincipalResult.isSuccess()) {
      return Result.failure({
        statusCode: HttpStatus.UNAUTHORIZED,
        code: AuthErrorCode.PRINCIPAL_NOT_FOUND,
        message: AuthMessages.ERROR.PRINCIPAL_NOT_FOUND,
      });
    }

    if (!isSuperAdmin) {
      const targetRolesResult = await this.queryBus.execute<
        ListPrincipalRolesQuery,
        Result<PrincipalRoleDto[]>
      >(new ListPrincipalRolesQuery(dto.targetPrincipalId));

      const currentRoleIds = currentRolesResult.isSuccess()
        ? currentRolesResult.data.map((pr) => pr.roleId)
        : [];
      const targetRoleIds = targetRolesResult.isSuccess()
        ? targetRolesResult.data.map((pr) => pr.roleId)
        : [];

      const hasHierarchyRelation = await this.queryBus.execute<CheckRoleHierarchyQuery, boolean>(
        new CheckRoleHierarchyQuery(currentRoleIds, targetRoleIds),
      );

      if (!hasHierarchyRelation) {
        return Result.failure({
          statusCode: HttpStatus.FORBIDDEN,
          code: AuthErrorCode.INSUFFICIENT_HIERARCHY,
          message: AuthMessages.ERROR.INSUFFICIENT_HIERARCHY,
        });
      }
    }

    const accessToken = await this.jwtService.generateImpersonationToken(
      dto.targetPrincipalId,
      currentPrincipalId,
    );
    const refreshToken = await this.jwtService.generateRefreshToken(dto.targetPrincipalId);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const refreshEntity = RefreshToken.create({
      principalId: Identifier.create(dto.targetPrincipalId),
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
        action: 'impersonate',
        targetEntity: 'principal',
        targetRecordId: dto.targetPrincipalId,
        actorPrincipalId: currentPrincipalId,
        metadata: {
          description: `Admin đóng vai tài khoản: ${targetPrincipal.displayName || dto.targetPrincipalId}`,
        },
      }),
    );

    return Result.success({
      accessToken,
      refreshToken,
      expiresIn: 3600,
    });
  }
}
