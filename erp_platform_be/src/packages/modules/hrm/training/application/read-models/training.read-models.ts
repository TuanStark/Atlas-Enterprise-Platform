import { TrainingStatus, EnrollmentStatus } from '@prisma/client';

export interface TrainingCourseReadModel {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  category?: string;
  durationHours?: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingSessionReadModel {
  id: string;
  tenantId: string;
  courseId: string;
  instructorEmploymentId?: string;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  capacity?: number;
  status: TrainingStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingResultReadModel {
  id: string;
  enrollmentId: string;
  score?: number;
  passed?: boolean;
  feedback?: string;
  evaluatedByEmploymentId?: string;
  evaluatedAt?: Date;
}

export interface TrainingCertificateReadModel {
  id: string;
  tenantId: string;
  enrollmentId: string;
  certificateNo?: string;
  issuedDate?: Date;
  expiryDate?: Date;
  fileId?: string;
  createdAt: Date;
}

export interface TrainingEnrollmentReadModel {
  id: string;
  tenantId: string;
  employmentId: string;
  sessionId: string;
  enrolledAt?: Date;
  status: EnrollmentStatus;
  createdAt: Date;
  result?: TrainingResultReadModel;
  certificates: TrainingCertificateReadModel[];
}
