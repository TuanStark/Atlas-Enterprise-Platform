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
  CreateContractTypeDto,
  UpdateContractTypeDto,
} from '../../application/dto/contract-type.dto';
import {
  CreateContractTypeCommand,
  UpdateContractTypeCommand,
  DeleteContractTypeCommand,
} from '../../application/commands/contract-type.commands';
import {
  GetContractTypeQuery,
  ListContractTypesQuery,
} from '../../application/queries/master-data.queries';

@ApiTags('Contract Types')
@Controller('contract-types')
export class ContractTypeController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a contract type' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created contract type' })
  create(@CurrentContext() context: RequestContext, @Body() dto: CreateContractTypeDto) {
    return this.commandBus.execute(
      new CreateContractTypeCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all contract types' })
  @ApiOkResponse({ description: 'List of contract types' })
  list(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(new ListContractTypesQuery(Identifier.create(context.tenantId)));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contract type by ID' })
  @ApiOkResponse({ description: 'Contract type details' })
  getById(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetContractTypeQuery(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update contract type' })
  @ApiOkResponse({ description: 'Contract type updated' })
  update(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateContractTypeDto,
  ) {
    return this.commandBus.execute(
      new UpdateContractTypeCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        dto,
      ),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete contract type' })
  @ApiOkResponse({ description: 'Contract type deleted' })
  delete(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new DeleteContractTypeCommand(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }
}
