import { PERMISSIONS } from '@shared/constants/permissions';

export interface PermissionRegistryEntry {
  code: string;
  module: string;
  resource: string;
  action: string;
  description: string;
  affectedUI: string[];
}

export const PERMISSION_REGISTRY: PermissionRegistryEntry[] = [
  // ─── HRM · Employee ─────────────────────────────────────────────
  {
    code: PERMISSIONS.HRM.EMPLOYEE.READ,
    module: 'Quản lý nhân sự',
    resource: 'Nhân viên',
    action: 'Xem',
    description: 'Cho phép xem danh sách và chi tiết nhân viên',
    affectedUI: [
      'Menu "Danh sách nhân viên"',
      'Trang danh sách nhân viên',
      'Trang chi tiết nhân viên',
    ],
  },
  {
    code: PERMISSIONS.HRM.EMPLOYEE.CREATE,
    module: 'Quản lý nhân sự',
    resource: 'Nhân viên',
    action: 'Tạo mới',
    description: 'Cho phép tạo hồ sơ nhân viên mới',
    affectedUI: [
      'Nút "Thêm nhân viên" trên trang danh sách',
      'Trang form tạo nhân viên',
    ],
  },
  {
    code: PERMISSIONS.HRM.EMPLOYEE.UPDATE,
    module: 'Quản lý nhân sự',
    resource: 'Nhân viên',
    action: 'Cập nhật',
    description: 'Cho phép chỉnh sửa hồ sơ nhân viên',
    affectedUI: [
      'Nút "Chỉnh sửa" trên trang chi tiết',
      'Menu "Chỉnh sửa" trong danh sách',
      'Trang form cập nhật nhân viên',
    ],
  },
  {
    code: PERMISSIONS.HRM.EMPLOYEE.DELETE,
    module: 'Quản lý nhân sự',
    resource: 'Nhân viên',
    action: 'Xóa',
    description: 'Cho phép xóa hồ sơ nhân viên khỏi hệ thống',
    affectedUI: ['Menu "Xóa" trong danh sách nhân viên'],
  },
  {
    code: PERMISSIONS.HRM.EMPLOYEE.EXPORT,
    module: 'Quản lý nhân sự',
    resource: 'Nhân viên',
    action: 'Xuất dữ liệu',
    description: 'Cho phép xuất danh sách nhân viên ra file Excel',
    affectedUI: ['Nút "Xuất Excel" trên trang danh sách'],
  },

  // ─── HRM · Leave ────────────────────────────────────────────────
  {
    code: PERMISSIONS.HRM.LEAVE.READ,
    module: 'Quản lý nhân sự',
    resource: 'Nghỉ phép',
    action: 'Xem',
    description: 'Cho phép xem danh sách đơn nghỉ phép',
    affectedUI: [
      'Menu "Yêu cầu nghỉ phép"',
      'Trang danh sách đơn nghỉ phép',
    ],
  },
  {
    code: PERMISSIONS.HRM.LEAVE.CREATE,
    module: 'Quản lý nhân sự',
    resource: 'Nghỉ phép',
    action: 'Tạo đơn',
    description: 'Cho phép tạo đơn nghỉ phép mới',
    affectedUI: [
      'Nút "Tạo đơn nghỉ phép" trên trang danh sách',
      'Trang form tạo đơn nghỉ phép',
    ],
  },
  {
    code: PERMISSIONS.HRM.LEAVE.APPROVE,
    module: 'Quản lý nhân sự',
    resource: 'Nghỉ phép',
    action: 'Phê duyệt',
    description: 'Cho phép phê duyệt đơn nghỉ phép',
    affectedUI: ['Nút "Duyệt" trong danh sách đơn nghỉ phép'],
  },
  {
    code: PERMISSIONS.HRM.LEAVE.REJECT,
    module: 'Quản lý nhân sự',
    resource: 'Nghỉ phép',
    action: 'Từ chối',
    description: 'Cho phép từ chối đơn nghỉ phép',
    affectedUI: ['Nút "Từ chối" trong danh sách đơn nghỉ phép'],
  },

  // ─── HRM · Attendance ───────────────────────────────────────────
  {
    code: PERMISSIONS.HRM.ATTENDANCE.READ,
    module: 'Quản lý nhân sự',
    resource: 'Chấm công',
    action: 'Xem',
    description: 'Cho phép xem dữ liệu chấm công',
    affectedUI: [
      'Menu "Chấm công"',
      'Trang lịch sử chấm công',
    ],
  },
  {
    code: PERMISSIONS.HRM.ATTENDANCE.CREATE,
    module: 'Quản lý nhân sự',
    resource: 'Chấm công',
    action: 'Tạo mới',
    description: 'Cho phép tạo bản ghi chấm công',
    affectedUI: ['Nút "Check-in / Check-out"'],
  },
  {
    code: PERMISSIONS.HRM.ATTENDANCE.UPDATE,
    module: 'Quản lý nhân sự',
    resource: 'Chấm công',
    action: 'Cập nhật',
    description: 'Cho phép chỉnh sửa dữ liệu chấm công',
    affectedUI: ['Nút "Chỉnh sửa" trên bản ghi chấm công'],
  },

  // ─── HRM · Shift ────────────────────────────────────────────────
  {
    code: PERMISSIONS.HRM.SHIFT.READ,
    module: 'Quản lý nhân sự',
    resource: 'Ca làm việc',
    action: 'Xem',
    description: 'Cho phép xem danh sách ca làm việc',
    affectedUI: [
      'Menu "Ca làm việc"',
      'Trang quản lý ca làm',
    ],
  },
  {
    code: PERMISSIONS.HRM.SHIFT.CREATE,
    module: 'Quản lý nhân sự',
    resource: 'Ca làm việc',
    action: 'Tạo mới',
    description: 'Cho phép tạo ca làm việc mới',
    affectedUI: ['Nút "Thêm ca làm" trên trang danh sách'],
  },
  {
    code: PERMISSIONS.HRM.SHIFT.UPDATE,
    module: 'Quản lý nhân sự',
    resource: 'Ca làm việc',
    action: 'Cập nhật',
    description: 'Cho phép chỉnh sửa ca làm việc',
    affectedUI: ['Nút "Sửa" trong cột thao tác'],
  },
  {
    code: PERMISSIONS.HRM.SHIFT.DELETE,
    module: 'Quản lý nhân sự',
    resource: 'Ca làm việc',
    action: 'Xóa',
    description: 'Cho phép xóa ca làm việc',
    affectedUI: ['Nút "Xóa" trong cột thao tác'],
  },

  // ─── HRM · Payroll ──────────────────────────────────────────────
  {
    code: PERMISSIONS.HRM.PAYROLL.READ,
    module: 'Quản lý nhân sự',
    resource: 'Bảng lương',
    action: 'Xem',
    description: 'Cho phép xem bảng lương',
    affectedUI: [
      'Menu "Bảng lương"',
      'Trang bảng lương',
    ],
  },
  {
    code: PERMISSIONS.HRM.PAYROLL.CREATE,
    module: 'Quản lý nhân sự',
    resource: 'Bảng lương',
    action: 'Tạo mới',
    description: 'Cho phép tạo kỳ tính lương',
    affectedUI: ['Nút "Tạo kỳ lương mới"'],
  },
  {
    code: PERMISSIONS.HRM.PAYROLL.EXPORT,
    module: 'Quản lý nhân sự',
    resource: 'Bảng lương',
    action: 'Xuất dữ liệu',
    description: 'Cho phép xuất bảng lương ra Excel',
    affectedUI: ['Nút "Xuất Excel" trên trang bảng lương'],
  },

  // ─── HRM · Recruitment ──────────────────────────────────────────
  {
    code: PERMISSIONS.HRM.RECRUITMENT.READ,
    module: 'Quản lý nhân sự',
    resource: 'Tuyển dụng',
    action: 'Xem',
    description: 'Cho phép xem thông tin tuyển dụng',
    affectedUI: [
      'Menu "Tuyển dụng"',
      'Trang danh sách tuyển dụng',
    ],
  },
  {
    code: PERMISSIONS.HRM.RECRUITMENT.CREATE,
    module: 'Quản lý nhân sự',
    resource: 'Tuyển dụng',
    action: 'Tạo mới',
    description: 'Cho phép tạo tin tuyển dụng mới',
    affectedUI: ['Nút "Tạo tin tuyển dụng"'],
  },
  {
    code: PERMISSIONS.HRM.RECRUITMENT.UPDATE,
    module: 'Quản lý nhân sự',
    resource: 'Tuyển dụng',
    action: 'Cập nhật',
    description: 'Cho phép cập nhật tin tuyển dụng',
    affectedUI: ['Nút "Chỉnh sửa" trong trang tuyển dụng'],
  },

  // ─── HRM · Performance ──────────────────────────────────────────
  {
    code: PERMISSIONS.HRM.PERFORMANCE.READ,
    module: 'Quản lý nhân sự',
    resource: 'Đánh giá',
    action: 'Xem',
    description: 'Cho phép xem đánh giá hiệu suất',
    affectedUI: [
      'Menu "Đánh giá hiệu suất"',
      'Trang đánh giá hiệu suất',
    ],
  },
  {
    code: PERMISSIONS.HRM.PERFORMANCE.CREATE,
    module: 'Quản lý nhân sự',
    resource: 'Đánh giá',
    action: 'Tạo mới',
    description: 'Cho phép tạo kỳ đánh giá mới',
    affectedUI: ['Nút "Tạo kỳ đánh giá"'],
  },
  {
    code: PERMISSIONS.HRM.PERFORMANCE.UPDATE,
    module: 'Quản lý nhân sự',
    resource: 'Đánh giá',
    action: 'Cập nhật',
    description: 'Cho phép cập nhật đánh giá hiệu suất',
    affectedUI: ['Nút "Cập nhật" trong trang đánh giá'],
  },

  // ─── Organization · Structure ───────────────────────────────────
  {
    code: PERMISSIONS.ORGANIZATION.STRUCTURE.READ,
    module: 'Tổ chức',
    resource: 'Cơ cấu tổ chức',
    action: 'Xem',
    description: 'Cho phép xem cơ cấu tổ chức',
    affectedUI: [
      'Menu "Cơ cấu tổ chức"',
      'Trang sơ đồ tổ chức',
    ],
  },
  {
    code: PERMISSIONS.ORGANIZATION.STRUCTURE.CREATE,
    module: 'Tổ chức',
    resource: 'Cơ cấu tổ chức',
    action: 'Tạo mới',
    description: 'Cho phép tạo đơn vị tổ chức mới',
    affectedUI: ['Nút "Thêm đơn vị"'],
  },
  {
    code: PERMISSIONS.ORGANIZATION.STRUCTURE.UPDATE,
    module: 'Tổ chức',
    resource: 'Cơ cấu tổ chức',
    action: 'Cập nhật',
    description: 'Cho phép chỉnh sửa cơ cấu tổ chức',
    affectedUI: ['Nút "Sửa" trong cột thao tác'],
  },
  {
    code: PERMISSIONS.ORGANIZATION.STRUCTURE.DELETE,
    module: 'Tổ chức',
    resource: 'Cơ cấu tổ chức',
    action: 'Xóa',
    description: 'Cho phép xóa đơn vị tổ chức',
    affectedUI: ['Nút "Xóa" trong cột thao tác'],
  },

  // ─── Organization · Position ────────────────────────────────────
  {
    code: PERMISSIONS.ORGANIZATION.POSITION.READ,
    module: 'Tổ chức',
    resource: 'Vị trí công việc',
    action: 'Xem',
    description: 'Cho phép xem danh mục vị trí công việc',
    affectedUI: [
      'Menu "Danh mục vị trí"',
      'Trang danh sách vị trí công việc',
    ],
  },
  {
    code: PERMISSIONS.ORGANIZATION.POSITION.CREATE,
    module: 'Tổ chức',
    resource: 'Vị trí công việc',
    action: 'Tạo mới',
    description: 'Cho phép thêm vị trí công việc mới',
    affectedUI: ['Nút "Thêm vị trí" trên trang danh sách'],
  },
  {
    code: PERMISSIONS.ORGANIZATION.POSITION.UPDATE,
    module: 'Tổ chức',
    resource: 'Vị trí công việc',
    action: 'Cập nhật',
    description: 'Cho phép chỉnh sửa vị trí công việc',
    affectedUI: ['Nút "Sửa" trong cột thao tác'],
  },
  {
    code: PERMISSIONS.ORGANIZATION.POSITION.DELETE,
    module: 'Tổ chức',
    resource: 'Vị trí công việc',
    action: 'Xóa',
    description: 'Cho phép xóa vị trí công việc',
    affectedUI: ['Nút "Xóa" trong cột thao tác'],
  },

  // ─── Admin · User ───────────────────────────────────────────────
  {
    code: PERMISSIONS.ADMIN.USER.READ,
    module: 'Quản trị hệ thống',
    resource: 'Tài khoản',
    action: 'Xem',
    description: 'Cho phép xem danh sách tài khoản người dùng',
    affectedUI: [
      'Menu "Quản lý tài khoản"',
      'Trang danh sách tài khoản',
    ],
  },
  {
    code: PERMISSIONS.ADMIN.USER.CREATE,
    module: 'Quản trị hệ thống',
    resource: 'Tài khoản',
    action: 'Tạo mới',
    description: 'Cho phép tạo tài khoản người dùng mới',
    affectedUI: ['Nút "Thêm tài khoản"'],
  },
  {
    code: PERMISSIONS.ADMIN.USER.UPDATE,
    module: 'Quản trị hệ thống',
    resource: 'Tài khoản',
    action: 'Cập nhật',
    description: 'Cho phép gán/gỡ vai trò cho người dùng',
    affectedUI: [
      'Nút "Gán vai trò" trong trang tài khoản',
      'Nút xóa tag vai trò',
    ],
  },
  {
    code: PERMISSIONS.ADMIN.USER.DELETE,
    module: 'Quản trị hệ thống',
    resource: 'Tài khoản',
    action: 'Xóa',
    description: 'Cho phép xóa tài khoản người dùng',
    affectedUI: ['Nút "Xóa" trong trang tài khoản'],
  },

  // ─── Admin · Role ───────────────────────────────────────────────
  {
    code: PERMISSIONS.ADMIN.ROLE.READ,
    module: 'Quản trị hệ thống',
    resource: 'Vai trò',
    action: 'Xem',
    description: 'Cho phép xem danh sách vai trò và chi tiết phân quyền',
    affectedUI: [
      'Menu "Vai trò & Phân quyền"',
      'Trang danh sách vai trò',
      'Trang chi tiết vai trò',
    ],
  },
  {
    code: PERMISSIONS.ADMIN.ROLE.CREATE,
    module: 'Quản trị hệ thống',
    resource: 'Vai trò',
    action: 'Tạo mới',
    description: 'Cho phép tạo vai trò mới',
    affectedUI: ['Nút "Tạo vai trò mới" trên trang vai trò'],
  },
  {
    code: PERMISSIONS.ADMIN.ROLE.UPDATE,
    module: 'Quản trị hệ thống',
    resource: 'Vai trò',
    action: 'Cập nhật',
    description: 'Cho phép chỉnh sửa vai trò và gán/gỡ quyền hạn',
    affectedUI: [
      'Ma trận quyền hạn trong trang chi tiết vai trò',
      'Checkbox gán/gỡ permission',
    ],
  },
  {
    code: PERMISSIONS.ADMIN.ROLE.DELETE,
    module: 'Quản trị hệ thống',
    resource: 'Vai trò',
    action: 'Xóa',
    description: 'Cho phép xóa vai trò',
    affectedUI: ['Nút "Xóa" trên trang vai trò'],
  },

  // ─── Admin · Audit ──────────────────────────────────────────────
  {
    code: PERMISSIONS.ADMIN.AUDIT.READ,
    module: 'Quản trị hệ thống',
    resource: 'Nhật ký kiểm toán',
    action: 'Xem',
    description: 'Cho phép xem nhật ký kiểm toán hệ thống',
    affectedUI: [
      'Menu "Nhật ký kiểm toán"',
      'Trang nhật ký kiểm toán',
    ],
  },

  // ─── Admin · Settings ───────────────────────────────────────────
  {
    code: PERMISSIONS.ADMIN.SETTINGS.READ,
    module: 'Quản trị hệ thống',
    resource: 'Cài đặt',
    action: 'Xem',
    description: 'Cho phép xem các trang cài đặt hệ thống',
    affectedUI: [
      'Menu "Cài đặt hệ thống"',
      'Các trang quản lý: Lịch, Nhãn, Quy trình duyệt, Trường tùy chỉnh, Tệp',
    ],
  },
  {
    code: PERMISSIONS.ADMIN.SETTINGS.UPDATE,
    module: 'Quản trị hệ thống',
    resource: 'Cài đặt',
    action: 'Cập nhật',
    description: 'Cho phép thay đổi cài đặt hệ thống',
    affectedUI: [
      'Các nút "Lưu" trong trang cài đặt',
      'Form chỉnh sửa cấu hình hệ thống',
    ],
  },
];

export function findRegistryEntry(code: string): PermissionRegistryEntry | undefined {
  return PERMISSION_REGISTRY.find((entry) => entry.code === code);
}

export function groupRegistryByModule(): Map<string, PermissionRegistryEntry[]> {
  const grouped = new Map<string, PermissionRegistryEntry[]>();
  for (const entry of PERMISSION_REGISTRY) {
    const existing = grouped.get(entry.module) || [];
    existing.push(entry);
    grouped.set(entry.module, existing);
  }
  return grouped;
}
