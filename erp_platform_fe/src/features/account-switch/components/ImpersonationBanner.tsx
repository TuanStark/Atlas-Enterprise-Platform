import { ShieldAlert, Shield, X } from 'lucide-react';
import { useEndImpersonation } from '../hooks/useAccountSwitch';
import { useCurrentUser } from '@features/auth/hooks/useAuth';

export function ImpersonationBanner() {
  const user = useCurrentUser();
  const endImpersonation = useEndImpersonation();

  const impersonatorId = (user as any)?.impersonatorId;
  if (!impersonatorId) return null;

  const isPlatformSupport = user?.roles.includes('SUPER_ADMIN');

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] flex items-center justify-center gap-3 px-4 py-2"
      style={{
        background: isPlatformSupport
          ? 'linear-gradient(90deg, #dc2626, #ea580c)'
          : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
        color: '#fff',
        fontSize: 13,
        fontWeight: 500,
        minHeight: 36,
      }}
    >
      {isPlatformSupport ? <ShieldAlert size={16} /> : <Shield size={16} />}
      <span>
        {isPlatformSupport ? (
          <>
            <strong>[HỖ TRỢ KỸ THUẬT NỀN TẢNG]</strong> Đang đóng vai:{' '}
            <strong>{user?.displayName || user?.username || user?.email}</strong>
            {' — '}Mọi thao tác đều được lưu Support Audit Log
          </>
        ) : (
          <>
            <strong>[ĐÓNG VAI NỘI BỘ DOANH NGHIỆP]</strong> Đang đóng vai:{' '}
            <strong>{user?.displayName || user?.username || user?.email}</strong>
          </>
        )}
      </span>
      <button
        className="flex items-center gap-1 px-3 py-1 ml-2 rounded-md bg-white/20 border-none cursor-pointer text-white text-xs font-semibold transition-all duration-150 hover:bg-white/30 disabled:opacity-50"
        onClick={() => endImpersonation.mutate()}
        disabled={endImpersonation.isPending}
      >
        <X size={12} />
        Thoát đóng vai
      </button>
    </div>
  );
}
