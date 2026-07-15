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
  CreatePayrollPeriodDto,
  UpdatePayrollPeriodDto,
} from '../../application/dto/payroll-period.dto';
import {
  CreatePayrollPeriodCommand,
  UpdatePayrollPeriodCommand,
  DeletePayrollPeriodCommand,
} from '../../application/commands/payroll-period.commands';
import {
  GetPayrollPeriodQuery,
  ListPayrollPeriodsQuery,
} from '../../application/queries/payroll-period.queries';
import { CalculatePayrollCommand } from '../../application/commands/payroll.commands';

@ApiTags('Payroll Periods')
@Controller('payroll-periods')
export class PayrollPeriodController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a payroll period' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created payroll period' })
  create(@CurrentContext() context: RequestContext, @Body() dto: CreatePayrollPeriodDto) {
    return this.commandBus.execute(
      new CreatePayrollPeriodCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all payroll periods' })
  @ApiOkResponse({ description: 'List of payroll periods' })
  list(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(new ListPayrollPeriodsQuery(Identifier.create(context.tenantId)));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payroll period by ID' })
  @ApiOkResponse({ description: 'Payroll period details' })
  getById(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetPayrollPeriodQuery(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update payroll period' })
  @ApiOkResponse({ description: 'Payroll period updated' })
  update(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdatePayrollPeriodDto,
  ) {
    return this.commandBus.execute(
      new UpdatePayrollPeriodCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        dto,
      ),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete payroll period' })
  @ApiOkResponse({ description: 'Payroll period deleted' })
  delete(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new DeletePayrollPeriodCommand(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Post(':id/calculate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate payroll for the period' })
  @ApiOkResponse({ description: 'Payroll calculations triggered' })
  calculate(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new CalculatePayrollCommand(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }
}
