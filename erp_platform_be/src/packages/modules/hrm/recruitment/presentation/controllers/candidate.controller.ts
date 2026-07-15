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
import { CreateCandidateDto, UpdateCandidateDto } from '../../application/dto/candidate.dto';
import {
  CreateCandidateCommand,
  UpdateCandidateCommand,
  DeleteCandidateCommand,
} from '../../application/commands/candidate.commands';
import {
  GetCandidateQuery,
  ListCandidatesQuery,
} from '../../application/queries/candidate.queries';

@ApiTags('Candidates')
@Controller('candidates')
export class CandidateController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a candidate' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created candidate' })
  create(@CurrentContext() context: RequestContext, @Body() dto: CreateCandidateDto) {
    return this.commandBus.execute(
      new CreateCandidateCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all candidates' })
  @ApiOkResponse({ description: 'List of candidates' })
  list(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(new ListCandidatesQuery(Identifier.create(context.tenantId)));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get candidate by ID' })
  @ApiOkResponse({ description: 'Candidate details' })
  getById(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetCandidateQuery(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update candidate' })
  @ApiOkResponse({ description: 'Candidate updated' })
  update(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateCandidateDto,
  ) {
    return this.commandBus.execute(
      new UpdateCandidateCommand(Identifier.create(context.tenantId), Identifier.create(id), dto),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete candidate' })
  @ApiOkResponse({ description: 'Candidate deleted' })
  delete(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new DeleteCandidateCommand(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }
}
