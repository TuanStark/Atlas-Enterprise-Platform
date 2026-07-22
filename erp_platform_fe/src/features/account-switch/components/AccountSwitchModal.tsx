import { useState, useEffect } from 'react';
import { Modal, Input, Avatar, Button, Tag, Spin, Empty, Typography } from 'antd';
import { Search, ArrowRightLeft, ShieldAlert, ChevronDown } from 'lucide-react';
import { useSwitchableUsers, useSwitchAccount } from '../hooks/useAccountSwitch';
import { useCurrentUser } from '@features/auth/hooks/useAuth';
import type { SwitchableUser } from '../types';

const { Text, Title } = Typography;

interface AccountSwitchModalProps {
  open: boolean;
  onClose: () => void;
}

const PAGE_SIZE = 8;

export function AccountSwitchModal({ open, onClose }: AccountSwitchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [accumulatedUsers, setAccumulatedUsers] = useState<SwitchableUser[]>([]);
  const [offset, setOffset] = useState(0);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setSearchTerm('');
      setDebouncedSearch('');
      setOffset(0);
      setAccumulatedUsers([]);
    }
  }, [open]);

  // Debounce search input only when user types
  useEffect(() => {
    if (searchTerm === debouncedSearch) return;
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setOffset(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, debouncedSearch]);

  // Query switchable users
  const { data, isLoading, isFetching } = useSwitchableUsers({
    search: debouncedSearch,
    limit: PAGE_SIZE,
    offset,
  });

  const switchAccount = useSwitchAccount();

  // Update accumulated list when data arrives
  useEffect(() => {
    if (data?.items) {
      if (offset === 0) {
        setAccumulatedUsers(data.items);
      } else {
        setAccumulatedUsers((prev) => {
          const newItems = data.items.filter(
            (item) => !prev.some((p) => p.principalId === item.principalId),
          );
          return [...prev, ...newItems];
        });
      }
    }
  }, [data, offset]);

  const handleLoadMore = () => {
    setOffset((prev) => prev + PAGE_SIZE);
  };

  const handleSwitch = (principalId: string) => {
    if (switchAccount.isPending) return;
    switchAccount.mutate(principalId);
  };

  const formatRoleLabel = (roleCode: string) => {
    const roleMap: Record<string, { label: string; color: string }> = {
      SUPER_ADMIN: { label: 'Quản trị hệ thống', color: 'red' },
      ADMIN: { label: 'Quản trị doanh nghiệp', color: 'purple' },
      HR_MANAGER: { label: 'Quản lý Nhân sự', color: 'blue' },
      FINANCE_MANAGER: { label: 'Quản lý Tài chính', color: 'gold' },
      USER: { label: 'Nhân viên', color: 'default' },
      EMP: { label: 'Nhân viên', color: 'default' },
      EMP001: { label: 'Nhân viên', color: 'default' },
      STA: { label: 'Giám sát viên', color: 'cyan' },
    };

    return (
      roleMap[roleCode] || {
        label: roleCode
          .split('_')
          .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
          .join(' '),
        color: 'blue',
      }
    );
  };

  const displayUsers = offset === 0 ? (data?.items ?? accumulatedUsers) : accumulatedUsers;

  const currentUser = useCurrentUser();
  const isSuperAdmin = currentUser?.roles?.includes('SUPER_ADMIN');

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      destroyOnClose
      centered
      className="account-switch-modal"
      title={
        <div className="flex items-center justify-between pt-1 pb-2 border-0 border-b border-solid border-black/5 pr-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isSuperAdmin ? 'bg-red-50 text-red-600' : 'bg-purple-50 text-purple-600'
              }`}
            >
              <ArrowRightLeft size={18} />
            </div>
            <div>
              <Title level={5} style={{ margin: 0, fontWeight: 700 }}>
                {isSuperAdmin
                  ? 'Đóng vai Hỗ trợ Kỹ thuật Nền tảng'
                  : 'Đóng vai Tài khoản Nội bộ Doanh nghiệp'}
              </Title>
            </div>
          </div>
          <Tag color={isSuperAdmin ? 'red' : 'purple'} style={{ fontWeight: 600 }}>
            {isSuperAdmin ? 'System Super Admin' : 'Tenant Admin'}
          </Tag>
        </div>
      }
    >
      <div className="py-3">
        <div
          className={`flex items-start gap-2.5 p-3 rounded-lg border border-solid mb-4 text-xs ${
            isSuperAdmin
              ? 'bg-red-50 border-red-200 text-red-900'
              : 'bg-purple-50 border-purple-200 text-purple-900'
          }`}
        >
          <ShieldAlert
            size={16}
            className={`shrink-0 mt-0.5 ${isSuperAdmin ? 'text-red-600' : 'text-purple-600'}`}
          />
          <div>
            <span className="font-semibold">
              {isSuperAdmin
                ? 'Lưu ý Hỗ trợ Kỹ thuật Cross-Tenant:'
                : 'Lưu ý Đóng vai Nội bộ:'}
            </span>{' '}
            {isSuperAdmin
              ? 'Với vai trò System Super Admin, bạn có quyền đóng vai tài khoản trên toàn sàn SaaS để hỗ trợ khách hàng. Mọi thao tác đều được ghi vết trong Platform Support Audit Log.'
              : 'Phạm vi đóng vai được giới hạn nghiêm ngặt trong nội bộ doanh nghiệp. Mọi thao tác thực hiện sẽ ghi vết người đóng vai trong Nhật ký kiểm toán.'}
          </div>
        </div>

        <div className="mb-4">
          <Input
            prefix={<Search size={16} className="text-text-secondary mr-1" />}
            placeholder="Tìm kiếm theo tên, email hoặc vai trò..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            allowClear
            size="large"
            className="!rounded-lg"
          />
        </div>

        <div className="max-h-[380px] overflow-y-auto pr-1 flex flex-col gap-2 scrollbar-thin scrollbar-thumb-gray-200">
          {isLoading && offset === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-text-secondary">
              <Spin size="medium" />
              <Text type="secondary" style={{ fontSize: 13 }}>
                Đang tải danh sách tài khoản...
              </Text>
            </div>
          ) : displayUsers.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span className="text-text-secondary text-xs">
                  {debouncedSearch
                    ? 'Không tìm thấy tài khoản phù hợp với từ khóa'
                    : 'Không tìm thấy tài khoản cấp dưới nào có thể đóng vai'}
                </span>
              }
              className="my-8"
            />
          ) : (
            displayUsers.map((target) => {
              const initials = (target.displayName || target.username || 'U').charAt(0).toUpperCase();

              return (
                <div
                  key={target.principalId}
                  className="flex items-center justify-between p-3 rounded-xl border border-solid border-black/5 hover:border-primary/30 hover:bg-primary/[0.02] transition-all duration-150 group"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                    <Avatar
                      size={40}
                      src={target.avatarUrl ? `/api/v1/files/${target.avatarUrl}/view` : undefined}
                      style={{
                        background: !target.avatarUrl
                          ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                          : undefined,
                        color: !target.avatarUrl ? '#fff' : undefined,
                        fontWeight: 700,
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      {!target.avatarUrl && initials}
                    </Avatar>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <Text className="font-semibold text-sm text-text-primary" ellipsis>
                          {target.displayName || target.username}
                        </Text>
                      </div>

                      <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                        {target.email}
                      </Text>

                      <div className="flex flex-wrap gap-1 mt-1">
                        {target.roles.map((roleCode) => {
                          const info = formatRoleLabel(roleCode);
                          return (
                            <Tag
                              key={roleCode}
                              color={info.color}
                              className="!mr-0 !text-[10px] !leading-[18px] !px-1.5 !rounded-md"
                            >
                              {info.label}
                            </Tag>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="primary"
                    ghost
                    size="middle"
                    icon={<ArrowRightLeft size={14} />}
                    loading={switchAccount.isPending && switchAccount.variables === target.principalId}
                    onClick={() => handleSwitch(target.principalId)}
                    className="!rounded-lg font-medium shadow-none group-hover:!bg-primary group-hover:!text-white transition-all duration-150"
                  >
                    Đóng vai
                  </Button>
                </div>
              );
            })
          )}

          {/* Load More Pagination Button */}
          {data?.hasMore && (
            <div className="flex flex-col items-center justify-center pt-3 pb-1">
              <Button
                type="dashed"
                onClick={handleLoadMore}
                loading={isFetching && offset > 0}
                icon={<ChevronDown size={14} />}
                className="w-full !rounded-lg !text-text-secondary font-medium hover:!text-primary hover:!border-primary"
              >
                Hiển thị thêm tài khoản ({displayUsers.length} / {data.total})
              </Button>
            </div>
          )}
        </div>

        {/* Footer info count */}
        {data && data.total > 0 && (
          <div className="mt-3 pt-2 border-0 border-t border-solid border-black/5 flex items-center justify-between text-xs text-text-secondary">
            <span>
              Tổng số tài khoản khả dụng: <strong>{data.total}</strong>
            </span>
            <span>Trang {Math.floor(offset / PAGE_SIZE) + 1}</span>
          </div>
        )}
      </div>
    </Modal>
  );
}
