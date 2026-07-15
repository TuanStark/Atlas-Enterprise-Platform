import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { JobApplication } from '../../domain/aggregates/job-application.aggregate';
import { JobApplicationRepository } from '../../domain/repositories/job-application.repository';
import { JobApplicationPersistenceMapper } from '../mappers/job-application.persistence.mapper';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaJobApplicationRepository implements JobApplicationRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly includeRelations = {
    applicationInterviews: true,
    applicationJobOffers: true,
    applicationHiringRecords: true,
  };

  async save(entity: JobApplication): Promise<void> {
    const data = JobApplicationPersistenceMapper.toPersistence(entity);

    await this.prisma.jobApplication.create({
      data: {
        ...data,
        applicationInterviews: {
          create: entity.interviews.map((i) => ({
            id: i.id.toString(),
            interviewerEmploymentId: i.interviewerEmploymentId
              ? i.interviewerEmploymentId.toString()
              : null,
            scheduledAt: i.scheduledAt,
            location: i.location,
            meetingUrl: i.meetingUrl,
            result: i.result,
            status: i.status,
          })),
        },
        applicationJobOffers: {
          create: entity.jobOffers.map((jo) => ({
            id: jo.id.toString(),
            offeredSalary:
              jo.offeredSalary !== undefined ? new Prisma.Decimal(jo.offeredSalary) : null,
            currency: jo.currency,
            startDate: jo.startDate,
            status: jo.status,
            offerFileId: jo.offerFileId ? jo.offerFileId.toString() : null,
            createdAt: jo.createdAt,
          })),
        },
        applicationHiringRecords: {
          create: entity.hiringRecords.map((hr) => ({
            id: hr.id.toString(),
            employeeId: hr.employeeId ? hr.employeeId.toString() : null,
            employmentId: hr.employmentId ? hr.employmentId.toString() : null,
            hiredAt: hr.hiredAt,
          })),
        },
      },
    });
  }

  async update(entity: JobApplication): Promise<void> {
    const data = JobApplicationPersistenceMapper.toPersistence(entity);

    await this.prisma.$transaction(async (tx) => {
      await tx.jobApplication.update({
        where: { id: data.id },
        data: {
          status: data.status,
          currentStage: data.currentStage,
        },
      });

      // Sync interviews
      await tx.interview.deleteMany({ where: { applicationId: data.id } });
      if (entity.interviews.length > 0) {
        await tx.interview.createMany({
          data: entity.interviews.map((i) => ({
            id: i.id.toString(),
            applicationId: data.id,
            interviewerEmploymentId: i.interviewerEmploymentId
              ? i.interviewerEmploymentId.toString()
              : null,
            scheduledAt: i.scheduledAt ?? null,
            location: i.location ?? null,
            meetingUrl: i.meetingUrl ?? null,
            result: i.result ?? null,
            status: i.status,
          })),
        });
      }

      // Sync job offers
      await tx.jobOffer.deleteMany({ where: { applicationId: data.id } });
      if (entity.jobOffers.length > 0) {
        await tx.jobOffer.createMany({
          data: entity.jobOffers.map((jo) => ({
            id: jo.id.toString(),
            applicationId: data.id,
            offeredSalary:
              jo.offeredSalary !== undefined ? new Prisma.Decimal(jo.offeredSalary) : null,
            currency: jo.currency ?? null,
            startDate: jo.startDate ?? null,
            status: jo.status,
            offerFileId: jo.offerFileId ? jo.offerFileId.toString() : null,
            createdAt: jo.createdAt,
          })),
        });
      }

      // Sync hiring records
      await tx.hiringRecord.deleteMany({ where: { applicationId: data.id } });
      if (entity.hiringRecords.length > 0) {
        await tx.hiringRecord.createMany({
          data: entity.hiringRecords.map((hr) => ({
            id: hr.id.toString(),
            applicationId: data.id,
            employeeId: hr.employeeId ? hr.employeeId.toString() : null,
            employmentId: hr.employmentId ? hr.employmentId.toString() : null,
            hiredAt: hr.hiredAt,
          })),
        });
      }
    });
  }

  async delete(entity: JobApplication): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.interview.deleteMany({ where: { applicationId: entity.id.toString() } });
      await tx.jobOffer.deleteMany({ where: { applicationId: entity.id.toString() } });
      await tx.hiringRecord.deleteMany({ where: { applicationId: entity.id.toString() } });
      await tx.jobApplication.delete({ where: { id: entity.id.toString() } });
    });
  }

  async findById(tenantId: Identifier, id: Identifier): Promise<JobApplication | null> {
    const record = await this.prisma.jobApplication.findFirst({
      where: { id: id.toString(), tenantId: tenantId.toString() },
      include: this.includeRelations,
    });
    return record ? JobApplicationPersistenceMapper.toDomain(record) : null;
  }

  async findAll(tenantId: Identifier): Promise<JobApplication[]> {
    const records = await this.prisma.jobApplication.findMany({
      where: { tenantId: tenantId.toString() },
      include: this.includeRelations,
      orderBy: { appliedAt: 'desc' },
    });
    return records.map(JobApplicationPersistenceMapper.toDomain);
  }
}
