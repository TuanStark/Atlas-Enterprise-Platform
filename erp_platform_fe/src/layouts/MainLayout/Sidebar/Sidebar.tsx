import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Wallet,
  UserPlus,
  Target,
  Shield,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  Bell,
  FileText,
  Tags,
  Sliders,
  Workflow,
  Settings,
  UserCog,
  KeyRound,
  History,
  Clock,
} from 'lucide-react';
import { useCanAccess } from '@shared/hooks/usePermission';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

/**
 * Sidebar Menu Item with optional RBAC permission requirement.
 *
 * Items with `permission` will only render if the user has the specified access.
 * Items without `permission` are visible to all authenticated users.
 */
interface PermissionMenuItem {
  key: string;
  icon?: React.ReactNode;
  label: string;
  permission?: { resource: string; action: string };
  children?: PermissionMenuItem[];
}

/**
 * Raw menu definition — all items, unfiltered by permissions.
 * Organized by module matching AWS Console service grouping.
 */
const MENU_DEFINITION: PermissionMenuItem[] = [
  {
    key: '/dashboard',
    icon: <LayoutDashboard size={16} />,
    label: 'Tổng quan',
  },
  {
    key: 'hrm',
    icon: <Users size={16} />,
    label: 'Quản lý nhân sự',
    children: [
      { key: '/hrm/employees', icon: <Users size={14} />, label: 'Danh sách nhân viên', permission: { resource: 'hrm.employee', action: 'read' } },
      { key: '/hrm/leave-requests', icon: <CalendarDays size={14} />, label: 'Yêu cầu nghỉ phép', permission: { resource: 'hrm.leave', action: 'read' } },
      { key: '/hrm/attendance', icon: <Clock size={14} />, label: 'Lịch sử chấm công', permission: { resource: 'hrm.attendance', action: 'read' } },
      { key: '/hrm/timesheet', icon: <CalendarDays size={14} />, label: 'Bảng phân ca làm việc', permission: { resource: 'hrm.shift', action: 'read' } },
      { key: '/hrm/shifts', icon: <Clock size={14} />, label: 'Danh mục ca làm việc', permission: { resource: 'hrm.shift', action: 'read' } },
    ],
  },
  {
    key: '/hrm/leave-calendar',
    icon: <CalendarDays size={16} />,
    label: 'Quản lý nghỉ phép',
    permission: { resource: 'hrm.leave', action: 'read' },
  },
  {
    key: '/hrm/payroll',
    icon: <Wallet size={16} />,
    label: 'Tính lương',
    permission: { resource: 'hrm.payroll', action: 'read' },
  },
  {
    key: '/hrm/recruitment',
    icon: <UserPlus size={16} />,
    label: 'Tuyển dụng',
    permission: { resource: 'hrm.recruitment', action: 'read' },
  },
  {
    key: '/hrm/performance',
    icon: <Target size={16} />,
    label: 'Đánh giá hiệu suất',
    permission: { resource: 'hrm.performance', action: 'read' },
  },
  {
    key: '/organization',
    icon: <Building2 size={16} />,
    label: 'Tổ chức',
    permission: { resource: 'org.structure', action: 'read' },
  },
  {
    key: '/notifications',
    icon: <Bell size={16} />,
    label: 'Thông báo',
  },
  {
    key: 'admin',
    icon: <Shield size={16} />,
    label: 'Quản trị hệ thống',
    permission: { resource: 'admin.user', action: 'read' },
    children: [
      { key: '/admin/users', icon: <UserCog size={14} />, label: 'Quản lý tài khoản', permission: { resource: 'admin.user', action: 'read' } },
      { key: '/admin/roles', icon: <KeyRound size={14} />, label: 'Vai trò & Phân quyền', permission: { resource: 'admin.role', action: 'read' } },
      { key: '/admin/audit', icon: <History size={14} />, label: 'Nhật ký kiểm toán', permission: { resource: 'admin.audit', action: 'read' } },
      { key: '/admin/workflows', icon: <Workflow size={14} />, label: 'Quy trình duyệt', permission: { resource: 'admin.settings', action: 'read' } },
      { key: '/admin/calendars', icon: <CalendarDays size={14} />, label: 'Lịch & Ngày lễ', permission: { resource: 'admin.settings', action: 'read' } },
      { key: '/admin/tags', icon: <Tags size={14} />, label: 'Quản lý nhãn', permission: { resource: 'admin.settings', action: 'read' } },
      { key: '/admin/custom-fields', icon: <Sliders size={14} />, label: 'Trường tùy chỉnh', permission: { resource: 'admin.settings', action: 'read' } },
      { key: '/admin/files', icon: <FileText size={14} />, label: 'Quản lý tệp', permission: { resource: 'admin.settings', action: 'read' } },
      { key: '/admin/settings', icon: <Settings size={14} />, label: 'Cài đặt hệ thống', permission: { resource: 'admin.settings', action: 'read' } },
    ],
  },
];

