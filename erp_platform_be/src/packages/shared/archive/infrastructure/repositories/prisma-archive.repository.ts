import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { IArchiveRepository } from '../../domain/repositories/archive.repository';

@Injectable()
export class PrismaArchiveRepository implements IArchiveRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create(data: {
    tenantId: string;
    sourceModule: string;
    sourceEntity: string;
    sourceRecordId: string;
    displayLabel: string;
    snapshotData?: any;
    archivedBy: string;
    reason?: string;
  }): Promise<string> {
    const record = await this.prisma.archiveRecord.create({
      data: {
        tenantId: data.tenantId,
        sourceModule: data.sourceModule,
        sourceEntity: data.sourceEntity,
        sourceRecordId: data.sourceRecordId,
        displayLabel: data.displayLabel,
        snapshotData: data.snapshotData ?? undefined,
        archivedBy: data.archivedBy,
        reason: data.reason,
      },
    });
    return record.id;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.prisma.archiveRecord.deleteMany({
      where: { id, tenantId },
    });
  }

  async findById(id: string, tenantId: string): Promise<any | null> {
    return this.prisma.archiveRecord.findFirst({
      where: { id, tenantId },
      include: {
        principal: {
          select: { displayName: true },
        },
      },
    });
  }

  async findAll(
    tenantId: string,
    params: {
      page?: number;
      pageSize?: number;
      sourceModule?: string;
      sourceEntity?: string;
    },
  ): Promise<{ data: any[]; total: number }> {
    const page = params.page || 1;
    const pageSize = params.pageSize || 15;
    const skip = (page - 1) * pageSize;

    const where: any = { tenantId };

    if (params.sourceModule) {
      where.sourceModule = params.sourceModule;
    }
    if (params.sourceEntity) {
      where.sourceEntity = params.sourceEntity;
    }

    const [data, total] = await Promise.all([
      this.prisma.archiveRecord.findMany({
        where,
        include: {
          principal: {
            select: { displayName: true },
          },
        },
        orderBy: { archivedAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.archiveRecord.count({ where }),
    ]);

    return { data, total };
  }

  async existsBySource(
    tenantId: string,
    sourceModule: string,
    sourceEntity: string,
    sourceRecordId: string,
  ): Promise<boolean> {
    const count = await this.prisma.archiveRecord.count({
      where: { tenantId, sourceModule, sourceEntity, sourceRecordId },
    });
    return count > 0;
  }

  async findArchivedRecordIds(
    tenantId: string,
    sourceModule: string,
    sourceEntity: string,
  ): Promise<string[]> {
    const records = await this.prisma.archiveRecord.findMany({
      where: { tenantId, sourceModule, sourceEntity },
      select: { sourceRecordId: true },
    });
    return records.map((r) => r.sourceRecordId);
  }
}
