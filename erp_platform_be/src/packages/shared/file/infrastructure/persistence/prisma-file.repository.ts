import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { FileRepository, FileCreateInput } from '../../domain/repositories/file.repository';
import { FileVisibility } from '@prisma/client';

@Injectable()
export class PrismaFileRepository implements FileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: FileCreateInput): Promise<any> {
    const visibilityMap: Record<string, FileVisibility> = {
      public: FileVisibility.public,
      private: FileVisibility.private,
      restricted: FileVisibility.internal,
    };

    const file = await this.prisma.file.create({
      data: {
        id: undefined,
        tenantId: input.tenantId,
        code: input.code || undefined,
        fileName: input.fileName,
        mimeType: input.mimeType,
        extension: input.extension,
        visibility: visibilityMap[input.visibility] || FileVisibility.internal,
        size: BigInt(input.size),
        checksum: input.checksum || undefined,
        metadata: input.metadata || undefined,
        createdByPrincipalId: input.createdByPrincipalId || undefined,
      },
    });

    return {
      ...file,
      size: Number(file.size),
    };
  }

  async delete(id: Identifier): Promise<void> {
    await this.prisma.file.delete({
      where: { id: id.getValue() },
    });
  }

  async findById(id: Identifier): Promise<any | null> {
    const file = await this.prisma.file.findUnique({
      where: { id: id.getValue() },
      include: {
        createdByPrincipal: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!file) return null;

    return {
      ...file,
      size: Number(file.size), // Map BigInt to number for JSON safety
    };
  }

  async listAll(tenantId: Identifier): Promise<any[]> {
    const files = await this.prisma.file.findMany({
      where: { tenantId: tenantId.getValue() },
      include: {
        createdByPrincipal: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return files.map((file) => ({
      ...file,
      size: Number(file.size), // Map BigInt to number
    }));
  }
}
