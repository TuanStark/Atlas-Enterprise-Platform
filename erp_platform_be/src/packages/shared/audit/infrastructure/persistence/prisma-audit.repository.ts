import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { AuditRepository, AuditLogCreateInput } from '../../domain/repositories/audit.repository';
import { AuditAction } from '@prisma/client';

@Injectable()
export class PrismaAuditRepository implements AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: AuditLogCreateInput): Promise<void> {
    const { details, ...logData } = input;

    await this.prisma.auditLog.create({
      data: {
        id: undefined, // db generated UUID
        tenantId: logData.tenantId,
        targetModule: logData.targetModule,
        targetEntity: logData.targetEntity,
        targetRecordId: logData.targetRecordId,
        action: logData.action,
        actorPrincipalId: logData.actorPrincipalId,
        ipAddress: logData.ipAddress,
        userAgent: logData.userAgent,
        requestId: logData.requestId,
        metadata: logData.metadata || undefined,
        auditLogAuditDetails:
          details && details.length > 0
            ? {
                create: details.map((d) => ({
                  fieldName: d.fieldName,
                  oldValue: d.oldValue,
                  newValue: d.newValue,
                })),
              }
            : undefined,
      },
    });
  }

  async findById(id: Identifier): Promise<any | null> {
    return this.prisma.auditLog.findUnique({
      where: { id: id.getValue() },
      include: {
        auditLogAuditDetails: true,
        actorPrincipal: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findAll(tenantId: Identifier): Promise<any[]> {
    return this.prisma.auditLog.findMany({
      where: { tenantId: tenantId.getValue() },
      include: {
        auditLogAuditDetails: true,
        actorPrincipal: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
