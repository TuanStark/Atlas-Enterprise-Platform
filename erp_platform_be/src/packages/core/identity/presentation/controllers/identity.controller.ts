import { Body, Controller, Get, Param, Patch, Post, Put, HttpStatus, Inject } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@shared-kernel/application';
import { ChangePasswordDto, CreateUserDto, UpdateUserDto, UserDto } from '../../application/dto';
import { CreateUserCommand } from '@core/identity/application/commands/create-user/create-user.command';
import { GetUserQuery } from '@core/identity/application/queries/get-user/get-user.query';
import { ListUserQuery } from '@core/identity/application/queries/list-user/list-user.query';
import { UpdateUserCommand } from '@core/identity/application/commands/update-user/update-user.command';
import { LockUserCommand } from '@core/identity/application/commands/lock-user/lock-user.command';
import { UnlockUserCommand } from '@core/identity/application/commands/unlock-user/unlock-user.command';
import { ChangePasswordCommand } from '@core/identity/application/commands/change-password/change-password.command';
import { CurrentContext } from '../decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { USER_REPOSITORY } from '../../domain/index';
import type { UserRepository } from '../../domain/index';
import { UserMapper } from '../../application/mappers/user.mapper';

@ApiTags('Users')
@Controller('users')
export class IdentityController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({ type: UserDto })
  async getMe(@CurrentContext() context: RequestContext): Promise<Result<UserDto>> {
    const user = await this.userRepository.findByPrincipalId(Identifier.create(context.principalId));
    if (!user) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: 'USER_NOT_FOUND',
        message: 'User profile not found.',
      });
    }
    return Result.success(UserMapper.toDto(user), {
      statusCode: HttpStatus.OK,
      code: 'USER_FOUND',
      message: 'Success',
    });
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOkResponse({ type: UserDto })
  async updateMe(
    @CurrentContext() context: RequestContext,
    @Body() dto: UpdateUserDto,
  ): Promise<Result<UserDto>> {
    const user = await this.userRepository.findByPrincipalId(Identifier.create(context.principalId));
    if (!user) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: 'USER_NOT_FOUND',
        message: 'User profile not found.',
      });
    }

    user.rename(dto.firstName ?? user.firstName, dto.lastName ?? user.lastName);
    if (dto.displayName) {
      user.changeDisplayName(dto.displayName);
    }
    if (dto.avatarUrl !== undefined) {
      user.changeAvatar(dto.avatarUrl || '');
    }

    await this.userRepository.update(user);

    return Result.success(UserMapper.toDto(user), {
      statusCode: HttpStatus.OK,
      code: 'USER_UPDATED',
      message: 'Profile updated successfully.',
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create user' })
  @ApiCreatedResponse({ description: 'User created' })
  create(@Body() dto: CreateUserDto): Promise<Result<void>> {
    return this.commandBus.execute(new CreateUserCommand(dto));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiOkResponse({ type: UserDto })
  get(@Param('id') id: string): Promise<Result<UserDto>> {
    return this.queryBus.execute(new GetUserQuery(id));
  }

  @Get()
  @ApiOperation({ summary: 'List users' })
  @ApiOkResponse({ type: [UserDto] })
  list() {
    return this.queryBus.execute(new ListUserQuery());
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiOkResponse({ type: UserDto })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.commandBus.execute(new UpdateUserCommand(id, dto));
  }

  @Patch(':id/lock')
  @ApiOperation({ summary: 'Lock user' })
  @ApiOkResponse({ description: 'User locked' })
  lock(@Param('id') id: string) {
    return this.commandBus.execute(new LockUserCommand(id));
  }

  @Patch(':id/unlock')
  @ApiOperation({ summary: 'Unlock user' })
  @ApiOkResponse({ description: 'User unlocked' })
  unlock(@Param('id') id: string) {
    return this.commandBus.execute(new UnlockUserCommand(id));
  }

  @Patch(':principalId/change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiOkResponse({ description: 'Password changed successfully' })
  changePassword(
    @Param('principalId')
    principalId: string,

    @Body()
    dto: ChangePasswordDto,
  ) {
    return this.commandBus.execute(new ChangePasswordCommand(principalId, dto));
  }
}
