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
import { CreateLeavePolicyDto, UpdateLeavePolicyDto } from '../../application/dto/leave-policy.dto';
import {
  CreateLeavePolicyCommand,
  UpdateLeavePolicyCommand,
  DeleteLeavePolicyCommand,
} from '../../application/commands/leave-policy.commands';
import {
  GetLeavePolicyQuery,
  ListLeavePoliciesQuery,
} from '../../application/queries/leave-policy.queries';

@ApiTags('Leave Policies')
@Controller('leave-policies')
export class LeavePolicyController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a leave policy' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created leave policy' })
  create(@CurrentContext() context: RequestContext, @Body() dto: CreateLeavePolicyDto) {
    return this.commandBus.execute(
      new CreateLeavePolicyCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all leave policies' })
  @ApiOkResponse({ description: 'List of leave policies' })
  list(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(new ListLeavePoliciesQuery(Identifier.create(context.tenantId)));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get leave policy by ID' })
  @ApiOkResponse({ description: 'Leave policy details' })
  getById(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetLeavePolicyQuery(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update leave policy' })
  @ApiOkResponse({ description: 'Leave policy updated' })
  update(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateLeavePolicyDto,
  ) {
    return this.commandBus.execute(
      new UpdateLeavePolicyCommand(Identifier.create(context.tenantId), Identifier.create(id), dto),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete leave policy' })
  @ApiOkResponse({ description: 'Leave policy deleted' })
  delete(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new DeleteLeavePolicyCommand(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }
}
