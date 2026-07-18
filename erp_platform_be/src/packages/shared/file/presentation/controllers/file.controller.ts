import { Body, Controller, Delete, Get, Param, Post, Inject, UseInterceptors, UploadedFile, Res, HttpStatus } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentContext } from '@core/identity/presentation/decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { CreateFileDto, FileDto } from '../../application/dto/file.dto';
import { CreateFileCommand, DeleteFileCommand } from '../../application/commands/file.commands';
import { ListFilesQuery, GetFileQuery } from '../../application/queries/file.queries';
import { RequirePermission } from '@core/rbac/presentation/decorators/require-permission.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import * as express from 'express';
import { existsSync, createReadStream } from 'fs';
import { join } from 'path';
import { Public } from '@core/rbac/presentation/decorators/public.decorator';
import { FILE_STORAGE_PROVIDER } from '../../infrastructure/storage/file-storage.provider';
import type { FileStorageProvider } from '../../infrastructure/storage/file-storage.provider';

@ApiTags('File Metadata')
@Controller('files')
export class FileController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject(FILE_STORAGE_PROVIDER)
    private readonly storageProvider: FileStorageProvider,
  ) { }

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

  @Post('upload')
  @RequirePermission('shared.file:write')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload file to storage and register metadata' })
  @ApiCreatedResponse({ type: FileDto })
  async uploadFile(
    @CurrentContext() context: RequestContext,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<FileDto> {
    if (!file) {
      throw new Error('No file provided for upload');
    }

    const uploadResult = await this.storageProvider.upload(file);

    const originalName = file.originalname;
    const ext = originalName.includes('.') ? originalName.split('.').pop() || '' : '';

    return this.commandBus.execute(
      new CreateFileCommand({
        tenantId: context.tenantId,
        fileName: originalName,
        mimeType: file.mimetype,
        extension: ext.toLowerCase(),
        visibility: 'public',
        size: uploadResult.size,
        metadata: {
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          provider: uploadResult.provider,
        },
        createdByPrincipalId: context.principalId,
      }),
    );
  }

  @Delete(':id')
  @RequirePermission('shared.file:write')
  @ApiOperation({ summary: 'Delete file metadata' })
  @ApiOkResponse({ description: 'File metadata deleted successfully' })
  async delete(@Param('id') id: string): Promise<void> {
    const file = await this.queryBus.execute(new GetFileQuery(Identifier.create(id)));
    if (file) {
      const metadata = file.metadata as any;
      if (metadata?.publicId) {
        try {
          await this.storageProvider.delete(metadata.publicId);
        } catch (e) {
          throw new Error('Error deleting file');
        }
      }
    }
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

  @Get(':id/view')
  @Public()
  @ApiOperation({ summary: 'Stream/View or download file content' })
  async view(
    @Param('id') id: string,
    @Res() res: express.Response,
  ): Promise<void> {
    const file = await this.queryBus.execute(new GetFileQuery(Identifier.create(id)));
    if (!file) {
      res.status(HttpStatus.NOT_FOUND).send('File metadata not found');
      return;
    }

    const metadata = file.metadata as any;
    const provider = metadata?.provider || 'local';

    if (provider === 'cloudinary' && metadata?.url) {
      res.redirect(metadata.url);
      return;
    }

    const uploadDir = join(process.cwd(), 'uploads');
    const publicId = metadata?.publicId || file.id;
    const filePath = join(uploadDir, publicId);

    if (!existsSync(filePath)) {
      res.status(HttpStatus.NOT_FOUND).send('File content not found on disk');
      return;
    }

    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');

    const inlineTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf'];
    const isInline = inlineTypes.includes(file.mimeType || '');
    const disposition = isInline ? 'inline' : 'attachment';

    res.setHeader('Content-Disposition', `${disposition}; filename="${encodeURIComponent(file.fileName || '')}"`);

    const stream = createReadStream(filePath);
    stream.pipe(res);
  }
}
