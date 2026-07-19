import { Body, Controller, HttpCode, HttpStatus, Post, Get } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto, RefreshTokenDto, LoginResponseDto, ForgotPasswordDto, ResetPasswordDto } from '../application/dto';
import { LoginCommand } from '../application/commands/login/login.command';
import { RefreshTokenCommand } from '../application/commands/refresh-token/refresh-token.command';
import { LogoutCommand } from '../application/commands/logout/logout.command';
import { ForgotPasswordCommand } from '../application/commands/forgot-password/forgot-password.command';
import { ResetPasswordCommand } from '../application/commands/reset-password/reset-password.command';
import { Public } from '@core/rbac/presentation/decorators/public.decorator';
import { CurrentContext } from '@core/identity/presentation/decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';
import { GetTenantQuery, TenantDto } from '@core/tenant/application';
import { Result } from '@shared-kernel/application';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login' })
  @ApiOkResponse({ type: LoginResponseDto })
  login(
    @Body()
    dto: LoginDto,
  ) {
    return this.commandBus.execute(new LoginCommand(dto));
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiOkResponse({ type: LoginResponseDto })
  refresh(
    @Body()
    dto: RefreshTokenDto,
  ) {
    return this.commandBus.execute(new RefreshTokenCommand(dto));
  }

  @Post('logout')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiOkResponse({ description: 'User successfully logged out' })
  logout(
    @Body()
    dto: RefreshTokenDto,
  ) {
    return this.commandBus.execute(new LogoutCommand(dto.refreshToken));
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset link' })
  @ApiOkResponse({ description: 'Password reset link request handled successfully' })
  forgotPassword(
    @Body()
    dto: ForgotPasswordDto,
  ) {
    return this.commandBus.execute(new ForgotPasswordCommand(dto));
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password' })
  @ApiOkResponse({ description: 'Password reset successfully' })
  resetPassword(
    @Body()
    dto: ResetPasswordDto,
  ) {
    return this.commandBus.execute(new ResetPasswordCommand(dto));
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current user profile & tenant info' })
  @ApiOkResponse({ description: 'Current user profile details' })
  async getMe(@CurrentContext() context: RequestContext) {
    const tenantResult = await this.queryBus.execute<GetTenantQuery, Result<TenantDto>>(
      new GetTenantQuery(context.tenantId),
    );

    const tenant = tenantResult.isSuccess() ? tenantResult.data : null;

    return {
      id: context.principalId,
      principalId: context.principalId,
      username: context.username,
      email: context.email,
      displayName: context.username,
      roles: context.roles,
      permissions: context.permissions,
      tenantId: context.tenantId,
      avatarUrl: context.avatarUrl,
      tenant: tenant
        ? {
            id: tenant.id,
            code: tenant.code,
            name: tenant.name,
            status: tenant.status,
            logoFileId: tenant.logoFileId,
          }
        : null,
    };
  }
}

