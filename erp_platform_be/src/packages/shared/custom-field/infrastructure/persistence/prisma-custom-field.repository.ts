import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { CustomFieldRepository, CustomFieldDefinitionCreateInput, CustomFieldValueSaveInput } from '../../domain/repositories/custom-field.repository';
import { CustomFieldType } from '@prisma/client';

@Injectable()
export class PrismaCustomFieldRepository implements CustomFieldRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createDefinition(input: CustomFieldDefinitionCreateInput): Promise<any> {
    const { options, ...defData } = input;

    return this.prisma.customFieldDefinition.create({
      data: {
        id: undefined,
        tenantId: defData.tenantId,
        targetModule: defData.targetModule,
        targetEntity: defData.targetEntity,
        code: defData.code,
        name: defData.name,
        fieldType: defData.fieldType as CustomFieldType,
        isRequired: defData.isRequired || false,
        defaultValue: defData.defaultValue || null,
        validationRules: defData.validationRules || undefined,
        displayOrder: defData.displayOrder || null,
        metadata: defData.metadata || undefined,
        createdByPrincipalId: defData.createdByPrincipalId || undefined,
        customFieldDefinitionCustomFieldOptions: options && options.length > 0
          ? {
              create: options.map((opt) => ({
                value: opt.value,
                label: opt.label,
                sortOrder: opt.sortOrder || null,
                isActive: true,
              })),
            }
          : undefined,
      },
      include: {
        customFieldDefinitionCustomFieldOptions: true,
      },
    });
  }

  async deleteDefinition(id: Identifier): Promise<void> {
    // Delete values first
    await this.prisma.customFieldValue.deleteMany({
      where: { customFieldDefinitionId: id.getValue() },
    });
    // Delete options first
    await this.prisma.customFieldOption.deleteMany({
      where: { customFieldDefinitionId: id.getValue() },
    });
    // Delete definition
    await this.prisma.customFieldDefinition.delete({
      where: { id: id.getValue() },
    });
  }

  async findDefinitionsForEntity(
    tenantId: Identifier,
    targetModule: string,
    targetEntity: string,
  ): Promise<any[]> {
    return this.prisma.customFieldDefinition.findMany({
      where: {
        tenantId: tenantId.getValue(),
        targetModule,
        targetEntity,
      },
      include: {
        customFieldDefinitionCustomFieldOptions: true,
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async saveValues(values: CustomFieldValueSaveInput[]): Promise<void> {
    for (const val of values) {
      await this.prisma.customFieldValue.upsert({
        where: {
          customFieldDefinitionId_targetRecordId: {
            customFieldDefinitionId: val.customFieldDefinitionId,
            targetRecordId: val.targetRecordId,
          },
        },
        update: {
          value: val.value,
          updatedAt: new Date(),
        },
        create: {
          customFieldDefinitionId: val.customFieldDefinitionId,
          targetRecordId: val.targetRecordId,
          value: val.value,
        },
      });
    }
  }

  async findValuesForRecord(targetRecordId: Identifier): Promise<any[]> {
    return this.prisma.customFieldValue.findMany({
      where: { targetRecordId: targetRecordId.getValue() },
      include: {
        customFieldDefinition: true,
      },
    });
  }
}
