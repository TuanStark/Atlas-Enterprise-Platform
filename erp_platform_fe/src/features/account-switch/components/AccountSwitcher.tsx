import { Avatar, Tooltip, Spin, Typography } from 'antd';
import { ArrowRightLeft } from 'lucide-react';
import { useSwitchableUsers, useSwitchAccount } from '../hooks/useAccountSwitch';
import { useCurrentUser } from '@features/auth/hooks/useAuth';

const { Text } = Typography;

interface AccountSwitcherProps {
  collapsed: boolean;
}

export function AccountSwitcher({ collapsed }: AccountSwitcherProps) {
  const user = useCurrentUser();
  const { data: switchableUsers, isLoading } = useSwitchableUsers();
  const switchAccount = useSwitchAccount();

  if ((user as any)?.impersonatorId) return null;

  if (!isLoading && (!switchableUsers || switchableUsers.length === 0)) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-3 border-0 border-t border-solid border-black/5">
        <Spin size="small" />
      </div>
    );
  }

  const handleSwitch = (principalId: string) => {
    if (switchAccount.isPending) return;
    switchAccount.mutate(principalId);
  };

  const formatRole = (code: string) => {
    const systemRoles: Record<string, string> = {
      SUPER_ADMIN: 'SA',
      ADMIN: 'Admin',
      USER: 'User',
    };
    return (
      systemRoles[code] ||
      code
        .split('_')
        .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
        .join(' ')
    );
  };

  return (
    <div className="border-0 border-t border-solid border-black/5 py-2 px-2.5">
      {!collapsed && (
        <div className="flex items-center gap-1.5 px-2 py-1.5 mb-1">
          <ArrowRightLeft size={12} className="text-text-secondary" />
          <Text
            type="secondary"
            style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
          >
            Đóng vai tài khoản
          </Text>
        </div>
      )}

      <div className={`flex flex-col gap-0.5 ${collapsed ? 'items-center' : ''}`}>
        {switchableUsers!.slice(0, 5).map((target) => {
          const initials = (target.displayName || target.username || 'U').charAt(0).toUpperCase();
          const roleLabel = target.roles.length > 0 ? formatRole(target.roles[0]) : '';

          return collapsed ? (
            <Tooltip
              key={target.principalId}
              title={`${target.displayName || target.username} (${roleLabel})`}
              placement="right"
            >
              <button
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-transparent border-none cursor-pointer transition-all duration-150 hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleSwitch(target.principalId)}
                disabled={switchAccount.isPending}
              >
                <Avatar
                  size={28}
                  src={target.avatarUrl ? `/api/v1/files/${target.avatarUrl}/view` : undefined}
                  style={{
                    background: !target.avatarUrl ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : undefined,
                    color: !target.avatarUrl ? '#fff' : undefined,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {!target.avatarUrl && initials}
                </Avatar>
              </button>
            </Tooltip>
          ) : (
            <button
              key={target.principalId}
              className="flex items-center gap-2.5 w-full px-2 py-2 rounded-lg bg-transparent border-none cursor-pointer transition-all duration-150 hover:bg-primary/5 text-left disabled:opacity-50 disabled:cursor-not-allowed group"
              onClick={() => handleSwitch(target.principalId)}
              disabled={switchAccount.isPending}
            >
              <Avatar
                size={30}
                src={target.avatarUrl ? `/api/v1/files/${target.avatarUrl}/view` : undefined}
                style={{
                  background: !target.avatarUrl ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : undefined,
                  color: !target.avatarUrl ? '#fff' : undefined,
                  fontSize: 12,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {!target.avatarUrl && initials}
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <Text
                  style={{ fontSize: 12, lineHeight: '16px', fontWeight: 500, color: 'var(--color-text-primary)' }}
                  ellipsis
                >
                  {target.displayName || target.username}
                </Text>
                <Text
                  type="secondary"
                  style={{ fontSize: 10, lineHeight: '12px' }}
                >
                  {roleLabel}
                </Text>
              </div>
              <ArrowRightLeft
                size={12}
                className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
