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
  CreateOrganizationCalendarDto,
  UpdateOrganizationCalendarDto,
  OrganizationCalendarDto,
} from '@core/organization/dto';
import {
  CreateOrganizationCalendarCommand,
  UpdateOrganizationCalendarCommand,
  DeleteOrganizationCalendarCommand,
} from '../../application/commands';
import {
  GetOrganizationCalendarQuery,
  ListOrganizationCalendarsQuery,
} from '../../application/queries';

@ApiTags('Organization Calendars')
@Controller('organizations/:organizationId/calendars')
export class OrganizationCalendarController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create organization calendar' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created calendar' })
  create(
    @Param('organizationId') organizationId: string,
    @Body() dto: CreateOrganizationCalendarDto,
  ) {
    dto.organizationId = organizationId;
    return this.commandBus.execute(new CreateOrganizationCalendarCommand(dto));
  }

  @Get()
  @ApiOperation({ summary: 'List all organization calendars' })
  @ApiOkResponse({ type: [OrganizationCalendarDto] })
  list(@Param('organizationId') organizationId: string) {
    return this.queryBus.execute(new ListOrganizationCalendarsQuery(organizationId));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization calendar by ID' })
  @ApiOkResponse({ type: OrganizationCalendarDto })
  get(@Param('organizationId') organizationId: string, @Param('id') id: string) {
    return this.queryBus.execute(new GetOrganizationCalendarQuery(organizationId, id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update organization calendar' })
  @ApiOkResponse({ description: 'Calendar updated successfully' })
  update(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationCalendarDto,
  ) {
    return this.commandBus.execute(new UpdateOrganizationCalendarCommand(organizationId, id, dto));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete organization calendar' })
  @ApiOkResponse({ description: 'Calendar deleted successfully' })
  delete(@Param('organizationId') organizationId: string, @Param('id') id: string) {
    return this.commandBus.execute(new DeleteOrganizationCalendarCommand(organizationId, id));
  }
}
