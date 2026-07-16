import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from 'src/database/prisma.module';
import { FileController } from './presentation/controllers/file.controller';
import { CreateFileHandler, DeleteFileHandler } from './application/commands/file.commands';
import { ListFilesHandler, GetFileHandler } from './application/queries/file.queries';
import { FILE_REPOSITORY } from './domain/repositories/file.repository';
import { PrismaFileRepository } from './infrastructure/persistence/prisma-file.repository';

const CommandHandlers = [CreateFileHandler, DeleteFileHandler];
const QueryHandlers = [ListFilesHandler, GetFileHandler];

@Module({
  imports: [PrismaModule, CqrsModule],
  controllers: [FileController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: FILE_REPOSITORY,
      useClass: PrismaFileRepository,
    },
  ],
  exports: [FILE_REPOSITORY],
})
export class FileModule {}
