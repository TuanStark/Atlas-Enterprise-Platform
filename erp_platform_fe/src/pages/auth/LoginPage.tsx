import { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography } from 'antd';
import { Lock, Mail, LogIn, X } from 'lucide-react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useAuthStore } from '@features/auth/store/authStore';

const { Title } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

interface SavedAccount {
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  lastLoginAt: number;
}

const LOCAL_STORAGE_KEY = 'atlas_saved_accounts';

const getSavedAccounts = (): SavedAccount[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) {
      // Khởi tạo tài khoản đề xuất để người dùng dễ dàng thử nghiệm
      const initial: SavedAccount[] = [
        {
          email: 'admin@erp.com',
          displayName: 'System Administrator',
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
          lastLoginAt: Date.now(),
        }
      ];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const saveAccount = (account: Omit<SavedAccount, 'lastLoginAt'>) => {
  try {
    const accounts = getSavedAccounts();
    const existingIndex = accounts.findIndex(a => a.email.toLowerCase() === account.email.toLowerCase());
    if (existingIndex > -1) {
      accounts[existingIndex] = {
        ...accounts[existingIndex],
        ...account,
        lastLoginAt: Date.now(),
      };
    } else {
      accounts.push({
        ...account,
        lastLoginAt: Date.now(),
      });
    }
    accounts.sort((a, b) => b.lastLoginAt - a.lastLoginAt);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(accounts));
  } catch (error) {
    console.error('Failed to save account:', error);
  }
};

