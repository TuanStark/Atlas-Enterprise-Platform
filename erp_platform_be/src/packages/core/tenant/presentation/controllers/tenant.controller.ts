import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  ForbiddenException,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@shared-kernel/application';
import { BaseCrudControllerHelper } from '@shared-kernel/presentation/controllers/base-crud.controller';
import {
  TenantDto,
  CreateTenantDto,
  UpdateTenantDto,
  CreateTenantCommand,
  UpdateTenantCommand,
  ActivateTenantCommand,
  DeactivateTenantCommand,
  DeleteTenantCommand,
  GetTenantQuery,
  ListTenantsQuery,
} from '@core/tenant/application';
import { RequireSystemAdmin } from '@core/rbac/presentation/decorators/require-system-admin.decorator';
import { RequirePermission } from '@core/rbac/presentation/decorators/require-permission.decorator';
import { CurrentContext } from '@core/identity/presentation/decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantController extends BaseCrudControllerHelper {
  constructor(commandBus: CommandBus, queryBus: QueryBus) {
    super(commandBus, queryBus);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create tenant',
  })
  @ApiCreatedResponse({
    type: TenantDto,
  })
  @RequireSystemAdmin()
  async create(@Body() dto: CreateTenantDto): Promise<Result<void>> {
    return this.executeCreate(CreateTenantCommand, dto);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get tenant',
  })
  @ApiOkResponse({
    type: TenantDto,
  })
  @RequirePermission('admin.settings:read')
  async getById(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string
  ): Promise<Result<TenantDto>> {
    if (!context.roles.includes('SUPER_ADMIN') && context.tenantId !== id) {
      throw new ForbiddenException('Bạn chỉ có quyền xem thông tin Tenant của chính mình.');
    }
    return this.executeGet(GetTenantQuery, id);
  }

  @Get()
  @ApiOperation({
    summary: 'List tenants',
  })
  @ApiOkResponse({
    type: [TenantDto],
  })
  @RequireSystemAdmin()
  async list(): Promise<Result<TenantDto[]>> {
    return this.executeList<TenantDto[]>(ListTenantsQuery);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update tenant',
  })
  @ApiOkResponse({
    type: TenantDto,
  })
  @RequirePermission('admin.settings:update')
  async update(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string, 
    @Body() dto: UpdateTenantDto
  ): Promise<Result<TenantDto>> {
    if (!context.roles.includes('SUPER_ADMIN') && context.tenantId !== id) {
      throw new ForbiddenException('Bạn chỉ có quyền cập nhật Tenant của chính mình.');
    }
    return this.executeUpdate(UpdateTenantCommand, id, dto);
  }

  @Patch(':id/activate')
  @ApiOperation({
    summary: 'Activate tenant',
  })
  @ApiOkResponse({
    description: 'Tenant activated',
  })
  @RequireSystemAdmin()
  async activate(@Param('id') id: string): Promise<Result<void>> {
    return this.executeActivate(ActivateTenantCommand, id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({
    summary: 'Deactivate tenant',
  })
  @ApiOkResponse({
    description: 'Tenant deactivated',
  })
  @RequireSystemAdmin()
  async deactivate(@Param('id') id: string): Promise<Result<void>> {
    return this.executeSuspend(DeactivateTenantCommand, id);
  }

  @Patch(':id/delete')
  @ApiOperation({
    summary: 'Delete tenant',
  })
  @ApiOkResponse({
    description: 'Tenant deleted',
  })
  @RequireSystemAdmin()
  async delete(@Param('id') id: string): Promise<Result<void>> {
    return this.executeDelete(DeleteTenantCommand, id);
  }
}
