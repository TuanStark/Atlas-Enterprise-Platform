import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@shared-kernel/application';
import { BaseCrudControllerHelper } from '@shared-kernel/presentation/controllers/base-crud.controller';
import {
  CreateRoleDto,
  RoleDto,
  AssignPermissionDto,
  CreateRoleCommand,
  GetRoleQuery,
  ListRoleQuery,
  AssignPermissionToRoleCommand,
  RemovePermissionFromRoleCommand,
} from '../../application';

@ApiTags('Roles')
@Controller('roles')
export class RoleController extends BaseCrudControllerHelper {
  constructor(commandBus: CommandBus, queryBus: QueryBus) {
    super(commandBus, queryBus);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create role',
  })
  @ApiCreatedResponse({
    description: 'Role successfully created.',
  })
  async create(
    @Body()
    dto: CreateRoleDto,
  ): Promise<Result<void>> {
    return this.executeCreate(CreateRoleCommand, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List roles',
  })
  @ApiOkResponse({
    type: [RoleDto],
  })
  async list(
    @Query('tenantId')
    tenantId: string,
  ): Promise<Result<RoleDto[]>> {
    return this.queryBus.execute(new ListRoleQuery(tenantId));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get role by ID',
  })
  @ApiOkResponse({
    type: RoleDto,
  })
  async get(
    @Param('id')
    id: string,
  ): Promise<Result<RoleDto>> {
    return this.executeGet(GetRoleQuery, id);
  }

  @Post(':roleId/permissions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Assign permission to role',
  })
  @ApiOkResponse({
    description: 'Permission successfully assigned.',
  })
  async assignPermission(
    @Param('roleId') roleId: string,
    @Body() dto: AssignPermissionDto,
  ): Promise<Result<void>> {
    return this.commandBus.execute(new AssignPermissionToRoleCommand(roleId, dto.permissionId));
  }

  @Delete(':roleId/permissions/:permissionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove permission from role',
  })
  @ApiOkResponse({
    description: 'Permission successfully removed from role.',
  })
  async removePermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ): Promise<Result<void>> {
    return this.commandBus.execute(new RemovePermissionFromRoleCommand(roleId, permissionId));
  }
}
