import { Body, Controller, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
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

@ApiTags('Contracts')
@Controller('contracts')
export class ContractController {
  constructor(private readonly commandBus: CommandBus) {}

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
}
