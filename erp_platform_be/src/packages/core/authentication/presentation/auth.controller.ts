import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto, RefreshTokenDto, LoginResponseDto } from '../application/dto';
import { LoginCommand } from '../application/commands/login/login.command';
import { RefreshTokenCommand } from '../application/commands/refresh-token/refresh-token.command';
import { LogoutCommand } from '../application/commands/logout/logout.command';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('login')
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiOkResponse({ description: 'User successfully logged out' })
  logout(
    @Body()
    dto: RefreshTokenDto,
  ) {
    return this.commandBus.execute(new LogoutCommand(dto.refreshToken));
  }
}
