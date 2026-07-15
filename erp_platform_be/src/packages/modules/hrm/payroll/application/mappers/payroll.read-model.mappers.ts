import { SalaryComponent } from '../../domain/aggregates/salary-component.aggregate';
import { SalaryStructure } from '../../domain/aggregates/salary-structure.aggregate';
import { EmployeeSalaryAssignment } from '../../domain/aggregates/employee-salary-assignment.aggregate';
import { PayrollPeriod } from '../../domain/aggregates/payroll-period.aggregate';
import { Payroll } from '../../domain/aggregates/payroll.aggregate';
import {
  SalaryComponentReadModel,
  SalaryStructureReadModel,
  EmployeeSalaryAssignmentReadModel,
  PayrollPeriodReadModel,
  PayrollReadModel,
} from '../read-models/payroll.read-models';

export class PayrollReadModelMappers {
  static toSalaryComponentReadModel(entity: SalaryComponent): SalaryComponentReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      code: entity.code,
      name: entity.name,
      componentType: entity.componentType,
      calculationType: entity.calculationType,
      defaultAmount: entity.defaultAmount,
      taxable: entity.taxable,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toSalaryStructureReadModel(entity: SalaryStructure): SalaryStructureReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      code: entity.code,
      name: entity.name,
      description: entity.description,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toEmployeeSalaryAssignmentReadModel(
    entity: EmployeeSalaryAssignment,
  ): EmployeeSalaryAssignmentReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      employmentId: entity.employmentId.toString(),
      salaryStructureId: entity.salaryStructureId.toString(),
      effectiveFrom: entity.effectiveFrom,
      effectiveTo: entity.effectiveTo,
      baseSalary: entity.baseSalary,
      currency: entity.currency,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toPayrollPeriodReadModel(entity: PayrollPeriod): PayrollPeriodReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      code: entity.code,
      startDate: entity.startDate,
      endDate: entity.endDate,
      paymentDate: entity.paymentDate,
      status: entity.status,
      createdAt: entity.createdAt,
    };
  }

  static toPayrollReadModel(entity: Payroll): PayrollReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      payrollPeriodId: entity.payrollPeriodId.toString(),
      employmentId: entity.employmentId.toString(),
      grossSalary: entity.grossSalary,
      totalAllowance: entity.totalAllowance,
      totalDeduction: entity.totalDeduction,
      netSalary: entity.netSalary,
      status: entity.status,
      payslipFileId: entity.payslipFileId ? entity.payslipFileId.toString() : undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      payrollItems: entity.payrollItems.map((pi) => ({
        id: pi.id.toString(),
        payrollId: pi.payrollId.toString(),
        salaryComponentId: pi.salaryComponentId.toString(),
        amount: pi.amount,
        remark: pi.remark,
      })),
    };
  }
}
