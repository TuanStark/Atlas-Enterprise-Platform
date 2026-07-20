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
  ParseUUIDPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePositionDto } from '../../dto/create-position.dto';
import { UpdatePositionDto } from '../../dto/update-position.dto';
import { CreatePositionCommand } from '../../application/commands/create-position/create-position.command';
import { UpdatePositionCommand } from '../../application/commands/update-position/update-position.command';
import { DeletePositionCommand } from '../../application/commands/delete-position/delete-position.command';
import { GetPositionQuery } from '../../application/queries/get-position/get-position.query';
import { ListPositionsQuery } from '../../application/queries/list-positions/list-positions.query';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PositionReadModel } from '../../application/read-models/position.read-model';

@ApiTags('Positions')
@Controller('organizations/:organizationId/positions')
export class PositionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create position' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created position' })
  create(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Body() dto: CreatePositionDto,
  ) {
    return this.commandBus.execute(
      new CreatePositionCommand(Identifier.create(organizationId), dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all positions' })
  @ApiOkResponse({ type: [PositionReadModel], description: 'List of positions' })
  list(@Param('organizationId', ParseUUIDPipe) organizationId: string) {
    return this.queryBus.execute(new ListPositionsQuery(Identifier.create(organizationId)));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get position by ID' })
  @ApiOkResponse({ type: PositionReadModel, description: 'Position details' })
  get(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.queryBus.execute(
      new GetPositionQuery(Identifier.create(organizationId), Identifier.create(id)),
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update position' })
  @ApiOkResponse({ description: 'Position updated successfully' })
  update(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePositionDto,
  ) {
    return this.commandBus.execute(
      new UpdatePositionCommand(Identifier.create(organizationId), Identifier.create(id), dto),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete position' })
  @ApiOkResponse({ description: 'Position deleted successfully' })
  delete(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.commandBus.execute(
      new DeletePositionCommand(Identifier.create(organizationId), Identifier.create(id)),
    );
  }
}
