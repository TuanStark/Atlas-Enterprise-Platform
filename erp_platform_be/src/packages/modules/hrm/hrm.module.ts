import { Module } from '@nestjs/common';
import { EmployeeModule } from './employee/employee.module';
import { MasterDataModule } from './master-data/master-data.module';
import { EmploymentModule } from './employment/employment.module';

@Module({
  imports: [EmployeeModule, MasterDataModule, EmploymentModule],
  exports: [EmployeeModule, MasterDataModule, EmploymentModule],
})
export class HrmModule {}
