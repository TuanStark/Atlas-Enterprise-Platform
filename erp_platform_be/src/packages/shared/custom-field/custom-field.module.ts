import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from 'src/database/prisma.module';
import { CustomFieldController } from './presentation/controllers/custom-field.controller';
import {
  CreateCustomFieldDefinitionHandler,
  DeleteCustomFieldDefinitionHandler,
  SaveCustomFieldValuesHandler,
} from './application/commands/custom-field.commands';
import {
  ListCustomFieldDefinitionsHandler,
  GetCustomFieldValuesHandler,
} from './application/queries/custom-field.queries';
import { CUSTOM_FIELD_REPOSITORY } from './domain/repositories/custom-field.repository';
import { PrismaCustomFieldRepository } from './infrastructure/persistence/prisma-custom-field.repository';

const CommandHandlers = [
  CreateCustomFieldDefinitionHandler,
  DeleteCustomFieldDefinitionHandler,
  SaveCustomFieldValuesHandler,
];
const QueryHandlers = [ListCustomFieldDefinitionsHandler, GetCustomFieldValuesHandler];

@Module({
  imports: [PrismaModule, CqrsModule],
  controllers: [CustomFieldController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: CUSTOM_FIELD_REPOSITORY,
      useClass: PrismaCustomFieldRepository,
    },
  ],
  exports: [CUSTOM_FIELD_REPOSITORY],
})
export class CustomFieldModule {}
