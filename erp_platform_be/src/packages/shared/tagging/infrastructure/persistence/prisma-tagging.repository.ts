import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import {
  TaggingRepository,
  TagCreateInput,
  TagAssignInput,
} from '../../domain/repositories/tagging.repository';

@Injectable()
export class PrismaTaggingRepository implements TaggingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createTag(input: TagCreateInput): Promise<any> {
    return this.prisma.tag.create({
      data: {
        id: undefined,
        tenantId: input.tenantId,
        code: input.code,
        name: input.name,
        color: input.color || undefined,
        description: input.description || undefined,
        createdByPrincipalId: input.createdByPrincipalId || undefined,
      },
    });
  }

  async deleteTag(id: Identifier): Promise<void> {
    // Delete assignments first
    await this.prisma.tagAssignment.deleteMany({
      where: { tagId: id.getValue() },
    });
    // Delete tag
    await this.prisma.tag.delete({
      where: { id: id.getValue() },
    });
  }

  async listTags(tenantId: Identifier): Promise<any[]> {
    return this.prisma.tag.findMany({
      where: { tenantId: tenantId.getValue() },
      orderBy: { code: 'asc' },
    });
  }

  async assignTag(input: TagAssignInput): Promise<any> {
    return this.prisma.tagAssignment.upsert({
      where: {
        tagId_targetModule_targetEntity_targetRecordId: {
          tagId: input.tagId,
          targetModule: input.targetModule,
          targetEntity: input.targetEntity,
          targetRecordId: input.targetRecordId,
        },
      },
      update: {},
      create: {
        tagId: input.tagId,
        targetModule: input.targetModule,
        targetEntity: input.targetEntity,
        targetRecordId: input.targetRecordId,
        assignedByPrincipalId: input.assignedByPrincipalId || undefined,
        assignedAt: new Date(),
      },
    });
  }

  async removeAssignment(tagId: Identifier, targetRecordId: Identifier): Promise<void> {
    await this.prisma.tagAssignment.deleteMany({
      where: {
        tagId: tagId.getValue(),
        targetRecordId: targetRecordId.getValue(),
      },
    });
  }

  async findAssignmentsForRecord(
    targetModule: string,
    targetEntity: string,
    targetRecordId: Identifier,
  ): Promise<any[]> {
    return this.prisma.tagAssignment.findMany({
      where: {
        targetModule,
        targetEntity,
        targetRecordId: targetRecordId.getValue(),
      },
      include: {
        tag: true,
      },
    });
  }
}
