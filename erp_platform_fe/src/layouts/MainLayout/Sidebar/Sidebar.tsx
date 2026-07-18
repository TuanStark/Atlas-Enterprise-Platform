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
import './Sidebar.css';

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
      className="sidebar"
      width={270}
      collapsedWidth={72}
      collapsed={collapsed}
      trigger={null}
      theme="light"
    >
      <div className="sidebar__container" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
        {/* Logo */}
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6ZM12 18C9.33 18 4.67 19.33 4.67 22C6.24 23.55 8.5 24.5 11 24.5C13.5 24.5 15.76 23.55 17.33 22C17.33 19.33 12.67 18 12 18Z" fill="currentColor" />
              <circle cx="6" cy="9" r="1.5" fill="currentColor" />
              <circle cx="18" cy="9" r="1.5" fill="currentColor" />
            </svg>
          </div>
          {!collapsed && (
            <div className="sidebar__logo-brand">
              <span className="sidebar__logo-text">HRIMS</span>
              <span className="sidebar__logo-subtext">Hệ thống thông tin nhân sự</span>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={selectedKeys}
            defaultOpenKeys={openKeys}
            items={menuItems}
            onClick={handleMenuClick}
            className="sidebar__menu"
          />
        </div>

        {/* Safety Badge */}
        {!collapsed && (
          <div className="sidebar__security-badge">
            <div className="sidebar__security-icon">
              <ShieldCheck size={16} />
            </div>
            <div className="sidebar__security-info">
              <span className="sidebar__security-title">Dữ liệu được bảo mật</span>
              <span className="sidebar__security-desc">Đảm bảo an toàn và bảo mật dữ liệu.</span>
            </div>
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          className="sidebar__collapse-btn"
          onClick={() => onCollapse(!collapsed)}
          aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </Sider>
  );
}
