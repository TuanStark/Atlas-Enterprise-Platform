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
import {
  CreateTrainingCourseDto,
  UpdateTrainingCourseDto,
} from '../../application/dto/training-course.dto';
import {
  CreateTrainingCourseCommand,
  UpdateTrainingCourseCommand,
  DeleteTrainingCourseCommand,
} from '../../application/commands/training-course.commands';
import {
  GetTrainingCourseQuery,
  ListTrainingCoursesQuery,
} from '../../application/queries/training-course.queries';

@ApiTags('Training Courses')
@Controller('training-courses')
export class TrainingCourseController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a training course' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created training course' })
  create(@CurrentContext() context: RequestContext, @Body() dto: CreateTrainingCourseDto) {
    return this.commandBus.execute(
      new CreateTrainingCourseCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all training courses' })
  @ApiOkResponse({ description: 'List of training courses' })
  list(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(new ListTrainingCoursesQuery(Identifier.create(context.tenantId)));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get training course by ID' })
  @ApiOkResponse({ description: 'Training course details' })
  getById(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetTrainingCourseQuery(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update training course' })
  @ApiOkResponse({ description: 'Training course updated' })
  update(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateTrainingCourseDto,
  ) {
    return this.commandBus.execute(
      new UpdateTrainingCourseCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        dto,
      ),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete training course' })
  @ApiOkResponse({ description: 'Training course deleted' })
  delete(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new DeleteTrainingCourseCommand(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }
}
