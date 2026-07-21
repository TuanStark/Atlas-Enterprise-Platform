import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { JwtTokenService } from '@shared-kernel/application';
import { QueryBus } from '@nestjs/cqrs';
import { GetPrincipalQuery } from '@core/principal/application/queries/get-principal/get-principal.query';
import { PrincipalDto } from '@core/principal/application/dto/principal.dto';
import {
  ListPrincipalRolesQuery,
  GetRoleQuery,
  GetPrincipalPermissionsQuery,
  RoleDto,
  PrincipalRoleDto,
} from '@core/rbac/application';
import type { ResolvedPermission } from '@core/rbac/domain';
import { Result } from '@shared-kernel/application';

@Injectable()
export class JwtTokenServiceImpl implements JwtTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly queryBus: QueryBus,
  ) {}

  async generateAccessToken(principalId: string): Promise<string> {
    const principalResult = await this.queryBus.execute<GetPrincipalQuery, Result<PrincipalDto>>(
      new GetPrincipalQuery(principalId),
    );

    if (!principalResult.isSuccess()) {
      throw new UnauthorizedException('Principal not found');
    }

    const principal = principalResult.data;

    const rolesResult = await this.queryBus.execute<
      ListPrincipalRolesQuery,
      Result<PrincipalRoleDto[]>
    >(new ListPrincipalRolesQuery(principalId));

    const roles: string[] = [];
    if (rolesResult.isSuccess()) {
      for (const pr of rolesResult.data) {
        const roleResult = await this.queryBus.execute<GetRoleQuery, Result<RoleDto>>(
          new GetRoleQuery(pr.roleId),
        );
        if (roleResult.isSuccess() && roleResult.data.code) {
          roles.push(roleResult.data.code);
        }
      }
    }

    const permissionsResult = await this.queryBus.execute<
      GetPrincipalPermissionsQuery,
      Result<ResolvedPermission[]>
    >(new GetPrincipalPermissionsQuery(principalId));

    const permissions: string[] = [];
    if (permissionsResult.isSuccess()) {
      for (const p of permissionsResult.data) {
        if (p.effect === 'allow') {
          permissions.push(p.code);
        }
      }
    }

    return this.jwtService.signAsync(
      {
        sub: principalId,
        type: 'access',
        tenantId: principal.tenantId,
        roles,
        permissions,
      },
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
      } as JwtSignOptions,
    );
  }

  async generateRefreshToken(principalId: string): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: principalId,
        type: 'refresh',
      },
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
      } as JwtSignOptions,
    );
  }

  async generateImpersonationToken(
    targetPrincipalId: string,
    impersonatorId: string,
  ): Promise<string> {
    const principalResult = await this.queryBus.execute<GetPrincipalQuery, Result<PrincipalDto>>(
      new GetPrincipalQuery(targetPrincipalId),
    );

    if (!principalResult.isSuccess()) {
      throw new UnauthorizedException('Target principal not found');
    }

    const principal = principalResult.data;

    const rolesResult = await this.queryBus.execute<
      ListPrincipalRolesQuery,
      Result<PrincipalRoleDto[]>
    >(new ListPrincipalRolesQuery(targetPrincipalId));

    const roles: string[] = [];
    if (rolesResult.isSuccess()) {
      for (const pr of rolesResult.data) {
        const roleResult = await this.queryBus.execute<GetRoleQuery, Result<RoleDto>>(
          new GetRoleQuery(pr.roleId),
        );
        if (roleResult.isSuccess() && roleResult.data.code) {
          roles.push(roleResult.data.code);
        }
      }
    }

    const permissionsResult = await this.queryBus.execute<
      GetPrincipalPermissionsQuery,
      Result<ResolvedPermission[]>
    >(new GetPrincipalPermissionsQuery(targetPrincipalId));

    const permissions: string[] = [];
    if (permissionsResult.isSuccess()) {
      for (const p of permissionsResult.data) {
        if (p.effect === 'allow') {
          permissions.push(p.code);
        }
      }
    }

    return this.jwtService.signAsync(
      {
        sub: targetPrincipalId,
        type: 'access',
        tenantId: principal.tenantId,
        roles,
        permissions,
        impersonatorId,
      },
      {
        expiresIn: '1h',
      } as JwtSignOptions,
    );
  }

  async verifyAccessToken<T>(token: string): Promise<T> {
    return this.jwtService.verifyAsync(token) as Promise<T>;
  }

  async verifyRefreshToken<T>(token: string): Promise<T> {
    return this.jwtService.verifyAsync(token) as Promise<T>;
  }
}