const removeSavedAccount = (email: string) => {
  try {
    const accounts = getSavedAccounts();
    const filtered = accounts.filter(a => a.email.toLowerCase() !== email.toLowerCase());
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch {
    return [];
  }
};

function LoginPage() {
  const { login, isLoading } = useAuth();
  const [form] = Form.useForm<LoginFormValues>();
  const [submitting, setSubmitting] = useState(false);

  const [savedAccounts, setSavedAccounts] = useState<SavedAccount[]>(() => getSavedAccounts());

  const handleSubmit = async (values: LoginFormValues) => {
    setSubmitting(true);
    try {
      await login({
        email: values.email,
        password: values.password,
      });

      if (values.remember) {
        const user = useAuthStore.getState().user;
        if (user) {
          saveAccount({
            email: user.email,
            displayName: user.displayName || user.username || 'User',
            avatarUrl: user.avatarUrl,
          });
        }
      }
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectAccount = (account: SavedAccount) => {
    form.setFieldsValue({ email: account.email });
  };

  const handleRemoveAccount = (email: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeSavedAccount(email);
    setSavedAccounts(updated);
  };

  return (
    <div className="flex flex-col [&_.ant-form-item]:!mb-5 [&_.ant-form-item-label]:!pb-1.5 [&_.ant-form-item-label_label]:!text-xs [&_.ant-form-item-label_label]:!font-semibold [&_.ant-form-item-label_label]:!text-text-secondary [&_.ant-input-affix-wrapper]:!rounded-lg [&_.ant-input-affix-wrapper]:!border-border [&_.ant-input-affix-wrapper:hover]:!border-primary/40">
      {/* Tiêu đề chính */}
      <Title level={3} style={{ marginBottom: 4, fontWeight: 700, letterSpacing: '-0.02em' }}>
        Đăng nhập tài khoản
      </Title>
      {savedAccounts.length > 0 && (
        <div className="mb-6 animate-[authCardEnter_0.3s_ease] mt-4">
          <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
            {savedAccounts.map((account) => (
              <div
                key={account.email}
                onClick={() => handleSelectAccount(account)}
                className="group flex items-center justify-between bg-[#f8fafc] hover:bg-slate-50 border border-solid border-border/60 hover:border-primary/40 rounded-xl px-4 py-2.5 cursor-pointer transition-all duration-150 shadow-sm"
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-[13px] font-bold text-text-primary truncate">{account.displayName}</span>
                  <span className="text-[11px] text-text-secondary truncate">{account.email}</span>
                </div>
                <button
                  onClick={(e) => handleRemoveAccount(account.email, e)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-red-500 hover:bg-red-50/80 border-0 bg-transparent cursor-pointer transition-all duration-150 shrink-0"
                  title="Xóa tài khoản"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FORM ĐĂNG NHẬP CHÍNH */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        requiredMark={false}
        size="large"
        initialValues={{ email: savedAccounts[0]?.email || '', remember: true }}
      >
        {/* Địa chỉ Email */}
        <Form.Item
          name="email"
          label="Địa chỉ Email"
          rules={[
            { required: true, message: 'Vui lòng nhập email của bạn' },
            { type: 'email', message: 'Định dạng email không hợp lệ' }
          ]}
        >
          <Input
            prefix={<Mail size={16} style={{ color: 'var(--color-text-tertiary)', marginRight: 4 }} />}
            placeholder="admin@erp.com"
            autoFocus
          />
        </Form.Item>

        {/* Mật khẩu */}
        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu của bạn' }]}
        >
          <Input.Password
            prefix={<Lock size={16} style={{ color: 'var(--color-text-tertiary)', marginRight: 4 }} />}
            placeholder="••••••••"
          />
        </Form.Item>

        {/* Lựa chọn phụ */}
        <div className="flex items-center justify-between -mt-1 mb-6 [&_.ant-checkbox-wrapper]:text-[13px] [&_.ant-checkbox-wrapper]:text-text-secondary">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Ghi nhớ đăng nhập</Checkbox>
          </Form.Item>
          <a
            href="/forgot-password"
            className="text-[13px] font-semibold text-primary transition-colors duration-150 hover:text-primary-hover hover:no-underline"
          >
            Quên mật khẩu?
          </a>
        </div>

        {/* Nút đăng nhập */}
        <Form.Item style={{ marginBottom: 0 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting || isLoading}
            block
            icon={<LogIn size={16} />}
            style={{
              height: 44,
              fontWeight: 600,
              fontSize: 14,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>

      {/* SSO Separator */}
      {/* <Divider plain style={{ color: 'var(--color-text-tertiary)', fontSize: 11, margin: '20px 0 16px 0' }}>
        hoặc tiếp tục với
      </Divider> */}

      {/* SSO Grid */}
      {/* <div className="grid grid-cols-2 gap-3 mt-4 mb-4">
        <button
          className="flex items-center justify-center gap-2 h-[42px] border border-solid border-border bg-white rounded-lg text-[13px] font-semibold text-text-secondary cursor-pointer transition-all duration-150 hover:bg-bg-secondary hover:border-text-tertiary hover:text-text-primary"
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
          </svg>
          Google Workspace
        </button>
        <button
          className="flex items-center justify-center gap-2 h-[42px] border border-solid border-border bg-white rounded-lg text-[13px] font-semibold text-text-secondary cursor-pointer transition-all duration-150 hover:bg-bg-secondary hover:border-text-tertiary hover:text-text-primary"
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0h11v11H0z" fill="#F25022" />
            <path d="M12 0h11v11H12z" fill="#7FBA00" />
            <path d="M0 12h11v11H0z" fill="#00A4EF" />
            <path d="M12 12h11v11H12z" fill="#FFB900" />
          </svg>
          Microsoft
        </button>
      </div> */}

      {/* MFA Security Box */}
      {/* <div className="flex items-start gap-3 bg-primary-light border border-solid border-primary/10 rounded-xl p-3.5 mt-6">
        <div className="text-primary flex items-center justify-center shrink-0 mt-0.5">
          <ShieldAlert size={18} />
        </div>
        <div className="flex flex-col">
          <span className="text-[12px] font-bold text-primary mb-0.5">Xác thực đa yếu tố (MFA) đã được bật</span>
          <span className="text-[11px] text-text-secondary leading-relaxed">
            Vì lý do bảo mật, bạn có thể được yêu cầu xác thực danh tính sau khi đăng nhập.
          </span>
        </div>
      </div> */}

      {/* Footer copyright */}
      {/* <div className="flex justify-center items-center gap-2 text-[11px] text-text-tertiary mt-10 [&_a]:text-text-tertiary [&_a]:transition-colors [&_a]:duration-150 [&_a:hover]:text-primary">
        <span>© {new Date().getFullYear()} HRIMS.</span>
        <span>•</span>
        <a href="#privacy">Chính sách bảo mật</a>
        <span>•</span>
        <a href="#terms">Điều khoản</a>
      </div> */}
    </div>
  );
}

export default LoginPage;