/**
 * useFilteredMenu — Filters menu items based on current user's RBAC permissions.
 *
 * Items without `permission` are always shown (public within auth context).
 * Items with `permission` are only shown if `useCanAccess` returns true.
 * Parent items are hidden if ALL children are hidden.
 */
function useFilteredMenu(): MenuItem[] {
  const checkPermission = useCanAccess;

  function filterItems(items: PermissionMenuItem[]): MenuItem[] {
    const result: MenuItem[] = [];

    for (const item of items) {
      // Check item-level permission
      if (item.permission && !checkPermission(item.permission.resource, item.permission.action)) {
        continue;
      }

      if (item.children) {
        const filteredChildren = filterItems(item.children);
        // Hide parent if no children are visible
        if (filteredChildren.length === 0) continue;

        result.push({
          key: item.key,
          icon: item.icon,
          label: item.label,
          children: filteredChildren,
        } as MenuItem);
      } else {
        result.push({
          key: item.key,
          icon: item.icon,
          label: item.label,
        } as MenuItem);
      }
    }

    return result;
  }

  return filterItems(MENU_DEFINITION);
}

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const menuItems = useFilteredMenu();

  // Find active key from current path
  const selectedKeys = [location.pathname];

  // Find open submenu from current path
  const openKeys = !collapsed
    ? (() => {
      if (location.pathname.startsWith('/hrm/')) return ['hrm'];
      if (location.pathname.startsWith('/admin/')) return ['admin'];
      return [];
    })()
    : [];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  return (
    <Sider
      className={`!bg-white border-0 border-r border-solid border-[rgba(0,0,0,0.06)] shadow-[2px_0_8px_rgba(0,0,0,0.015)] transition-all duration-200 overflow-hidden h-screen fixed top-0 bottom-0 z-[200] ${
        collapsed ? 'left-0 max-[768px]:-left-[270px]' : 'left-0'
      } max-[768px]:!w-[270px] max-[768px]:!max-w-[270px] max-[768px]:!min-w-[270px]`}
      width={270}
      collapsedWidth={72}
      collapsed={collapsed}
      trigger={null}
      theme="light"
    >
      <div className="flex flex-col h-full w-full">
        {/* Logo */}
        <div
          className={`flex items-center gap-3 p-5 border-0 border-b border-solid border-[rgba(0,0,0,0.04)] mb-2 transition-all duration-200 ${
            collapsed ? 'justify-center !px-0 gap-0' : 'justify-start'
          }`}
        >
          <div
            className={`flex items-center justify-center bg-gradient-to-br from-[#0a65ff] to-[#004ecc] rounded-lg text-white shrink-0 shadow-[0_4px_12px_rgba(10,101,255,0.25)] transition-all duration-200 ${
              collapsed ? 'w-9 h-9' : 'w-[38px] h-[38px]'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6ZM12 18C9.33 18 4.67 19.33 4.67 22C6.24 23.55 8.5 24.5 11 24.5C13.5 24.5 15.76 23.55 17.33 22C17.33 19.33 12.67 18 12 18Z" fill="currentColor" />
              <circle cx="6" cy="9" r="1.5" fill="currentColor" />
              <circle cx="18" cy="9" r="1.5" fill="currentColor" />
            </svg>
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight animate-[fadeIn_0.2s_ease-in-out]">
              <span className="text-[#1f2937] text-[17px] font-extrabold tracking-tight whitespace-nowrap">HRIMS</span>
              <span className="text-[#9ca3af] text-[9px] font-semibold uppercase tracking-wider whitespace-nowrap">Hệ thống thông tin nhân sự</span>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-200">
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={selectedKeys}
            defaultOpenKeys={openKeys}
            items={menuItems}
            onClick={handleMenuClick}
            className="!border-r-0 !bg-transparent !px-2.5 
              [&_.ant-menu-item]:!rounded-lg [&_.ant-menu-item]:!my-1 [&_.ant-menu-item]:!h-[42px] [&_.ant-menu-item]:!leading-[42px] [&_.ant-menu-item]:!text-text-secondary [&_.ant-menu-item]:!font-medium [&_.ant-menu-item]:!flex [&_.ant-menu-item]:!items-center
              [&_.ant-menu-submenu-title]:!rounded-lg [&_.ant-menu-submenu-title]:!my-1 [&_.ant-menu-submenu-title]:!h-[42px] [&_.ant-menu-submenu-title]:!leading-[42px] [&_.ant-menu-submenu-title]:!text-text-secondary [&_.ant-menu-submenu-title]:!font-medium [&_.ant-menu-submenu-title]:!flex [&_.ant-menu-submenu-title]:!items-center
              [&_.ant-menu-item:hover]:!bg-primary/5 [&_.ant-menu-item:hover]:!text-primary [&_.ant-menu-submenu-title:hover]:!bg-primary/5 [&_.ant-menu-submenu-title:hover]:!text-primary
              [&_.ant-menu-item-selected]:!bg-primary/10 [&_.ant-menu-item-selected]:!text-primary [&_.ant-menu-item-selected]:!font-semibold
              [&_.ant-menu-sub]:!bg-transparent [&_.ant-menu-sub]:!ml-5 [&_.ant-menu-sub]:!pl-2 [&_.ant-menu-sub]:!border-0 [&_.ant-menu-sub]:!border-l-2 [&_.ant-menu-sub]:!border-solid [&_.ant-menu-sub]:!border-black/5 [&_.ant-menu-submenu-open_.ant-menu-sub]:!border-primary/20
              [&_.ant-menu-sub_.ant-menu-item]:!h-[38px] [&_.ant-menu-sub_.ant-menu-item]:!leading-[38px] [&_.ant-menu-sub_.ant-menu-item]:!text-[13px] [&_.ant-menu-sub_.ant-menu-item]:!pl-3"
          />
        </div>

        {/* Safety Badge */}
        {!collapsed && (
          <div className="flex items-center gap-3 bg-gradient-to-br from-primary/[0.03] to-primary/[0.06] border border-solid border-primary/10 rounded-xl p-3 mx-4 my-4 shadow-[0_4px_20px_rgba(0,0,0,0.01)] transition-opacity duration-300">
            <div className="text-primary flex items-center justify-center shrink-0 w-7 h-7 bg-white rounded-lg shadow-[0_2px_8px_rgba(10,101,255,0.1)]">
              <ShieldCheck size={16} />
            </div>
            <div className="flex flex-col leading-normal">
              <span className="text-[11px] font-bold text-[#1f2937]">Dữ liệu được bảo mật</span>
              <span className="text-[9.5px] text-text-secondary">Đảm bảo an toàn và bảo mật dữ liệu.</span>
            </div>
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          className="flex items-center justify-center w-full py-3.5 border-0 border-t border-solid border-black/5 bg-transparent text-text-secondary cursor-pointer transition-all duration-150 hover:bg-black/5 hover:text-text-primary max-[768px]:!hidden"
          onClick={() => onCollapse(!collapsed)}
          aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </Sider>
  );
}
