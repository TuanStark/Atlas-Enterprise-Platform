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
} from 'lucide-react';
import './Sidebar.css';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

/**
 * Sidebar — Main navigation organized by backend module structure
 */
function getMenuItems(): MenuItem[] {
  return [
    {
      key: '/dashboard',
      icon: <LayoutDashboard size={16} />,
      label: 'Tổng quan',
    },
    {
      key: 'hrm',
      icon: <Users size={16} />,
      label: 'Nhân viên',
      children: [
        { key: '/hrm/employees', label: 'Danh sách nhân viên' },
        { key: '/hrm/leave-requests', label: 'Yêu cầu nghỉ phép' },
        { key: '/hrm/attendance', label: 'Lịch sử chấm công' },
        { key: '/hrm/timesheet', label: 'Bảng phân ca làm việc' },
        { key: '/hrm/shifts', label: 'Danh mục ca làm việc' },
      ],
    },
    {
      key: '/hrm/payroll',
      icon: <Wallet size={16} />,
      label: 'Tính lương',
    },
    {
      key: '/hrm/recruitment',
      icon: <UserPlus size={16} />,
      label: 'Tuyển dụng',
    },
    {
      key: '/hrm/leave-calendar',
      icon: <CalendarDays size={16} />,
      label: 'Quản lý nghỉ phép',
    },
    {
      key: '/hrm/performance',
      icon: <Target size={16} />,
      label: 'Đánh giá hiệu suất',
    },
    {
      key: '/admin/settings',
      icon: <Shield size={16} />,
      label: 'Cài đặt',
    },
  ];
}

interface SidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, onCollapse }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

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
      width={240}
      collapsedWidth={72}
      collapsed={collapsed}
      trigger={null}
      theme="light"
      style={{
        overflow: 'hidden',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 'var(--z-sticky)' as unknown as number,
      }}
    >
      <div className="sidebar__container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
            items={getMenuItems()}
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
