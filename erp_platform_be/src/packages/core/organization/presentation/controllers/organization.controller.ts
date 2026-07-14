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
import { CurrentContext } from '@core/identity/presentation/decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';

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
  create(@CurrentContext() context: RequestContext, @Body() dto: CreateOrganizationDto) {
    dto.tenantId = context.tenantId;
    return this.commandBus.execute(new CreateOrganizationCommand(dto));
  }

  @Get()
  @ApiOperation({
    summary: 'List organizations',
  })
  @ApiOkResponse({
    type: [OrganizationDto],
  })
  list(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(new ListOrganizationsQuery(context.tenantId));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get organization',
  })
  @ApiOkResponse({
    type: OrganizationDto,
  })
  get(@Param('id') id: string, @CurrentContext() context: RequestContext) {
    return this.queryBus.execute(new GetOrganizationQuery(context.tenantId, id));
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
    @CurrentContext() context: RequestContext,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.commandBus.execute(new UpdateOrganizationCommand(context.tenantId, id, dto));
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete organization',
  })
  @ApiOkResponse({
    description: 'Organization deleted successfully',
  })
  delete(@Param('id') id: string, @CurrentContext() context: RequestContext) {
    return this.commandBus.execute(new DeleteOrganizationCommand(context.tenantId, id));
  }
}
