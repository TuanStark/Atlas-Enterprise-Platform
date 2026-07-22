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

@ApiTags('Tenants')
@RequireSystemAdmin()
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
  async getById(@Param('id') id: string): Promise<Result<TenantDto>> {
    return this.executeGet(GetTenantQuery, id);
  }

  @Get()
  @ApiOperation({
    summary: 'List tenants',
  })
  @ApiOkResponse({
    type: [TenantDto],
  })
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
  async update(@Param('id') id: string, @Body() dto: UpdateTenantDto): Promise<Result<TenantDto>> {
    return this.executeUpdate(UpdateTenantCommand, id, dto);
  }

  @Patch(':id/activate')
  @ApiOperation({
    summary: 'Activate tenant',
  })
  @ApiOkResponse({
    description: 'Tenant activated',
  })
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
  async delete(@Param('id') id: string): Promise<Result<void>> {
    return this.executeDelete(DeleteTenantCommand, id);
  }
}
