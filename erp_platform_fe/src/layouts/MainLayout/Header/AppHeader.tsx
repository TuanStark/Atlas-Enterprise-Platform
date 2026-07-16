import { Layout, Avatar, Dropdown, Badge, Space, Typography } from 'antd';
import type { MenuProps } from 'antd';
import {
  Bell,
  Menu as MenuIcon,
  LogOut,
  User,
  Settings,
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
 *
 * Contains: Sidebar toggle, breadcrumb area, notifications, user menu
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

  // Get user initials for avatar
  const initials = user?.displayName
    ? user.displayName
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <Header className="app-header">
      <div className="app-header__left">
        <button
          className="app-header__menu-btn"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <MenuIcon size={20} />
        </button>
      </div>

      <div className="app-header__right">
        {/* Notifications */}
        <button className="app-header__icon-btn" aria-label="Notifications">
          <Badge count={3} size="small" offset={[-2, 2]}>
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
              size={32}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              {initials}
            </Avatar>
            <div className="app-header__user-info">
              <Text strong style={{ fontSize: 13, lineHeight: '18px' }}>
                {user?.displayName || 'User'}
              </Text>
              <Text type="secondary" style={{ fontSize: 11, lineHeight: '14px' }}>
                {user?.email || ''}
              </Text>
            </div>
          </Space>
        </Dropdown>
      </div>
    </Header>
  );
}
