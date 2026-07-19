import { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Alert, Divider } from 'antd';
import { Mail, Lock, Building, User, Phone, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@features/auth/api/authApi';
import type { RegisterTenantRequest } from '@shared/types';

const { Title, Text } = Typography;

function RegisterTenantPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm<RegisterTenantRequest>();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (!success) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/login');
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [success, navigate]);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    setErrorMsg(null);

    const payload: RegisterTenantRequest = {
      ...values,
      code: values.code.toLowerCase().trim().replace(/[^a-z0-9-]/g, ''),
    };

    try {
      await authApi.registerTenant(payload);
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
        err?.message ||
        'Đã xảy ra lỗi trong quá trình đăng ký doanh nghiệp. Vui lòng thử lại.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col [&_.ant-form-item]:!mb-4 [&_.ant-form-item-label]:!pb-1.5 [&_.ant-form-item-label_label]:!text-xs [&_.ant-form-item-label_label]:!font-semibold [&_.ant-form-item-label_label]:!text-text-secondary [&_.ant-input-affix-wrapper]:!rounded-lg [&_.ant-input-affix-wrapper]:!border-border [&_.ant-input-affix-wrapper:hover]:!border-primary/40">
      <Title level={3} style={{ marginBottom: 4, fontWeight: 700, letterSpacing: '-0.02em' }}>
        Đăng ký Doanh nghiệp
      </Title>
      <Text type="secondary" style={{ display: 'block', fontSize: 13, marginBottom: 20 }}>
        Khởi tạo không gian làm việc và tài khoản quản trị mới
      </Text>

      {success ? (
        <div className="flex flex-col gap-6 items-center text-center animate-[authCardEnter_0.3s_ease]">
          <div className="w-12 h-12 rounded-full bg-[#ecfdf5] text-[#10b981] flex items-center justify-center shadow-sm">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h4 className="text-[15px] font-bold text-text-primary mb-1">Đăng ký doanh nghiệp thành công!</h4>
            <p className="text-[13px] text-text-secondary px-2">
              Không gian làm việc đã sẵn sàng. Hệ thống đang chuyển bạn về trang Đăng nhập sau {countdown} giây...
            </p>
          </div>
          <Button
            type="primary"
            onClick={() => navigate('/login')}
            style={{
              height: 40,
              fontWeight: 600,
              borderRadius: 8,
              paddingLeft: 24,
              paddingRight: 24,
            }}
          >
            Đăng nhập ngay
          </Button>
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          size="large"
        >
          {errorMsg && (
            <div className="mb-4">
              <Alert message={errorMsg} type="error" showIcon />
            </div>
          )}

          {/* SECTION 1: Tenant Workspace Info */}
          <Divider titlePlacement="left" style={{ margin: '8px 0 16px 0', fontSize: 11, color: 'var(--color-text-tertiary)' }}>
            Thông tin Doanh nghiệp
          </Divider>

          <Form.Item
            name="code"
            label="Mã định danh Doanh nghiệp (Tenant Code)"
            rules={[
              { required: true, message: 'Vui lòng nhập mã định danh doanh nghiệp' },
              { pattern: /^[a-zA-Z0-9-]+$/, message: 'Mã định danh chỉ gồm chữ, số và dấu gạch ngang (-)' }
            ]}
          >
            <Input
              prefix={<Building size={16} style={{ color: 'var(--color-text-tertiary)', marginRight: 4 }} />}
              placeholder="Ví dụ: vinamilk, fpt-corp"
              autoFocus
            />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên doanh nghiệp"
            rules={[{ required: true, message: 'Vui lòng nhập tên doanh nghiệp của bạn' }]}
          >
            <Input
              prefix={<Building size={16} style={{ color: 'var(--color-text-tertiary)', marginRight: 4 }} />}
              placeholder="Ví dụ: Công ty Cổ phần sữa Việt Nam"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Số điện thoại doanh nghiệp"
          >
            <Input
              prefix={<Phone size={16} style={{ color: 'var(--color-text-tertiary)', marginRight: 4 }} />}
              placeholder="Nhập số điện thoại liên hệ"
            />
          </Form.Item>

          {/* SECTION 2: Initial Admin User Info */}
          <Divider titlePlacement="left" style={{ margin: '24px 0 16px 0', fontSize: 11, color: 'var(--color-text-tertiary)' }}>
            Tài khoản Quản trị khởi đầu
          </Divider>

          <div className="grid grid-cols-2 gap-3">
            <Form.Item
              name="adminLastName"
              label="Họ"
              rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
            >
              <Input
                prefix={<User size={16} style={{ color: 'var(--color-text-tertiary)', marginRight: 4 }} />}
                placeholder="Nguyễn"
              />
            </Form.Item>
            <Form.Item
              name="adminFirstName"
              label="Tên"
              rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
            >
              <Input
                prefix={<User size={16} style={{ color: 'var(--color-text-tertiary)', marginRight: 4 }} />}
                placeholder="Văn A"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="adminEmail"
            label="Email quản trị"
            rules={[
              { required: true, message: 'Vui lòng nhập email quản trị' },
              { type: 'email', message: 'Định dạng email không hợp lệ' }
            ]}
          >
            <Input
              prefix={<Mail size={16} style={{ color: 'var(--color-text-tertiary)', marginRight: 4 }} />}
              placeholder="admin@ten-cong-ty.com"
            />
          </Form.Item>

          <Form.Item
            name="adminPassword"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu tài khoản' },
              { min: 8, message: 'Mật khẩu phải chứa ít nhất 8 ký tự' }
            ]}
          >
            <Input.Password
              prefix={<Lock size={16} style={{ color: 'var(--color-text-tertiary)', marginRight: 4 }} />}
              placeholder="Nhập tối thiểu 8 ký tự"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              block
              style={{
                height: 44,
                fontWeight: 600,
                fontSize: 14,
                borderRadius: 8,
              }}
            >
              Đăng ký không gian làm việc
            </Button>
          </Form.Item>

          <div className="text-center mt-4">
            <a
              href="/login"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-text-secondary hover:text-primary transition-colors"
            >
              <ChevronLeft size={16} />
              <span>Quay lại đăng nhập</span>
            </a>
          </div>
        </Form>
      )}
    </div>
  );
}

export default RegisterTenantPage;
