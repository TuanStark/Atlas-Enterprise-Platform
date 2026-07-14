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
import {
  CreateOrganizationUnitDto,
  UpdateOrganizationUnitDto,
  MoveOrganizationUnitDto,
  OrganizationUnitDto,
} from '@core/organization/dto';
import {
  CreateOrganizationUnitCommand,
  UpdateOrganizationUnitCommand,
  DeleteOrganizationUnitCommand,
  MoveOrganizationUnitCommand,
} from '../../application/commands';
import {
  GetOrganizationUnitQuery,
  ListOrganizationUnitsQuery,
  GetOrganizationUnitTreeQuery,
} from '../../application/queries';

@ApiTags('Organization Units')
@Controller('organizations/:organizationId/units')
export class OrganizationUnitController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create organization unit' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created unit' })
  create(@Param('organizationId') organizationId: string, @Body() dto: CreateOrganizationUnitDto) {
    dto.organizationId = organizationId;
    return this.commandBus.execute(new CreateOrganizationUnitCommand(dto));
  }

  @Get()
  @ApiOperation({ summary: 'List all organization units' })
  @ApiOkResponse({ type: [OrganizationUnitDto] })
  list(@Param('organizationId') organizationId: string) {
    return this.queryBus.execute(new ListOrganizationUnitsQuery(organizationId));
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get organization units hierarchical tree' })
  @ApiOkResponse({ description: 'Hierarchical unit tree' })
  tree(@Param('organizationId') organizationId: string) {
    return this.queryBus.execute(new GetOrganizationUnitTreeQuery(organizationId));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization unit by ID' })
  @ApiOkResponse({ type: OrganizationUnitDto })
  get(@Param('organizationId') organizationId: string, @Param('id') id: string) {
    return this.queryBus.execute(new GetOrganizationUnitQuery(organizationId, id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update organization unit' })
  @ApiOkResponse({ description: 'Unit updated successfully' })
  update(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationUnitDto,
  ) {
    return this.commandBus.execute(new UpdateOrganizationUnitCommand(organizationId, id, dto));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete organization unit' })
  @ApiOkResponse({ description: 'Unit deleted successfully' })
  delete(@Param('organizationId') organizationId: string, @Param('id') id: string) {
    return this.commandBus.execute(new DeleteOrganizationUnitCommand(organizationId, id));
  }

  @Post(':id/move')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Move organization unit to a new parent' })
  @ApiOkResponse({ description: 'Unit moved successfully' })
  move(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() dto: MoveOrganizationUnitDto,
  ) {
    return this.commandBus.execute(new MoveOrganizationUnitCommand(organizationId, id, dto));
  }
}
