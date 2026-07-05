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
import {
  TenantDto,
  CreateTenantDto,
  UpdateTenantDto,
  CreateTenantCommand,
  UpdateTenantCommand,
  ActivateTenantCommand,
  DeactivateTenantCommand,
  GetTenantQuery,
  ListTenantsQuery,
} from '@core/tenant/application';

@ApiTags('Tenants')
@Controller('tenants')
export class TenantController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create tenant',
  })
  @ApiCreatedResponse({
    type: TenantDto,
  })
  async create(@Body() dto: CreateTenantDto): Promise<Result<TenantDto>> {
    return this.commandBus.execute(new CreateTenantCommand(dto));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get tenant',
  })
  @ApiOkResponse({
    type: TenantDto,
  })
  async getById(@Param('id') id: string): Promise<Result<TenantDto>> {
    return this.queryBus.execute(new GetTenantQuery(id));
  }

  @Get()
  @ApiOperation({
    summary: 'List tenants',
  })
  async list(): Promise<Result<TenantDto[]>> {
    return this.queryBus.execute(new ListTenantsQuery());
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update tenant',
  })
  async update(@Param('id') id: string, @Body() dto: UpdateTenantDto): Promise<Result<TenantDto>> {
    return this.commandBus.execute(new UpdateTenantCommand(id, dto));
  }

  @Patch(':id/activate')
  @ApiOperation({
    summary: 'Activate tenant',
  })
  async activate(@Param('id') id: string): Promise<Result<void>> {
    return this.commandBus.execute(new ActivateTenantCommand(id));
  }

  @Patch(':id/deactivate')
  @ApiOperation({
    summary: 'Deactivate tenant',
  })
  async deactivate(@Param('id') id: string): Promise<Result<void>> {
    return this.commandBus.execute(new DeactivateTenantCommand(id));
  }
}
