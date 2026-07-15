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
import { CurrentContext } from '@core/identity/presentation/decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import {
  CreateWorkLocationDto,
  UpdateWorkLocationDto,
} from '../../application/dto/work-location.dto';
import {
  CreateWorkLocationCommand,
  UpdateWorkLocationCommand,
  DeleteWorkLocationCommand,
} from '../../application/commands/work-location.commands';
import {
  GetWorkLocationQuery,
  ListWorkLocationsQuery,
} from '../../application/queries/master-data.queries';

@ApiTags('Work Locations')
@Controller('work-locations')
export class WorkLocationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a work location' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created work location' })
  create(@CurrentContext() context: RequestContext, @Body() dto: CreateWorkLocationDto) {
    return this.commandBus.execute(
      new CreateWorkLocationCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all work locations' })
  @ApiOkResponse({ description: 'List of work locations' })
  list(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(new ListWorkLocationsQuery(Identifier.create(context.tenantId)));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get work location by ID' })
  @ApiOkResponse({ description: 'Work location details' })
  getById(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetWorkLocationQuery(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update work location' })
  @ApiOkResponse({ description: 'Work location updated' })
  update(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateWorkLocationDto,
  ) {
    return this.commandBus.execute(
      new UpdateWorkLocationCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        dto,
      ),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete work location' })
  @ApiOkResponse({ description: 'Work location deleted' })
  delete(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new DeleteWorkLocationCommand(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }
}
