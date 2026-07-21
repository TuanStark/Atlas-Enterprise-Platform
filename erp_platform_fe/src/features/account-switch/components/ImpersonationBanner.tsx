import { Shield, X } from 'lucide-react';
import { useEndImpersonation } from '../hooks/useAccountSwitch';
import { useCurrentUser } from '@features/auth/hooks/useAuth';

export function ImpersonationBanner() {
  const user = useCurrentUser();
  const endImpersonation = useEndImpersonation();

  const impersonatorId = (user as any)?.impersonatorId;
  if (!impersonatorId) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-3 px-4 py-2"
      style={{
        background: 'linear-gradient(90deg, #f59e0b, #d97706)',
        color: '#fff',
        fontSize: 13,
        fontWeight: 500,
        minHeight: 36,
      }}
    >
      <Shield size={14} />
      <span>
        Đang đóng vai:{' '}
        <strong>{user?.displayName || user?.username || user?.email}</strong>
        {' — '}
        Các thao tác đang được ghi nhận
      </span>
      <button
        className="flex items-center gap-1 px-3 py-1 ml-2 rounded-md bg-white/20 border-none cursor-pointer text-white text-xs font-semibold transition-all duration-150 hover:bg-white/30 disabled:opacity-50"
        onClick={() => endImpersonation.mutate()}
        disabled={endImpersonation.isPending}
      >
        <X size={12} />
        Quay lại tài khoản gốc
      </button>
    </div>
  );
}
