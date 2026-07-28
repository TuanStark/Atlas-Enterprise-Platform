import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from 'src/database/prisma.module';
import { IArchiveRepository } from './domain/repositories/archive.repository';
import { PrismaArchiveRepository } from './infrastructure/repositories/prisma-archive.repository';
import { ArchiveController } from './presentation/controllers/archive.controller';
import {
  ArchiveRecordHandler,
  UnarchiveRecordHandler,
} from './application/commands/archive-record.command';
import {
  ListArchiveRecordsHandler,
  GetArchiveRecordHandler,
} from './application/queries/archive.handlers';

const CommandHandlers = [ArchiveRecordHandler, UnarchiveRecordHandler];
const QueryHandlers = [ListArchiveRecordsHandler, GetArchiveRecordHandler];

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [ArchiveController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: IArchiveRepository,
      useClass: PrismaArchiveRepository,
    },
  ],
  exports: [IArchiveRepository],
})
export class ArchiveModule {}
