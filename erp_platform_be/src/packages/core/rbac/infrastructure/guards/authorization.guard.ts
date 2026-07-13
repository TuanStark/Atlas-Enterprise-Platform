import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EffectType } from '@prisma/client';
import { JWT_TOKEN_SERVICE } from '@shared-kernel/application';
import type { JwtTokenService } from '@shared-kernel/application';
import { PrismaService } from 'src/database/prisma.service';
import { PERMISSION_RESOLVER, PERMISSION_CACHE } from '@core/rbac/domain';
import type { PermissionResolver } from '@core/rbac/domain';
import type { PermissionCache } from '@core/rbac/domain';
import { IS_PUBLIC_KEY } from '../../presentation/decorators/public.decorator';
import { PERMISSIONS_KEY } from '../../presentation/decorators/require-permission.decorator';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

interface JwtPayload {
  sub: string;
  type: string;
}

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(JWT_TOKEN_SERVICE)
    private readonly jwtService: JwtTokenService,
    @Inject(PERMISSION_RESOLVER)
    private readonly permissionResolver: PermissionResolver,
    @Inject(PERMISSION_CACHE)
    @Optional()
    private readonly permissionCache: PermissionCache | null,
    private readonly prisma: PrismaService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Check @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // 2. Extract & verify JWT
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing authentication token.');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAccessToken<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token.');
    }

    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type.');
    }

    // 3. Look up principal to get tenantId
    const principal = await this.prisma.principal.findUnique({
      where: { id: payload.sub },
      select: { id: true, tenantId: true, status: true },
    });

    if (!principal) {
      throw new UnauthorizedException('Principal not found.');
    }

    if (principal.status !== 'active') {
      throw new UnauthorizedException('Principal is not active.');
    }

    // 4. Attach to request
    request.principalId = principal.id;
    request.tenantId = principal.tenantId;

    // 5. Check @RequirePermission()
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // 6. Resolve permissions (with cache)
    const principalIdentifier = Identifier.create(principal.id);
    let resolved = await this.permissionCache?.get(principal.id) ?? null;

    if (!resolved) {
      resolved = await this.permissionResolver.resolvePermissions(principalIdentifier);
      await this.permissionCache?.set(principal.id, resolved);
    }

    // 7. Check all required permissions are allowed
    for (const required of requiredPermissions) {
      const found = resolved.find((p) => p.code === required);
      if (!found || found.effect === EffectType.deny) {
        throw new ForbiddenException(`Missing required permission: ${required}`);
      }
    }

    return true;
  }

  private extractToken(request: any): string | undefined {
    const authorization = request.headers?.authorization;
    if (!authorization) {
      return undefined;
    }
    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
