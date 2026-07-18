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

        <div className="flex items-center max-w-[320px] w-full max-[768px]:hidden">
          <Input
            placeholder="Search reports, dashboards, exports..."
            prefix={<Search size={14} style={{ color: 'var(--color-text-tertiary)', marginRight: 4 }} />}
            suffix={
              <span className="text-[10px] bg-[#f1f5f9] border border-solid border-border text-text-secondary px-[5px] py-[1px] rounded font-medium">
                ⌘ K
              </span>
            }
            className="w-full !rounded-lg !bg-bg-secondary !border-solid !border-[rgba(226,232,240,0.8)] !h-9 transition-all duration-150 text-[13px] hover:!bg-white focus:!bg-white hover:!border-primary/30 focus:!border-primary/30 focus:!shadow-[0_0_0_3px_rgba(10,101,255,0.05)]"
          />
        </div>
      </div>

      {/* Right side: quick actions, chat, notifications, user avatar */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Help icon */}
        <button
          className="flex items-center justify-center w-9 h-9 bg-transparent rounded-md text-text-secondary cursor-pointer transition-all duration-150 hover:bg-bg-secondary hover:text-text-primary border-none"
          aria-label="Help"
        >
          <HelpCircle size={18} />
        </button>

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
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              style={{
                border: '2px solid #e2e8f0',
              }}
            />
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
