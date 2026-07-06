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

import { Page, Result } from '@shared-kernel/application';
import { BaseCrudControllerHelper } from '@shared-kernel/presentation/controllers/base-crud.controller';
import { GetPrincipalQuery, ListPrincipalQuery } from '../../application/queries';
import { CreatePrincipalCommand } from '@core/principal/application/commands/create-principal/create-principal.command';
import { UpdatePrincipalCommand } from '@core/principal/application/commands/update-principal/update-principal.command';
import { ActivatePrincipalCommand } from '@core/principal/application/commands/activate-principal/activate-principal.command';
import { SuspendPrincipalCommand } from '@core/principal/application/commands/suspend-principal/suspend-principal.command';
import {
  CreatePrincipalDto,
  PrincipalDto,
  UpdatePrincipalDto,
} from '@core/principal/application/dto';

@ApiTags('Principals')
@Controller('principals')
export class PrincipalController extends BaseCrudControllerHelper {
  constructor(commandBus: CommandBus, queryBus: QueryBus) {
    super(commandBus, queryBus);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create principal' })
  @ApiCreatedResponse({ description: 'Principal created' })
  create(
    @Body()
    dto: CreatePrincipalDto,
  ): Promise<Result<void>> {
    return this.executeCreate(CreatePrincipalCommand, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get principal by ID' })
  @ApiOkResponse({ type: PrincipalDto })
  get(
    @Param('id')
    id: string,
  ): Promise<Result<PrincipalDto>> {
    return this.executeGet(GetPrincipalQuery, id);
  }

  @Get()
  @ApiOperation({ summary: 'List principals' })
  @ApiOkResponse({ type: [PrincipalDto] })
  list(): Promise<Result<Page<PrincipalDto>>> {
    return this.executeList<Page<PrincipalDto>>(ListPrincipalQuery);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update principal' })
  @ApiOkResponse({ type: PrincipalDto })
  update(
    @Param('id')
    id: string,

    @Body()
    dto: UpdatePrincipalDto,
  ): Promise<Result<PrincipalDto>> {
    return this.executeUpdate(UpdatePrincipalCommand, id, dto);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate principal' })
  @ApiOkResponse({ description: 'Principal activated' })
  activate(
    @Param('id')
    id: string,
  ): Promise<Result<void>> {
    return this.executeActivate(ActivatePrincipalCommand, id);
  }

  @Patch(':id/suspend')
  @ApiOperation({ summary: 'Suspend principal' })
  @ApiOkResponse({ description: 'Principal suspended' })
  suspend(
    @Param('id')
    id: string,
  ): Promise<Result<void>> {
    return this.executeSuspend(SuspendPrincipalCommand, id);
  }
}
