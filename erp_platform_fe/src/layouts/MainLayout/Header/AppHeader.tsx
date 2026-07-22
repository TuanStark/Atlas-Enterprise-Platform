import { Layout, Avatar, Dropdown, Badge, Space, Typography } from 'antd';
import type { MenuProps } from 'antd';
import {
  Bell,
  Menu as MenuIcon,
  LogOut,
  User,
  Settings,
  MessageSquare,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useCurrentUser } from '@features/auth/hooks/useAuth';

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
  const navigate = useNavigate();

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
    } else if (key === 'profile') {
      navigate('/profile');
    } else if (key === 'settings') {
      navigate('/admin/settings');
    }
  };

  const displayName = user?.displayName || user?.username || user?.email || 'Người dùng';

  const formatRoleName = (roles?: string[]) => {
    if (!roles || roles.length === 0) return 'Nhân viên';

    const systemRoleNames: Record<string, string> = {
      SUPER_ADMIN: 'Quản trị hệ thống',
      ADMIN: 'Quản trị doanh nghiệp',
      USER: 'Nhân viên',
    };

    const humanizeRole = (code: string) =>
      systemRoleNames[code] ||
      code
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

    return humanizeRole(roles[0]);
  };

  const roleName = formatRoleName(user?.roles);

  return (
    <Header
      className={`fixed top-0 right-0 h-[60px] flex items-center justify-between px-6 bg-white border-0 border-b border-solid border-border-light z-[200] transition-[left] duration-200 ${collapsed ? 'left-[72px]' : 'left-[270px]'
        } max-[768px]:left-0 max-[768px]:px-4`}
    >
      {/* Left side: toggle button and search box */}
      <div className="flex items-center gap-4 flex-1">
        <button
          className="flex items-center justify-center w-9 h-9 bg-transparent rounded-md text-text-secondary cursor-pointer transition-all duration-150 hover:bg-bg-secondary hover:text-text-primary border-none"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <MenuIcon size={18} />
        </button>
      </div>

      {/* Right side: quick actions, chat, notifications, user avatar */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Chat / Messages icon */}
        <button
          className="flex items-center justify-center w-9 h-9 bg-transparent rounded-md text-text-secondary cursor-pointer transition-all duration-150 hover:bg-bg-secondary hover:text-text-primary border-none"
          aria-label="Messages"
        >
          <Badge count={2} size="small" offset={[-2, 2]} color="var(--color-primary)">
            <MessageSquare size={18} />
          </Badge>
        </button>

        {/* Notifications */}
        <button
          className="flex items-center justify-center w-9 h-9 bg-transparent rounded-md text-text-secondary cursor-pointer transition-all duration-150 hover:bg-bg-secondary hover:text-text-primary border-none"
          aria-label="Notifications"
        >
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
          <Space
            className="flex items-center gap-2 px-2 py-1 rounded-lg cursor-pointer transition-colors duration-150 hover:bg-bg-secondary"
            role="button"
            tabIndex={0}
          >
            <Avatar
              size={36}
              src={user?.avatarUrl ? `/api/v1/files/${user.avatarUrl}/view` : undefined}
              style={{
                border: '2px solid #e2e8f0',
                background: !user?.avatarUrl ? 'linear-gradient(135deg, #0a65ff, #004ecc)' : undefined,
                color: !user?.avatarUrl ? '#fff' : undefined,
                fontWeight: 600,
              }}
            >
              {!user?.avatarUrl && (user?.displayName || user?.username || 'U').charAt(0).toUpperCase()}
            </Avatar>
            <div className="flex flex-col leading-none max-[768px]:hidden">
              <Text
                strong
                style={{ fontSize: 13, lineHeight: '16px', display: 'block', color: 'var(--color-text-primary)' }}
              >
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
