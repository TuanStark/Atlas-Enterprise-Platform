import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Contract } from '../../domain/aggregates/contract.aggregate';
import { IContractRepository } from '../../domain/repositories/contract.repository';
import { ContractAnnex } from '../../domain/entities/contract-annex.entity';

@Injectable()
export class PrismaContractRepository implements IContractRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: Identifier, tenantId: Identifier): Promise<Contract | null> {
    const record = await this.prisma.employmentContract.findFirst({
      where: {
        id: id.toString(),
        contractType: {
          tenantId: tenantId.toString(),
        },
      },
      include: {
        contractAnnexes: true,
      },
    });

    if (!record) {
      return null;
    }

    const annexes = record.contractAnnexes.map((a) =>
      ContractAnnex.rehydrate(Identifier.create(a.id), {
        employmentContractId: Identifier.create(a.employmentContractId),
        annexNumber: a.annexNumber,
        content: a.content ?? undefined,
        effectiveDate: a.effectiveDate,
        signedDate: a.signedDate ?? undefined,
        fileId: a.fileId ?? undefined,
        createdAt: a.createdAt ?? new Date(),
        updatedAt: a.updatedAt ?? new Date(),
      }),
    );

    return Contract.rehydrate(Identifier.create(record.id), {
      employmentId: Identifier.create(record.employmentId),
      contractTypeId: Identifier.create(record.contractTypeId),
      contractNumber: record.contractNumber,
      startDate: record.startDate,
      endDate: record.endDate ?? undefined,
      signedDate: record.signedDate ?? undefined,
      fileId: record.fileId ?? undefined,
      isCurrent: record.isCurrent ?? true,
      status: record.status as any,
      baseSalary: record.baseSalary ? Number(record.baseSalary) : undefined,
      workingHours: record.workingHours ?? undefined,
      contractTemplateId: record.contractTemplateId
        ? Identifier.create(record.contractTemplateId)
        : undefined,
      createdAt: record.createdAt ?? new Date(),
      updatedAt: record.updatedAt ?? new Date(),
      annexes,
    });
  }

  async save(contract: Contract): Promise<void> {
    const data = {
      employmentId: contract.employmentId.toString(),
      contractTypeId: contract.contractTypeId.toString(),
      contractNumber: contract.contractNumber,
      startDate: contract.startDate,
      endDate: contract.endDate ?? null,
      signedDate: contract.signedDate ?? null,
      fileId: contract.fileId ?? null,
      isCurrent: contract.isCurrent,
      status: contract.status as any,
      baseSalary: contract.baseSalary ?? null,
      workingHours: contract.workingHours ?? null,
      contractTemplateId: contract.contractTemplateId?.toString() ?? null,
      updatedAt: contract.updatedAt,
    };

    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.employmentContract.findUnique({
        where: { id: contract.id.toString() },
      });

      if (existing) {
        await tx.employmentContract.update({
          where: { id: contract.id.toString() },
          data,
        });
      } else {
        await tx.employmentContract.create({
          data: {
            id: contract.id.toString(),
            createdAt: contract.createdAt,
            ...data,
          },
        });
      }

      // Sync annexes
      await tx.contractAnnex.deleteMany({
        where: { employmentContractId: contract.id.toString() },
      });

      if (contract.annexes.length > 0) {
        await tx.contractAnnex.createMany({
          data: contract.annexes.map((a) => ({
            id: a.id.toString(),
            employmentContractId: contract.id.toString(),
            annexNumber: a.annexNumber,
            content: a.content ?? null,
            effectiveDate: a.effectiveDate,
            signedDate: a.signedDate ?? null,
            fileId: a.fileId ?? null,
            createdAt: a.createdAt,
            updatedAt: a.updatedAt,
          })),
        });
      }
    });
  }
}
