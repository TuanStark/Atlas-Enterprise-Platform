import { Layout, Avatar, Dropdown, Badge, Space, Typography, Input } from 'antd';
import type { MenuProps } from 'antd';
import {
  Bell,
  Menu as MenuIcon,
  LogOut,
  User,
  Settings,
  Search,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';
import { useAuth, useCurrentUser } from '@features/auth/hooks/useAuth';
import './AppHeader.css';

const { Header } = Layout;
const { Text } = Typography;

interface AppHeaderProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

/**
 * AppHeader — Top navigation bar
 * Contains: Sidebar toggle, search bar (⌘K), notifications, user profile info
 */
export function AppHeader({ collapsed, onToggleCollapse }: AppHeaderProps) {
  const user = useCurrentUser();
  const { logout } = useAuth();

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <User size={14} />,
      label: 'Hồ sơ cá nhân',
    },
    {
      key: 'settings',
      icon: <Settings size={14} />,
      label: 'Cài đặt',
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogOut size={14} />,
      label: 'Đăng xuất',
      danger: true,
    },
  ];

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      void logout();
    }
  };

  const displayName = user?.displayName || 'Spencer';
  const roleName = user?.email?.includes('admin') ? 'Admin' : 'Quản trị viên';

  return (
    <Header className={`app-header ${collapsed ? 'app-header--collapsed' : ''}`}>
      {/* Left side: toggle button and search box */}
      <div className="app-header__left">
        <button
          className="app-header__menu-btn"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <MenuIcon size={18} />
        </button>

        <div className="app-header__search-container">
          <Input
            placeholder="Search reports, dashboards, exports..."
            prefix={<Search size={14} style={{ color: 'var(--color-text-tertiary)', marginRight: 4 }} />}
            suffix={<span className="app-header__search-shortcut">⌘ K</span>}
            className="app-header__search-input"
          />
        </div>
      </div>

      {/* Right side: quick actions, chat, notifications, user avatar */}
      <div className="app-header__right">
        {/* Help icon */}
        <button className="app-header__icon-btn" aria-label="Help">
          <HelpCircle size={18} />
        </button>

        {/* Chat / Messages icon */}
        <button className="app-header__icon-btn" aria-label="Messages">
          <Badge count={2} size="small" offset={[-2, 2]} color="var(--color-primary)">
            <MessageSquare size={18} />
          </Badge>
        </button>

        {/* Notifications */}
        <button className="app-header__icon-btn" aria-label="Notifications">
          <Badge count={3} size="small" offset={[-2, 2]} color="var(--color-primary)">
            <Bell size={18} />
          </Badge>
        </button>

        {/* User Menu */}
        <Dropdown
          menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Space className="app-header__user" role="button" tabIndex={0}>
            <Avatar
              size={36}
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              style={{
                border: '2px solid #e2e8f0',
              }}
            />
            <div className="app-header__user-info">
              <Text strong style={{ fontSize: 13, lineHeight: '16px', display: 'block', color: 'var(--color-text-primary)' }}>
                {displayName}
              </Text>
              <Text type="secondary" style={{ fontSize: 10, lineHeight: '12px', display: 'block' }}>
                {roleName}
              </Text>
            </div>
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
}
