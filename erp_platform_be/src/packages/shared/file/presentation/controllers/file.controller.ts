import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentContext } from '@core/identity/presentation/decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { CreateFileDto, FileDto } from '../../application/dto/file.dto';
import { CreateFileCommand, DeleteFileCommand } from '../../application/commands/file.commands';
import { ListFilesQuery, GetFileQuery } from '../../application/queries/file.queries';
import { RequirePermission } from '@core/rbac/presentation/decorators/require-permission.decorator';

@ApiTags('File Metadata')
@Controller('files')
export class FileController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @RequirePermission('shared.file:write')
  @ApiOperation({ summary: 'Register file metadata' })
  @ApiCreatedResponse({ type: FileDto })
  async create(
    @CurrentContext() context: RequestContext,
    @Body() dto: CreateFileDto,
  ): Promise<FileDto> {
    return this.commandBus.execute(
      new CreateFileCommand({
        tenantId: context.tenantId,
        code: dto.code,
        fileName: dto.fileName,
        mimeType: dto.mimeType,
        extension: dto.extension,
        visibility: dto.visibility,
        size: dto.size,
        checksum: dto.checksum,
        metadata: dto.metadata,
        createdByPrincipalId: context.principalId,
      }),
    );
  }

  @Delete(':id')
  @RequirePermission('shared.file:write')
  @ApiOperation({ summary: 'Delete file metadata' })
  @ApiOkResponse({ description: 'File metadata deleted successfully' })
  async delete(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteFileCommand(Identifier.create(id)));
  }

  @Get()
  @RequirePermission('shared.file:read')
  @ApiOperation({ summary: 'List all files' })
  @ApiOkResponse({ type: [FileDto] })
  async list(@CurrentContext() context: RequestContext): Promise<FileDto[]> {
    return this.queryBus.execute(new ListFilesQuery(Identifier.create(context.tenantId)));
  }

  @Get(':id')
  @RequirePermission('shared.file:read')
  @ApiOperation({ summary: 'Get file by ID' })
  @ApiOkResponse({ type: FileDto })
  async get(@Param('id') id: string): Promise<FileDto | null> {
    return this.queryBus.execute(new GetFileQuery(Identifier.create(id)));
  }
}
