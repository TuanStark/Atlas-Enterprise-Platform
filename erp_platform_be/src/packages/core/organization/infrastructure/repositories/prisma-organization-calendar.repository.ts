import { OrganizationCalendar, OrganizationCalendarRepository } from '@core/organization/domain';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { OrganizationCalendarPersistenceMapper } from '../mappers/organization-calendar.persistence.mapper';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

@Injectable()
export class PrismaOrganizationCalendarRepository implements OrganizationCalendarRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(calendar: OrganizationCalendar): Promise<void> {
    await this.prisma.organizationCalendar.create({
      data: {
        id: calendar.id.getValue(),
        ...OrganizationCalendarPersistenceMapper.toPersistence(calendar),
        createdAt: new Date(),
      },
    });
  }

  async update(calendar: OrganizationCalendar): Promise<void> {
    await this.prisma.organizationCalendar.update({
      where: { id: calendar.id.getValue() },
      data: OrganizationCalendarPersistenceMapper.toPersistence(calendar),
    });
  }

  async delete(calendar: OrganizationCalendar): Promise<void> {
    await this.prisma.organizationCalendar.delete({
      where: { id: calendar.id.getValue() },
    });
  }

  async findById(organizationId: Identifier, id: Identifier): Promise<OrganizationCalendar | null> {
    const entity = await this.prisma.organizationCalendar.findFirst({
      where: {
        id: id.getValue(),
        organizationId: organizationId.getValue(),
      },
    });
    return entity ? OrganizationCalendarPersistenceMapper.toDomain(entity) : null;
  }

  async findAll(organizationId: Identifier): Promise<OrganizationCalendar[]> {
    const entities = await this.prisma.organizationCalendar.findMany({
      where: {
        organizationId: organizationId.getValue(),
      },
      orderBy: { name: 'asc' },
    });
    return entities.map(OrganizationCalendarPersistenceMapper.toDomain);
  }
}
