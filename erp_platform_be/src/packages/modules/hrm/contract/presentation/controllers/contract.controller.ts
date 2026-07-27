import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentContext } from '@core/identity/presentation/decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import {
  CreateContractDto,
  CreateContractAnnexDto,
  SignContractDto,
} from '../../application/dto/contract.dto';
import {
  CreateContractCommand,
  CreateContractAnnexCommand,
  SignContractCommand,
} from '../../application/commands/contract.commands';
import { ListContractsQuery } from '../../application/queries/list-contracts/list-contracts.query';
import { GetContractsByEmploymentQuery } from '../../application/queries/get-contracts-by-employment/get-contracts-by-employment.query';

@ApiTags('Contracts')
@Controller('contracts')
export class ContractController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new draft contract' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created contract' })
  create(
    @CurrentContext() context: RequestContext,
    @Body() dto: CreateContractDto,
  ) {
    return this.commandBus.execute(
      new CreateContractCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Patch(':id/sign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign a contract' })
  @ApiOkResponse({ description: 'Contract signed successfully' })
  sign(
    @CurrentContext() context: RequestContext,
    @Param('id') contractId: string,
    @Body() dto: SignContractDto,
  ) {
    return this.commandBus.execute(
      new SignContractCommand(
        Identifier.create(context.tenantId),
        Identifier.create(contractId),
        dto,
      ),
    );
  }

  @Post(':id/annexes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an annex for an active contract' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created annex' })
  createAnnex(
    @CurrentContext() context: RequestContext,
    @Param('id') contractId: string,
    @Body() dto: CreateContractAnnexDto,
  ) {
    return this.commandBus.execute(
      new CreateContractAnnexCommand(
        Identifier.create(context.tenantId),
        Identifier.create(contractId),
        dto,
      ),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all contracts' })
  list(
    @CurrentContext() context: RequestContext,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
  ) {
    return this.queryBus.execute(
      new ListContractsQuery(
        Identifier.create(context.tenantId),
        page ? parseInt(page, 10) : 1,
        pageSize ? parseInt(pageSize, 10) : 15,
        status,
      ),
    );
  }

  @Get('employment/:id')
  @ApiOperation({ summary: 'Get contracts by employment ID' })
  getByEmployment(
    @CurrentContext() context: RequestContext,
    @Param('id') employmentId: string,
  ) {
    return this.queryBus.execute(
      new GetContractsByEmploymentQuery(
        Identifier.create(context.tenantId),
        Identifier.create(employmentId),
      ),
    );
  }
}
