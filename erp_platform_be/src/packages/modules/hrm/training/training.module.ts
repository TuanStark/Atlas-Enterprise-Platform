import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from 'src/database/prisma.module';

// Repositories
import { TRAINING_COURSE_REPOSITORY } from './domain/repositories/training-course.repository';
import { TRAINING_SESSION_REPOSITORY } from './domain/repositories/training-session.repository';
import { TRAINING_ENROLLMENT_REPOSITORY } from './domain/repositories/training-enrollment.repository';

import { PrismaTrainingCourseRepository } from './infrastructure/repositories/prisma-training-course.repository';
import { PrismaTrainingSessionRepository } from './infrastructure/repositories/prisma-training-session.repository';
import { PrismaTrainingEnrollmentRepository } from './infrastructure/repositories/prisma-training-enrollment.repository';

// Controllers
import { TrainingCourseController } from './presentation/controllers/training-course.controller';
import { TrainingSessionController } from './presentation/controllers/training-session.controller';
import { TrainingEnrollmentController } from './presentation/controllers/training-enrollment.controller';

// Command Handlers
import {
  CreateTrainingCourseHandler,
  UpdateTrainingCourseHandler,
  DeleteTrainingCourseHandler,
} from './application/commands/training-course.commands';
import {
  CreateTrainingSessionHandler,
  UpdateTrainingSessionHandler,
  DeleteTrainingSessionHandler,
} from './application/commands/training-session.commands';
import {
  CreateTrainingEnrollmentHandler,
  UpdateTrainingEnrollmentHandler,
  DeleteTrainingEnrollmentHandler,
  RecordTrainingResultHandler,
  IssueTrainingCertificateHandler,
} from './application/commands/training-enrollment.commands';

// Query Handlers
import {
  GetTrainingCourseHandler,
  ListTrainingCoursesHandler,
} from './application/queries/training-course.queries';
import {
  GetTrainingSessionHandler,
  ListTrainingSessionsHandler,
} from './application/queries/training-session.queries';
import {
  GetTrainingEnrollmentHandler,
  ListTrainingEnrollmentsHandler,
  ListEnrollmentsBySessionHandler,
} from './application/queries/training-enrollment.queries';

const commandHandlers = [
  CreateTrainingCourseHandler,
  UpdateTrainingCourseHandler,
  DeleteTrainingCourseHandler,
  CreateTrainingSessionHandler,
  UpdateTrainingSessionHandler,
  DeleteTrainingSessionHandler,
  CreateTrainingEnrollmentHandler,
  UpdateTrainingEnrollmentHandler,
  DeleteTrainingEnrollmentHandler,
  RecordTrainingResultHandler,
  IssueTrainingCertificateHandler,
];

const queryHandlers = [
  GetTrainingCourseHandler,
  ListTrainingCoursesHandler,
  GetTrainingSessionHandler,
  ListTrainingSessionsHandler,
  GetTrainingEnrollmentHandler,
  ListTrainingEnrollmentsHandler,
  ListEnrollmentsBySessionHandler,
];

@Module({
  imports: [CqrsModule, PrismaModule],

  controllers: [TrainingCourseController, TrainingSessionController, TrainingEnrollmentController],

  providers: [
    ...commandHandlers,
    ...queryHandlers,
    {
      provide: TRAINING_COURSE_REPOSITORY,
      useClass: PrismaTrainingCourseRepository,
    },
    {
      provide: TRAINING_SESSION_REPOSITORY,
      useClass: PrismaTrainingSessionRepository,
    },
    {
      provide: TRAINING_ENROLLMENT_REPOSITORY,
      useClass: PrismaTrainingEnrollmentRepository,
    },
  ],

  exports: [
    TRAINING_COURSE_REPOSITORY,
    TRAINING_SESSION_REPOSITORY,
    TRAINING_ENROLLMENT_REPOSITORY,
  ],
})
export class TrainingModule {}
