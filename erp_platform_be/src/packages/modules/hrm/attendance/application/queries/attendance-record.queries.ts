import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { BaseQueryHandler } from '@shared-kernel/application';
import * as repo from '../../domain/repositories/attendance-record.repository';
import { AttendanceRecordReadModel } from '../read-models/attendance-record.read-model';
import { AttendanceRecordReadModelMapper } from '../mappers/attendance-record.read-model.mapper';

// --- Queries ---

export class GetAttendanceRecordQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly id: Identifier,
  ) {}
}

export class ListAttendanceRecordsQuery {
  constructor(public readonly tenantId: Identifier) {}
}

export class ListAttendanceRecordsByEmploymentQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly employmentId: Identifier,
  ) {}
}

// --- Query Handlers ---

@QueryHandler(GetAttendanceRecordQuery)
export class GetAttendanceRecordHandler
  extends BaseQueryHandler
  implements IQueryHandler<GetAttendanceRecordQuery>
{
  constructor(
    @Inject(repo.ATTENDANCE_RECORD_REPOSITORY)
    private readonly repository: repo.AttendanceRecordRepository,
  ) {
    super();
  }

  async execute(query: GetAttendanceRecordQuery): Promise<AttendanceRecordReadModel> {
    const entity = this.ensureFound(
      await this.repository.findById(query.tenantId, query.id),
      'AttendanceRecord',
      query.id.toString(),
    );
    return AttendanceRecordReadModelMapper.toReadModel(entity);
  }
}

@QueryHandler(ListAttendanceRecordsQuery)
export class ListAttendanceRecordsHandler implements IQueryHandler<ListAttendanceRecordsQuery> {
  constructor(
    @Inject(repo.ATTENDANCE_RECORD_REPOSITORY)
    private readonly repository: repo.AttendanceRecordRepository,
  ) {}

  async execute(query: ListAttendanceRecordsQuery): Promise<AttendanceRecordReadModel[]> {
    const list = await this.repository.findAll(query.tenantId);
    return list.map(AttendanceRecordReadModelMapper.toReadModel);
  }
}

@QueryHandler(ListAttendanceRecordsByEmploymentQuery)
export class ListAttendanceRecordsByEmploymentHandler implements IQueryHandler<ListAttendanceRecordsByEmploymentQuery> {
  constructor(
    @Inject(repo.ATTENDANCE_RECORD_REPOSITORY)
    private readonly repository: repo.AttendanceRecordRepository,
  ) {}

  async execute(
    query: ListAttendanceRecordsByEmploymentQuery,
  ): Promise<AttendanceRecordReadModel[]> {
    const list = await this.repository.findByEmploymentId(query.tenantId, query.employmentId);
    return list.map(AttendanceRecordReadModelMapper.toReadModel);
  }
}
