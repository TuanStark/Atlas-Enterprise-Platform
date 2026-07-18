import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from 'src/database/prisma.module';
import { WorkflowController } from './presentation/controllers/workflow.controller';
import { StartWorkflowInstanceHandler } from './application/commands/workflow.commands';
import {
  ListWorkflowDefinitionsHandler,
  GetWorkflowInstanceByRecordHandler,
} from './application/queries/workflow.queries';
import { WORKFLOW_REPOSITORY } from './domain/repositories/workflow.repository';
import { PrismaWorkflowRepository } from './infrastructure/persistence/prisma-workflow.repository';

const CommandHandlers = [StartWorkflowInstanceHandler];
const QueryHandlers = [ListWorkflowDefinitionsHandler, GetWorkflowInstanceByRecordHandler];

@Module({
  imports: [PrismaModule, CqrsModule],
  controllers: [WorkflowController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: WORKFLOW_REPOSITORY,
      useClass: PrismaWorkflowRepository,
    },
  ],
  exports: [WORKFLOW_REPOSITORY],
})
export class WorkflowModule {}
