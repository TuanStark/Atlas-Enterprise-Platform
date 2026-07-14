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
  CreateOrganizationUnitTypeDto,
  UpdateOrganizationUnitTypeDto,
  OrganizationUnitTypeDto,
} from '@core/organization/dto';
import {
  CreateOrganizationUnitTypeCommand,
  UpdateOrganizationUnitTypeCommand,
  DeleteOrganizationUnitTypeCommand,
} from '../../application/commands';
import {
  GetOrganizationUnitTypeQuery,
  ListOrganizationUnitTypesQuery,
} from '../../application/queries';

@ApiTags('Organization Unit Types')
@Controller('organization-unit-types')
export class OrganizationUnitTypeController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create organization unit type' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created unit type' })
  create(@Body() dto: CreateOrganizationUnitTypeDto) {
    return this.commandBus.execute(new CreateOrganizationUnitTypeCommand(dto));
  }

  @Get()
  @ApiOperation({ summary: 'List organization unit types' })
  @ApiOkResponse({ type: [OrganizationUnitTypeDto] })
  list() {
    return this.queryBus.execute(new ListOrganizationUnitTypesQuery());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization unit type' })
  @ApiOkResponse({ type: OrganizationUnitTypeDto })
  get(@Param('id') id: string) {
    return this.queryBus.execute(new GetOrganizationUnitTypeQuery(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update organization unit type' })
  @ApiOkResponse({ description: 'Unit type updated successfully' })
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationUnitTypeDto) {
    return this.commandBus.execute(new UpdateOrganizationUnitTypeCommand(id, dto));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete organization unit type' })
  @ApiOkResponse({ description: 'Unit type deleted successfully' })
  delete(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteOrganizationUnitTypeCommand(id));
  }
}
