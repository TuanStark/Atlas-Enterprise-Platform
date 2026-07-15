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
  CreateSalaryComponentDto,
  UpdateSalaryComponentDto,
} from '../../application/dto/salary-component.dto';
import {
  CreateSalaryComponentCommand,
  UpdateSalaryComponentCommand,
  DeleteSalaryComponentCommand,
} from '../../application/commands/salary-component.commands';
import {
  GetSalaryComponentQuery,
  ListSalaryComponentsQuery,
} from '../../application/queries/salary-component.queries';

@ApiTags('Salary Components')
@Controller('salary-components')
export class SalaryComponentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a salary component' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created salary component' })
  create(@CurrentContext() context: RequestContext, @Body() dto: CreateSalaryComponentDto) {
    return this.commandBus.execute(
      new CreateSalaryComponentCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all salary components' })
  @ApiOkResponse({ description: 'List of salary components' })
  list(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(
      new ListSalaryComponentsQuery(Identifier.create(context.tenantId)),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get salary component by ID' })
  @ApiOkResponse({ description: 'Salary component details' })
  getById(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetSalaryComponentQuery(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update salary component' })
  @ApiOkResponse({ description: 'Salary component updated' })
  update(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateSalaryComponentDto,
  ) {
    return this.commandBus.execute(
      new UpdateSalaryComponentCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        dto,
      ),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete salary component' })
  @ApiOkResponse({ description: 'Salary component deleted' })
  delete(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new DeleteSalaryComponentCommand(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }
}
