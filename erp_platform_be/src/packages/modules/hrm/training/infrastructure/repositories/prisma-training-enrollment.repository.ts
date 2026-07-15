import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { TrainingEnrollment } from '../../domain/aggregates/training-enrollment.aggregate';
import { TrainingEnrollmentRepository } from '../../domain/repositories/training-enrollment.repository';
import { TrainingEnrollmentPersistenceMapper } from '../mappers/training-enrollment.persistence.mapper';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaTrainingEnrollmentRepository implements TrainingEnrollmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    enrollmentTrainingResult: true,
    enrollmentTrainingCertificates: true,
  };

  async save(entity: TrainingEnrollment): Promise<void> {
    const data = TrainingEnrollmentPersistenceMapper.toPersistence(entity);

    await this.prisma.trainingEnrollment.create({
      data: {
        ...data,
        enrollmentTrainingResult: entity.result
          ? {
              create: {
                id: entity.result.id.toString(),
                score:
                  entity.result.score !== undefined
                    ? new Prisma.Decimal(entity.result.score)
                    : null,
                passed: entity.result.passed,
                feedback: entity.result.feedback,
                evaluatedByEmploymentId: entity.result.evaluatedByEmploymentId
                  ? entity.result.evaluatedByEmploymentId.toString()
                  : null,
                evaluatedAt: entity.result.evaluatedAt,
              },
            }
          : undefined,
        enrollmentTrainingCertificates: {
          create: entity.certificates.map((c) => ({
            id: c.id.toString(),
            tenantId: c.tenantId.toString(),
            certificateNo: c.certificateNo,
            issuedDate: c.issuedDate,
            expiryDate: c.expiryDate,
            fileId: c.fileId ? c.fileId.toString() : null,
            createdAt: c.createdAt,
          })),
        },
      },
    });
  }

  async update(entity: TrainingEnrollment): Promise<void> {
    const data = TrainingEnrollmentPersistenceMapper.toPersistence(entity);

    await this.prisma.$transaction(async (tx) => {
      await tx.trainingEnrollment.update({
        where: { id: data.id },
        data: {
          status: data.status,
          enrolledAt: data.enrolledAt,
        },
      });

      // Sync result
      await tx.trainingResult.deleteMany({ where: { enrollmentId: data.id } });
      if (entity.result) {
        await tx.trainingResult.create({
          data: {
            id: entity.result.id.toString(),
            enrollmentId: data.id,
            score:
              entity.result.score !== undefined ? new Prisma.Decimal(entity.result.score) : null,
            passed: entity.result.passed ?? null,
            feedback: entity.result.feedback ?? null,
            evaluatedByEmploymentId: entity.result.evaluatedByEmploymentId
              ? entity.result.evaluatedByEmploymentId.toString()
              : null,
            evaluatedAt: entity.result.evaluatedAt ?? null,
          },
        });
      }

      // Sync certificates
      await tx.trainingCertificate.deleteMany({ where: { enrollmentId: data.id } });
      if (entity.certificates.length > 0) {
        await tx.trainingCertificate.createMany({
          data: entity.certificates.map((c) => ({
            id: c.id.toString(),
            tenantId: c.tenantId.toString(),
            enrollmentId: data.id,
            certificateNo: c.certificateNo ?? null,
            issuedDate: c.issuedDate ?? null,
            expiryDate: c.expiryDate ?? null,
            fileId: c.fileId ? c.fileId.toString() : null,
            createdAt: c.createdAt,
          })),
        });
      }
    });
  }

  async delete(entity: TrainingEnrollment): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.trainingResult.deleteMany({ where: { enrollmentId: entity.id.toString() } });
      await tx.trainingCertificate.deleteMany({ where: { enrollmentId: entity.id.toString() } });
      await tx.trainingEnrollment.delete({ where: { id: entity.id.toString() } });
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<TrainingEnrollment | null> {
    const record = await this.prisma.trainingEnrollment.findFirst({
      where: { id: id.toString(), tenantId: tenantId.toString() },
      include: this.includeRelations,
    });
    return record ? TrainingEnrollmentPersistenceMapper.toDomain(record) : null;
  }

  async findBySessionId(
    tenantId: Identifier,
    sessionId: Identifier,
  ): Promise<TrainingEnrollment[]> {
    const records = await this.prisma.trainingEnrollment.findMany({
      where: { tenantId: tenantId.toString(), sessionId: sessionId.toString() },
      include: this.includeRelations,
      orderBy: { enrolledAt: 'desc' },
    });
    return records.map(TrainingEnrollmentPersistenceMapper.toDomain);
  }

  async findAll(tenantId: Identifier): Promise<TrainingEnrollment[]> {
    const records = await this.prisma.trainingEnrollment.findMany({
      where: { tenantId: tenantId.toString() },
      include: this.includeRelations,
      orderBy: { enrolledAt: 'desc' },
    });
    return records.map(TrainingEnrollmentPersistenceMapper.toDomain);
  }
}
