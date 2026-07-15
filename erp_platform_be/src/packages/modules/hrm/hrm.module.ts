import { Module } from '@nestjs/common';
import { EmployeeModule } from './employee/employee.module';
import { MasterDataModule } from './master-data/master-data.module';
import { EmploymentModule } from './employment/employment.module';
import { AttendanceModule } from './attendance/attendance.module';
import { LeaveModule } from './leave/leave.module';

@Module({
  imports: [EmployeeModule, MasterDataModule, EmploymentModule, AttendanceModule, LeaveModule],
  exports: [EmployeeModule, MasterDataModule, EmploymentModule, AttendanceModule, LeaveModule],
})
export class HrmModule {}


