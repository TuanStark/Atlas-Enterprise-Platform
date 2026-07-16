import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from 'src/database/prisma.module';
import { TaggingController } from './presentation/controllers/tagging.controller';
import { CreateTagHandler, AssignTagHandler, RemoveTagAssignmentHandler, DeleteTagHandler } from './application/commands/tagging.commands';
import { ListTagsHandler, ListAssignmentsForRecordHandler } from './application/queries/tagging.queries';
import { TAGGING_REPOSITORY } from './domain/repositories/tagging.repository';
import { PrismaTaggingRepository } from './infrastructure/persistence/prisma-tagging.repository';

const CommandHandlers = [CreateTagHandler, AssignTagHandler, RemoveTagAssignmentHandler, DeleteTagHandler];
const QueryHandlers = [ListTagsHandler, ListAssignmentsForRecordHandler];

@Module({
  imports: [PrismaModule, CqrsModule],
  controllers: [TaggingController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: TAGGING_REPOSITORY,
      useClass: PrismaTaggingRepository,
    },
  ],
  exports: [TAGGING_REPOSITORY],
})
export class TaggingModule {}
