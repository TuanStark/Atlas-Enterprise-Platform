import { Module } from '@nestjs/common';
import { EmployeeModule } from './employee/employee.module';
import { MasterDataModule } from './master-data/master-data.module';
import { EmploymentModule } from './employment/employment.module';
import { AttendanceModule } from './attendance/attendance.module';
import { LeaveModule } from './leave/leave.module';
import { RecruitmentModule } from './recruitment/recruitment.module';
import { PayrollModule } from './payroll/payroll.module';
import { PerformanceModule } from './performance/performance.module';
import { TrainingModule } from './training/training.module';

@Module({
  imports: [
    EmployeeModule,
    MasterDataModule,
    EmploymentModule,
    AttendanceModule,
    LeaveModule,
    RecruitmentModule,
    PayrollModule,
    PerformanceModule,
    TrainingModule,
  ],
  exports: [
    EmployeeModule,
    MasterDataModule,
    EmploymentModule,
    AttendanceModule,
    LeaveModule,
    RecruitmentModule,
    PayrollModule,
    PerformanceModule,
    TrainingModule,
  ],
})
export class HrmModule {}
