import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@shared-kernel/application';
import { BaseCrudControllerHelper } from '@shared-kernel/presentation/controllers/base-crud.controller';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  PermissionDto,
  CreatePermissionCommand,
  UpdatePermissionCommand,
  DeletePermissionCommand,
  GetPermissionQuery,
  ListPermissionQuery,
} from '../../application';

@ApiTags('Permissions')
@Controller('permissions')
export class PermissionController extends BaseCrudControllerHelper {
  constructor(commandBus: CommandBus, queryBus: QueryBus) {
    super(commandBus, queryBus);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create permission',
  })
  @ApiCreatedResponse({
    description: 'Permission successfully created.',
  })
  async create(
    @Body()
    dto: CreatePermissionDto,
  ): Promise<Result<void>> {
    return this.executeCreate(CreatePermissionCommand, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List permissions',
  })
  @ApiOkResponse({
    type: [PermissionDto],
  })
  async list(): Promise<Result<PermissionDto[]>> {
    return this.executeList<PermissionDto[]>(ListPermissionQuery);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get permission',
  })
  @ApiOkResponse({
    type: PermissionDto,
  })
  async get(
    @Param('id')
    id: string,
  ): Promise<Result<PermissionDto>> {
    return this.executeGet(GetPermissionQuery, id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update permission',
  })
  @ApiOkResponse({
    description: 'Permission updated successfully.',
  })
  async update(
    @Param('id')
    id: string,

    @Body()
    dto: UpdatePermissionDto,
  ): Promise<Result<void>> {
    return this.executeUpdate(UpdatePermissionCommand, id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete permission',
  })
  @ApiOkResponse({
    description: 'Permission deleted successfully.',
  })
  async delete(
    @Param('id')
    id: string,
  ): Promise<Result<void>> {
    return this.executeDelete(DeletePermissionCommand, id);
  }
}
