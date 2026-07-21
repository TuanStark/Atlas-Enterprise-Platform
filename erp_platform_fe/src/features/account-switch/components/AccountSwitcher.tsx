import { useState } from 'react';
import { Tooltip } from 'antd';
import { ArrowRightLeft } from 'lucide-react';
import { AccountSwitchModal } from './AccountSwitchModal';
import { useCurrentUser } from '@features/auth/hooks/useAuth';

interface AccountSwitcherProps {
  collapsed: boolean;
}

export function AccountSwitcher({ collapsed }: AccountSwitcherProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const user = useCurrentUser();

  if ((user as any)?.impersonatorId) return null;

  return (
    <>
      <div className="border-0 border-t border-solid border-black/5 py-2 px-2.5">
        {collapsed ? (
          <Tooltip title="Đóng vai tài khoản" placement="right">
            <button
              className="flex items-center justify-center w-full h-10 rounded-lg bg-transparent border-none cursor-pointer transition-all duration-150 hover:bg-primary/10 text-text-secondary hover:text-primary"
              onClick={() => setModalOpen(true)}
              aria-label="Đóng vai tài khoản"
            >
              <ArrowRightLeft size={18} />
            </button>
          </Tooltip>
        ) : (
          <button
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl  hover:bg-primary/10 border-solid border-[1px] border-black/10 cursor-pointer transition-all duration-150 text-left group"
            onClick={() => setModalOpen(true)}
          >
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-150 shrink-0">
              <ArrowRightLeft size={14} />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-text-primary group-hover:text-primary transition-colors duration-150 truncate">
                Đóng vai tài khoản
              </span>
            </div>
          </button>
        )}
      </div>

      <AccountSwitchModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
