import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from 'src/database/prisma.module';
import { FileController } from './presentation/controllers/file.controller';
import { CreateFileHandler, DeleteFileHandler } from './application/commands/file.commands';
import { ListFilesHandler, GetFileHandler } from './application/queries/file.queries';
import { FILE_REPOSITORY } from './domain/repositories/file.repository';
import { PrismaFileRepository } from './infrastructure/persistence/prisma-file.repository';
import { FILE_STORAGE_PROVIDER, CloudinaryStorageProvider, LocalStorageProvider } from './infrastructure/storage/file-storage.provider';

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
    {
      provide: FILE_STORAGE_PROVIDER,
      useFactory: () => {
        const hasCloudinary =
          !!(process.env.CLOUDINARY_CLOUD_NAME &&
          process.env.CLOUDINARY_API_KEY &&
          process.env.CLOUDINARY_API_SECRET);
        if (hasCloudinary) {
          return new CloudinaryStorageProvider();
        }
        return new LocalStorageProvider();
      },
    },
  ],
  exports: [FILE_REPOSITORY, FILE_STORAGE_PROVIDER],
})
export class FileModule {}
