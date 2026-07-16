import { Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from 'src/database/prisma.service';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class GlobalSearchQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly searchTerm: string,
  ) {}
}

export interface SearchResultDto {
  id: string;
  type: 'employee' | 'leave_request';
  title: string;
  description: string;
  url: string;
}

@QueryHandler(GlobalSearchQuery)
export class GlobalSearchHandler implements IQueryHandler<GlobalSearchQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GlobalSearchQuery): Promise<SearchResultDto[]> {
    const term = query.searchTerm.trim();
    if (!term) return [];

    const results: SearchResultDto[] = [];

    // Search employees
    const employees = await this.prisma.employee.findMany({
      where: {
        tenantId: query.tenantId.getValue(),
        OR: [
          { firstName: { contains: term, mode: 'insensitive' } },
          { lastName: { contains: term, mode: 'insensitive' } },
          { employeeNo: { contains: term, mode: 'insensitive' } },
        ],
      },
      take: 10,
    });

    for (const emp of employees) {
      results.push({
        id: emp.id,
        type: 'employee',
        title: `${emp.lastName || ''} ${emp.firstName || ''}`,
        description: `Mã NV: ${emp.employeeNo || ''} | Trạng thái: ${emp.status || ''}`,
        url: `/hrm/employees/${emp.id}`,
      });
    }

    // Search leave requests
    const leaveRequests = await this.prisma.leaveRequest.findMany({
      where: {
        tenantId: query.tenantId.getValue(),
        OR: [
          { reason: { contains: term, mode: 'insensitive' } },
        ],
      },
      include: {
        employment: {
          include: {
            employee: true,
          },
        },
      },
      take: 10,
    });

    for (const req of leaveRequests) {
      const empName = req.employment?.employee
        ? `${req.employment.employee.lastName || ''} ${req.employment.employee.firstName || ''}`
        : 'Ẩn danh';

      results.push({
        id: req.id,
        type: 'leave_request',
        title: `Đơn nghỉ phép - ${empName}`,
        description: `Lý do: ${req.reason || 'N/A'} | Số ngày: ${Number(req.totalDays || 0)} | Trạng thái: ${req.status || ''}`,
        url: '/hrm/leave-requests',
      });
    }

    return results;
  }
}
