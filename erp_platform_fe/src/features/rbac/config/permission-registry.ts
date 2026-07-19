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
    action: 'Duyệt',
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
