import { Body, Controller, Get, Param, Patch, Post, Put } from '@nestjs/common';

import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { Result } from '@shared-kernel/application';

import { ChangePasswordDto, CreateUserDto, UpdateUserDto, UserDto } from '../../application/dto';
import { CreateUserCommand } from '@core/identity/application/commands/create-user/create-user.command';
import { GetUserQuery } from '@core/identity/application/queries/get-user/get-user.query';
import { ListUserQuery } from '@core/identity/application/queries/list-user/list-user.query';
import { UpdateUserCommand } from '@core/identity/application/commands/update-user/update-user.command';
import { LockUserCommand } from '@core/identity/application/commands/lock-user/lock-user.command';
import { UnlockUserCommand } from '@core/identity/application/commands/unlock-user/unlock-user.command';
import { ChangePasswordCommand } from '@core/identity/application/commands/change-password/change-password.command';

@Controller('users')
export class IdentityController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  create(@Body() dto: CreateUserDto): Promise<Result<void>> {
    return this.commandBus.execute(new CreateUserCommand(dto));
  }

  @Get(':id')
  get(@Param('id') id: string): Promise<Result<UserDto>> {
    return this.queryBus.execute(new GetUserQuery(id));
  }

  @Get()
  list() {
    return this.queryBus.execute(new ListUserQuery());
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.commandBus.execute(new UpdateUserCommand(id, dto));
  }

  @Patch(':id/lock')
  lock(@Param('id') id: string) {
    return this.commandBus.execute(new LockUserCommand(id));
  }

  @Patch(':id/unlock')
  unlock(@Param('id') id: string) {
    return this.commandBus.execute(new UnlockUserCommand(id));
  }

  @Patch(':principalId/change-password')
  changePassword(
    @Param('principalId')
    principalId: string,

    @Body()
    dto: ChangePasswordDto,
  ) {
    return this.commandBus.execute(new ChangePasswordCommand(principalId, dto));
  }
}
