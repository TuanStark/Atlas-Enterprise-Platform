import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentContext } from '@core/identity/presentation/decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';
import { CreateArchiveRecordDto } from '../../application/dto/archive.dto';
import {
  ArchiveRecordCommand,
  UnarchiveRecordCommand,
} from '../../application/commands/archive-record.command';
import {
  ListArchiveRecordsQuery,
  GetArchiveRecordQuery,
} from '../../application/queries/archive.queries';

@ApiTags('Archives')
@Controller('archives')
export class ArchiveController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Archive a record' })
  @ApiCreatedResponse({ type: String, description: 'ID of the archive record' })
  archive(@CurrentContext() context: RequestContext, @Body() dto: CreateArchiveRecordDto) {
    return this.commandBus.execute(
      new ArchiveRecordCommand(context.tenantId, context.principalId, dto),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unarchive (restore) a record' })
  @ApiOkResponse({ description: 'Record restored successfully' })
  unarchive(@CurrentContext() context: RequestContext, @Param('id') archiveId: string) {
    return this.commandBus.execute(
      new UnarchiveRecordCommand(context.tenantId, archiveId),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all archived records' })
  list(
    @CurrentContext() context: RequestContext,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('sourceModule') sourceModule?: string,
    @Query('sourceEntity') sourceEntity?: string,
  ) {
    return this.queryBus.execute(
      new ListArchiveRecordsQuery(
        context.tenantId,
        page ? parseInt(page, 10) : 1,
        pageSize ? parseInt(pageSize, 10) : 15,
        sourceModule,
        sourceEntity,
      ),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get archive record detail' })
  getById(@CurrentContext() context: RequestContext, @Param('id') archiveId: string) {
    return this.queryBus.execute(
      new GetArchiveRecordQuery(context.tenantId, archiveId),
    );
  }
}
