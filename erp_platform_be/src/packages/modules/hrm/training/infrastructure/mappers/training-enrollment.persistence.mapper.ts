import {
  TrainingEnrollment as PrismaTrainingEnrollment,
  TrainingResult as PrismaTrainingResult,
  TrainingCertificate as PrismaTrainingCertificate,
  EnrollmentStatus,
  Prisma,
} from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { TrainingEnrollment } from '../../domain/aggregates/training-enrollment.aggregate';
import { TrainingResult } from '../../domain/entities/training-result.entity';
import { TrainingCertificate } from '../../domain/entities/training-certificate.entity';

export type PrismaTrainingEnrollmentPayload = PrismaTrainingEnrollment & {
  enrollmentTrainingResult?: PrismaTrainingResult | null;
  enrollmentTrainingCertificates?: PrismaTrainingCertificate[];
};

export class TrainingEnrollmentPersistenceMapper {
  static toDomain(prisma: PrismaTrainingEnrollmentPayload): TrainingEnrollment {
    const enrollmentId = Identifier.create(prisma.id);

    return TrainingEnrollment.rehydrate(enrollmentId, {
      tenantId: Identifier.create(prisma.tenantId),
      employmentId: Identifier.create(prisma.employmentId),
      sessionId: Identifier.create(prisma.sessionId),
      enrolledAt: prisma.enrolledAt ?? new Date(),
      status: prisma.status ?? EnrollmentStatus.enrolled,
      createdAt: prisma.createdAt ?? new Date(),
      result: prisma.enrollmentTrainingResult
        ? TrainingResult.rehydrate(Identifier.create(prisma.enrollmentTrainingResult.id), {
            enrollmentId,
            score: prisma.enrollmentTrainingResult.score
              ? prisma.enrollmentTrainingResult.score.toNumber()
              : undefined,
            passed: prisma.enrollmentTrainingResult.passed ?? undefined,
            feedback: prisma.enrollmentTrainingResult.feedback ?? undefined,
            evaluatedByEmploymentId: prisma.enrollmentTrainingResult.evaluatedByEmploymentId
              ? Identifier.create(prisma.enrollmentTrainingResult.evaluatedByEmploymentId)
              : undefined,
            evaluatedAt: prisma.enrollmentTrainingResult.evaluatedAt ?? undefined,
          })
        : undefined,
      certificates: (prisma.enrollmentTrainingCertificates ?? []).map((c) =>
        TrainingCertificate.rehydrate(Identifier.create(c.id), {
          tenantId: Identifier.create(c.tenantId),
          enrollmentId,
          certificateNo: c.certificateNo ?? undefined,
          issuedDate: c.issuedDate ?? undefined,
          expiryDate: c.expiryDate ?? undefined,
          fileId: c.fileId ? Identifier.create(c.fileId) : undefined,
          createdAt: c.createdAt ?? new Date(),
        }),
      ),
    });
  }

  static toPersistence(entity: TrainingEnrollment): PrismaTrainingEnrollment {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      employmentId: entity.employmentId.toString(),
      sessionId: entity.sessionId.toString(),
      enrolledAt: entity.enrolledAt ?? null,
      status: entity.status,
      createdAt: entity.createdAt,
    };
  }
}
