import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseCommandHandler } from '@shared-kernel/application';
import { PerformanceReview } from '../../domain/aggregates/performance-review.aggregate';
import { PerformanceReviewItem } from '../../domain/entities/performance-review-item.entity';
import * as repo from '../../domain/repositories/performance-review.repository';
import {
  CreatePerformanceReviewDto,
  UpdatePerformanceReviewDto,
} from '../dto/performance-review.dto';

// --- Commands ---

export class CreatePerformanceReviewCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly dto: CreatePerformanceReviewDto,
  ) {}
}

export class UpdatePerformanceReviewCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
    public readonly dto: UpdatePerformanceReviewDto,
  ) {}
}

export class DeletePerformanceReviewCommand {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

// --- Handlers ---

@CommandHandler(CreatePerformanceReviewCommand)
export class CreatePerformanceReviewHandler
  extends BaseCommandHandler
  implements ICommandHandler<CreatePerformanceReviewCommand>
{
  constructor(
    @Inject(repo.PERFORMANCE_REVIEW_REPOSITORY)
    private readonly repository: repo.PerformanceReviewRepository,
  ) {
    super();
  }

  async execute(command: CreatePerformanceReviewCommand): Promise<Identifier> {
    const entity = PerformanceReview.create({
      tenantId: command.tenantId,
      employmentId: Identifier.create(command.dto.employmentId),
      reviewerEmploymentId: command.dto.reviewerEmploymentId
        ? Identifier.create(command.dto.reviewerEmploymentId)
        : undefined,
      performanceCycleId: Identifier.create(command.dto.performanceCycleId),
      workflowInstanceId: command.dto.workflowInstanceId
        ? Identifier.create(command.dto.workflowInstanceId)
        : undefined,
      overallRatingId: command.dto.overallRatingId
        ? Identifier.create(command.dto.overallRatingId)
        : undefined,
      overallScore: command.dto.overallScore,
      status: command.dto.status,
      comment: command.dto.comment,
    });

    if (command.dto.reviewItems) {
      entity.setReviewItems(
        command.dto.reviewItems.map((ri) =>
          PerformanceReviewItem.create({
            performanceReviewId: entity.id,
            goalId: ri.goalId ? Identifier.create(ri.goalId) : undefined,
            criteria: ri.criteria,
            ratingId: ri.ratingId ? Identifier.create(ri.ratingId) : undefined,
            score: ri.score,
            comment: ri.comment,
          }),
        ),
      );
    }

    await this.repository.save(entity);
    return entity.id;
  }
}

@CommandHandler(UpdatePerformanceReviewCommand)
export class UpdatePerformanceReviewHandler
  extends BaseCommandHandler
  implements ICommandHandler<UpdatePerformanceReviewCommand>
{
  constructor(
    @Inject(repo.PERFORMANCE_REVIEW_REPOSITORY)
    private readonly repository: repo.PerformanceReviewRepository,
  ) {
    super();
  }

  async execute(command: UpdatePerformanceReviewCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'PerformanceReview',
      command.id.toString(),
    );

    entity.update({
      reviewerEmploymentId: command.dto.reviewerEmploymentId
        ? Identifier.create(command.dto.reviewerEmploymentId)
        : undefined,
      workflowInstanceId: command.dto.workflowInstanceId
        ? Identifier.create(command.dto.workflowInstanceId)
        : undefined,
      overallRatingId: command.dto.overallRatingId
        ? Identifier.create(command.dto.overallRatingId)
        : undefined,
      overallScore: command.dto.overallScore,
      status: command.dto.status,
      comment: command.dto.comment,
    });

    if (command.dto.reviewItems) {
      entity.setReviewItems(
        command.dto.reviewItems.map((ri) =>
          PerformanceReviewItem.create({
            performanceReviewId: entity.id,
            goalId: ri.goalId ? Identifier.create(ri.goalId) : undefined,
            criteria: ri.criteria,
            ratingId: ri.ratingId ? Identifier.create(ri.ratingId) : undefined,
            score: ri.score,
            comment: ri.comment,
          }),
        ),
      );
    }

    await this.repository.update(entity);
  }
}

@CommandHandler(DeletePerformanceReviewCommand)
export class DeletePerformanceReviewHandler
  extends BaseCommandHandler
  implements ICommandHandler<DeletePerformanceReviewCommand>
{
  constructor(
    @Inject(repo.PERFORMANCE_REVIEW_REPOSITORY)
    private readonly repository: repo.PerformanceReviewRepository,
  ) {
    super();
  }

  async execute(command: DeletePerformanceReviewCommand): Promise<void> {
    const entity = this.ensureFound(
      await this.repository.findById(command.tenantId, command.id),
      'PerformanceReview',
      command.id.toString(),
    );

    await this.repository.delete(entity);
  }
}
