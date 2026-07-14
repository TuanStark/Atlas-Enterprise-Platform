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
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CreateOrganizationCommand,
  UpdateOrganizationCommand,
  DeleteOrganizationCommand,
} from '../../application/commands';
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  OrganizationDto,
} from '@core/organization/dto';
import { ListOrganizationsQuery } from '@core/organization/application/queries/list-organizations/list-organizations.query';
import { GetOrganizationQuery } from '@core/organization/application/queries/get-organization/get-organization.query';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create organization',
  })
  @ApiCreatedResponse({
    type: String,
    description: 'ID of the created organization',
  })
  create(@Body() dto: CreateOrganizationDto) {
    return this.commandBus.execute(new CreateOrganizationCommand(dto));
  }

  @Get()
  @ApiOperation({
    summary: 'List organizations',
  })
  @ApiOkResponse({
    type: [OrganizationDto],
  })
  list(@Query('tenantId') tenantId: string) {
    return this.queryBus.execute(new ListOrganizationsQuery(tenantId));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get organization',
  })
  @ApiOkResponse({
    type: OrganizationDto,
  })
  get(@Param('id') id: string, @Query('tenantId') tenantId: string) {
    return this.queryBus.execute(new GetOrganizationQuery(tenantId, id));
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update organization',
  })
  @ApiOkResponse({
    description: 'Organization updated successfully',
  })
  update(
    @Param('id') id: string,
    @Query('tenantId') tenantId: string,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.commandBus.execute(new UpdateOrganizationCommand(tenantId, id, dto));
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete organization',
  })
  @ApiOkResponse({
    description: 'Organization deleted successfully',
  })
  delete(@Param('id') id: string, @Query('tenantId') tenantId: string) {
    return this.commandBus.execute(new DeleteOrganizationCommand(tenantId, id));
  }
}
