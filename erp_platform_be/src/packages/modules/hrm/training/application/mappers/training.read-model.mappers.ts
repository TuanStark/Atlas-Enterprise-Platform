import { TrainingCourse } from '../../domain/aggregates/training-course.aggregate';
import { TrainingSession } from '../../domain/aggregates/training-session.aggregate';
import { TrainingEnrollment } from '../../domain/aggregates/training-enrollment.aggregate';
import {
  TrainingCourseReadModel,
  TrainingSessionReadModel,
  TrainingEnrollmentReadModel,
} from '../read-models/training.read-models';

export class TrainingReadModelMappers {
  static toTrainingCourseReadModel(entity: TrainingCourse): TrainingCourseReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      code: entity.code,
      name: entity.name,
      category: entity.category,
      durationHours: entity.durationHours,
      description: entity.description,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toTrainingSessionReadModel(entity: TrainingSession): TrainingSessionReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      courseId: entity.courseId.toString(),
      instructorEmploymentId: entity.instructorEmploymentId
        ? entity.instructorEmploymentId.toString()
        : undefined,
      startDate: entity.startDate,
      endDate: entity.endDate,
      location: entity.location,
      capacity: entity.capacity,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toTrainingEnrollmentReadModel(entity: TrainingEnrollment): TrainingEnrollmentReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      employmentId: entity.employmentId.toString(),
      sessionId: entity.sessionId.toString(),
      enrolledAt: entity.enrolledAt,
      status: entity.status,
      createdAt: entity.createdAt,
      result: entity.result
        ? {
            id: entity.result.id.toString(),
            enrollmentId: entity.result.enrollmentId.toString(),
            score: entity.result.score,
            passed: entity.result.passed,
            feedback: entity.result.feedback,
            evaluatedByEmploymentId: entity.result.evaluatedByEmploymentId
              ? entity.result.evaluatedByEmploymentId.toString()
              : undefined,
            evaluatedAt: entity.result.evaluatedAt,
          }
        : undefined,
      certificates: entity.certificates.map((c) => ({
        id: c.id.toString(),
        tenantId: c.tenantId.toString(),
        enrollmentId: c.enrollmentId.toString(),
        certificateNo: c.certificateNo,
        issuedDate: c.issuedDate,
        expiryDate: c.expiryDate,
        fileId: c.fileId ? c.fileId.toString() : undefined,
        createdAt: c.createdAt,
      })),
    };
  }
}
