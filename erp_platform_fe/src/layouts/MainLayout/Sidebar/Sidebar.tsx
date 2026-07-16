import { useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Clock,
  Wallet,
  UserPlus,
  Target,
  GraduationCap,
  Building2,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import './Sidebar.css';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

/**
 * Sidebar — Main navigation organized by backend module structure
 *
 * Menu items map 1:1 to backend modules:
 * - Dashboard (overview)
 * - HRM module (employees, leave, attendance, payroll, recruitment, performance, training)
 * - Organization module
 * - Admin module (users, roles, settings)
 */

function getMenuItems(): MenuItem[] {
  return [
    {
      key: '/dashboard',
      icon: <LayoutDashboard size={18} />,
      label: 'Tổng quan',
    },
    {
      key: 'hrm',
      icon: <Users size={18} />,
      label: 'Nhân sự (HRM)',
      children: [
        { key: '/hrm/employees', label: 'Nhân viên' },
        { key: '/hrm/leave-requests', label: 'Nghỉ phép' },
        { key: '/hrm/attendance', label: 'Chấm công' },
        { key: '/hrm/payroll', label: 'Bảng lương' },
        { key: '/hrm/recruitment', label: 'Tuyển dụng' },
        { key: '/hrm/performance', label: 'Đánh giá' },
        { key: '/hrm/training', label: 'Đào tạo' },
      ],
    },
    {
      key: 'time',
      icon: <Clock size={18} />,
      label: 'Thời gian',
      children: [
        { key: '/hrm/shifts', label: 'Ca làm việc' },
        { key: '/hrm/timesheet', label: 'Bảng công' },
      ],
    },
    {
      key: '/hrm/leave-calendar',
      icon: <CalendarDays size={18} />,
      label: 'Lịch nghỉ',
    },
    {
      key: '/hrm/payroll-runs',
      icon: <Wallet size={18} />,
      label: 'Tính lương',
    },
    {
      key: '/hrm/recruitment-board',
      icon: <UserPlus size={18} />,
      label: 'Tuyển dụng',
    },
    {
      key: '/hrm/performance-cycles',
      icon: <Target size={18} />,
      label: 'Hiệu suất',
    },
    {
      key: '/hrm/training-courses',
      icon: <GraduationCap size={18} />,
      label: 'Đào tạo',
    },
    { type: 'divider' as const },
    {
      key: '/organization',
      icon: <Building2 size={18} />,
      label: 'Tổ chức',
    },
    {
      key: 'admin',
      icon: <Shield size={18} />,
      label: 'Quản trị',
      children: [
        { key: '/admin/users', label: 'Người dùng' },
        { key: '/admin/roles', label: 'Vai trò & Quyền' },
        { key: '/admin/workflows', label: 'Quy trình' },
        { key: '/admin/settings', label: 'Cấu hình' },
      ],
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
      width={260}
      collapsedWidth={72}
      collapsed={collapsed}
      trigger={null}
      theme="dark"
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 'var(--z-sticky)' as unknown as number,
      }}
    >
      {/* Logo */}
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">A</div>
        {!collapsed && <span className="sidebar__logo-text">Atlas ERP</span>}
      </div>

      {/* Navigation Menu */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        defaultOpenKeys={openKeys}
        items={getMenuItems()}
        onClick={handleMenuClick}
        className="sidebar__menu"
      />

      {/* Collapse Toggle */}
      <button
        className="sidebar__collapse-btn"
        onClick={() => onCollapse(!collapsed)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </Sider>
  );
}
