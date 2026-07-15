import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from 'src/database/prisma.module';

// Repositories
import { PERFORMANCE_CYCLE_REPOSITORY } from './domain/repositories/performance-cycle.repository';
import { PERFORMANCE_RATING_REPOSITORY } from './domain/repositories/performance-rating.repository';
import { PERFORMANCE_GOAL_REPOSITORY } from './domain/repositories/performance-goal.repository';
import { PERFORMANCE_REVIEW_REPOSITORY } from './domain/repositories/performance-review.repository';

import { PrismaPerformanceCycleRepository } from './infrastructure/repositories/prisma-performance-cycle.repository';
import { PrismaPerformanceRatingRepository } from './infrastructure/repositories/prisma-performance-rating.repository';
import { PrismaPerformanceGoalRepository } from './infrastructure/repositories/prisma-performance-goal.repository';
import { PrismaPerformanceReviewRepository } from './infrastructure/repositories/prisma-performance-review.repository';

// Controllers
import { PerformanceCycleController } from './presentation/controllers/performance-cycle.controller';
import { PerformanceRatingController } from './presentation/controllers/performance-rating.controller';
import { PerformanceGoalController } from './presentation/controllers/performance-goal.controller';
import { PerformanceReviewController } from './presentation/controllers/performance-review.controller';

// Command Handlers
import {
  CreatePerformanceCycleHandler,
  UpdatePerformanceCycleHandler,
  DeletePerformanceCycleHandler,
} from './application/commands/performance-cycle.commands';
import {
  CreatePerformanceRatingHandler,
  UpdatePerformanceRatingHandler,
  DeletePerformanceRatingHandler,
} from './application/commands/performance-rating.commands';
import {
  CreatePerformanceGoalHandler,
  UpdatePerformanceGoalHandler,
  DeletePerformanceGoalHandler,
  UpdateGoalProgressHandler,
} from './application/commands/performance-goal.commands';
import {
  CreatePerformanceReviewHandler,
  UpdatePerformanceReviewHandler,
  DeletePerformanceReviewHandler,
} from './application/commands/performance-review.commands';

// Query Handlers
import {
  GetPerformanceCycleHandler,
  ListPerformanceCyclesHandler,
} from './application/queries/performance-cycle.queries';
import {
  GetPerformanceRatingHandler,
  ListPerformanceRatingsHandler,
} from './application/queries/performance-rating.queries';
import {
  GetPerformanceGoalHandler,
  ListPerformanceGoalsHandler,
  ListGoalsByEmploymentHandler,
} from './application/queries/performance-goal.queries';
import {
  GetPerformanceReviewHandler,
  ListPerformanceReviewsHandler,
  ListReviewsByEmploymentHandler,
} from './application/queries/performance-review.queries';

const commandHandlers = [
  CreatePerformanceCycleHandler,
  UpdatePerformanceCycleHandler,
  DeletePerformanceCycleHandler,
  CreatePerformanceRatingHandler,
  UpdatePerformanceRatingHandler,
  DeletePerformanceRatingHandler,
  CreatePerformanceGoalHandler,
  UpdatePerformanceGoalHandler,
  DeletePerformanceGoalHandler,
  UpdateGoalProgressHandler,
  CreatePerformanceReviewHandler,
  UpdatePerformanceReviewHandler,
  DeletePerformanceReviewHandler,
];

const queryHandlers = [
  GetPerformanceCycleHandler,
  ListPerformanceCyclesHandler,
  GetPerformanceRatingHandler,
  ListPerformanceRatingsHandler,
  GetPerformanceGoalHandler,
  ListPerformanceGoalsHandler,
  ListGoalsByEmploymentHandler,
  GetPerformanceReviewHandler,
  ListPerformanceReviewsHandler,
  ListReviewsByEmploymentHandler,
];

@Module({
  imports: [CqrsModule, PrismaModule],

  controllers: [
    PerformanceCycleController,
    PerformanceRatingController,
    PerformanceGoalController,
    PerformanceReviewController,
  ],

  providers: [
    ...commandHandlers,
    ...queryHandlers,
    {
      provide: PERFORMANCE_CYCLE_REPOSITORY,
      useClass: PrismaPerformanceCycleRepository,
    },
    {
      provide: PERFORMANCE_RATING_REPOSITORY,
      useClass: PrismaPerformanceRatingRepository,
    },
    {
      provide: PERFORMANCE_GOAL_REPOSITORY,
      useClass: PrismaPerformanceGoalRepository,
    },
    {
      provide: PERFORMANCE_REVIEW_REPOSITORY,
      useClass: PrismaPerformanceReviewRepository,
    },
  ],

  exports: [
    PERFORMANCE_CYCLE_REPOSITORY,
    PERFORMANCE_RATING_REPOSITORY,
    PERFORMANCE_GOAL_REPOSITORY,
    PERFORMANCE_REVIEW_REPOSITORY,
  ],
})
export class PerformanceModule {}
