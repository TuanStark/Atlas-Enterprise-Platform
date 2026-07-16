import { Tag } from 'antd';
import type { ReactNode } from 'react';

/**
 * StatusBadge — Unified status display component
 *
 * Maps to backend enum types (EmploymentStatus, LeaveRequestStatus, PayrollStatus, etc.)
 * Provides consistent status rendering across all pages.
 *
 * Usage:
 *   <StatusBadge status="active" type="employment" />
 *   <StatusBadge status="pending" type="leave" />
 */

// Status configurations by domain type
const STATUS_CONFIGS: Record<string, Record<string, { color: string; label: string; icon?: ReactNode }>> = {
  employment: {
    probation: { color: 'orange', label: 'Thử việc' },
    active: { color: 'green', label: 'Đang làm' },
    suspended: { color: 'red', label: 'Tạm ngưng' },
    resigned: { color: 'default', label: 'Nghỉ việc' },
    terminated: { color: 'red', label: 'Sa thải' },
    retired: { color: 'purple', label: 'Nghỉ hưu' },
  },
  leave: {
    draft: { color: 'default', label: 'Nháp' },
    pending: { color: 'orange', label: 'Chờ duyệt' },
    approved: { color: 'green', label: 'Đã duyệt' },
    rejected: { color: 'red', label: 'Từ chối' },
    cancelled: { color: 'default', label: 'Đã hủy' },
  },
  attendance: {
    present: { color: 'green', label: 'Có mặt' },
    absent: { color: 'red', label: 'Vắng' },
    late: { color: 'orange', label: 'Đi muộn' },
    early_leave: { color: 'gold', label: 'Về sớm' },
    overtime: { color: 'blue', label: 'Tăng ca' },
    holiday: { color: 'purple', label: 'Nghỉ lễ' },
  },
  payroll: {
    draft: { color: 'default', label: 'Nháp' },
    calculating: { color: 'processing', label: 'Đang tính' },
    calculated: { color: 'blue', label: 'Đã tính' },
    approved: { color: 'green', label: 'Đã duyệt' },
    paid: { color: 'cyan', label: 'Đã chi' },
    cancelled: { color: 'default', label: 'Đã hủy' },
  },
  workflow: {
    draft: { color: 'default', label: 'Nháp' },
    active: { color: 'green', label: 'Hoạt động' },
    inactive: { color: 'default', label: 'Tạm dừng' },
  },
  workflowTask: {
    pending: { color: 'orange', label: 'Chờ xử lý' },
    approved: { color: 'green', label: 'Đã duyệt' },
    rejected: { color: 'red', label: 'Từ chối' },
    skipped: { color: 'default', label: 'Bỏ qua' },
  },
  recruitment: {
    applied: { color: 'blue', label: 'Đã ứng tuyển' },
    screening: { color: 'cyan', label: 'Sàng lọc' },
    interviewing: { color: 'orange', label: 'Phỏng vấn' },
    offered: { color: 'purple', label: 'Đã gửi offer' },
    hired: { color: 'green', label: 'Đã tuyển' },
    rejected: { color: 'red', label: 'Từ chối' },
    withdrawn: { color: 'default', label: 'Đã rút' },
  },
  training: {
    planned: { color: 'blue', label: 'Lên kế hoạch' },
    ongoing: { color: 'orange', label: 'Đang diễn ra' },
    completed: { color: 'green', label: 'Hoàn thành' },
    cancelled: { color: 'default', label: 'Đã hủy' },
  },
  generic: {
    active: { color: 'green', label: 'Hoạt động' },
    inactive: { color: 'default', label: 'Không hoạt động' },
    pending: { color: 'orange', label: 'Chờ xử lý' },
  },
};

interface StatusBadgeProps {
  status: string;
  type?: keyof typeof STATUS_CONFIGS;
  customLabel?: string;
}

export function StatusBadge({ status, type = 'generic', customLabel }: StatusBadgeProps) {
  const config = STATUS_CONFIGS[type]?.[status] ?? {
    color: 'default',
    label: customLabel ?? status,
  };

  return (
    <Tag color={config.color} style={{ margin: 0 }}>
      {customLabel ?? config.label}
    </Tag>
  );
}
