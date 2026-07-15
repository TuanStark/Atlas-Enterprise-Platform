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
import { CreatePayrollDto, UpdatePayrollDto } from '../../application/dto/payroll.dto';
import {
  CreatePayrollCommand,
  UpdatePayrollCommand,
  DeletePayrollCommand,
} from '../../application/commands/payroll.commands';
import {
  GetPayrollQuery,
  ListPayrollsQuery,
  ListPayrollsByPeriodQuery,
} from '../../application/queries/payroll.queries';

@ApiTags('Payrolls')
@Controller('payrolls')
export class PayrollController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create payroll record' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created payroll' })
  create(@CurrentContext() context: RequestContext, @Body() dto: CreatePayrollDto) {
    return this.commandBus.execute(
      new CreatePayrollCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all payroll records' })
  @ApiOkResponse({ description: 'List of payrolls' })
  list(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(new ListPayrollsQuery(Identifier.create(context.tenantId)));
  }

  @Get('period/:periodId')
  @ApiOperation({ summary: 'List payrolls by period' })
  @ApiOkResponse({ description: 'List of payrolls for a period' })
  listByPeriod(@CurrentContext() context: RequestContext, @Param('periodId') periodId: string) {
    return this.queryBus.execute(
      new ListPayrollsByPeriodQuery(
        Identifier.create(context.tenantId),
        Identifier.create(periodId),
      ),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payroll by ID' })
  @ApiOkResponse({ description: 'Payroll details' })
  getById(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetPayrollQuery(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update payroll' })
  @ApiOkResponse({ description: 'Payroll updated' })
  update(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdatePayrollDto,
  ) {
    return this.commandBus.execute(
      new UpdatePayrollCommand(Identifier.create(context.tenantId), Identifier.create(id), dto),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete payroll' })
  @ApiOkResponse({ description: 'Payroll deleted' })
  delete(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new DeletePayrollCommand(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }
}
