import { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { Lock, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '@features/auth/api/authApi';

const { Title, Text } = Typography;

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);

  // Xử lý chuyển hướng tự động sau khi đặt lại mật khẩu thành công
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
    if (!token) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await authApi.resetPassword({
        token,
        newPassword: values.newPassword,
      });
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
        err?.message ||
        'Đã xảy ra lỗi khi đặt lại mật khẩu. Mã xác nhận có thể đã hết hạn hoặc không hợp lệ.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="flex flex-col animate-[authCardEnter_0.3s_ease]">
        <Title level={3} style={{ marginBottom: 4, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Đặt lại mật khẩu
        </Title>
        <Text type="secondary" style={{ display: 'block', fontSize: 13, marginBottom: 24 }}>
          Cổng đặt lại mật khẩu an toàn
        </Text>
        <Alert
          message="Liên kết không hợp lệ"
          description="Thiếu mã xác nhận đặt lại mật khẩu hoặc liên kết đã bị thay đổi cấu trúc. Vui lòng yêu cầu lại liên kết mới từ trang Quên mật khẩu."
          type="error"
          showIcon
        />
        <div className="text-center mt-6">
          <a
            href="/forgot-password"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Yêu cầu liên kết mới</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col [&_.ant-form-item]:!mb-5 [&_.ant-form-item-label]:!pb-1.5 [&_.ant-form-item-label_label]:!text-xs [&_.ant-form-item-label_label]:!font-semibold [&_.ant-form-item-label_label]:!text-text-secondary [&_.ant-input-affix-wrapper]:!rounded-lg [&_.ant-input-affix-wrapper]:!border-border [&_.ant-input-affix-wrapper:hover]:!border-primary/40">
      <Title level={3} style={{ marginBottom: 4, fontWeight: 700, letterSpacing: '-0.02em' }}>
        Đặt lại mật khẩu
      </Title>
      <Text type="secondary" style={{ display: 'block', fontSize: 13, marginBottom: 24 }}>
        Thiết lập mật khẩu mới cho tài khoản của bạn
      </Text>

      {success ? (
        <div className="flex flex-col gap-6 items-center text-center animate-[authCardEnter_0.3s_ease]">
          <div className="w-12 h-12 rounded-full bg-[#ecfdf5] text-[#10b981] flex items-center justify-center shadow-sm">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h4 className="text-[15px] font-bold text-text-primary mb-1">Mật khẩu đã đặt lại thành công!</h4>
            <p className="text-[13px] text-text-secondary">
              Mật khẩu của bạn đã được thay đổi. Hệ thống đang chuyển bạn về trang Đăng nhập sau {countdown} giây...
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

          {/* Mật khẩu mới */}
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 8, message: 'Mật khẩu phải có độ dài ít nhất 8 ký tự' },
              {
                pattern: /^(?=.*[A-Za-z])(?=.*\d)/,
                message: 'Mật khẩu phải chứa cả chữ cái và chữ số'
              }
            ]}
          >
            <Input.Password
              prefix={<Lock size={16} style={{ color: 'var(--color-text-tertiary)', marginRight: 4 }} />}
              placeholder="Nhập ít nhất 8 ký tự"
              autoFocus
            />
          </Form.Item>

          {/* Xác nhận mật khẩu mới */}
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<Lock size={16} style={{ color: 'var(--color-text-tertiary)', marginRight: 4 }} />}
              placeholder="Nhập lại mật khẩu mới"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
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
              Cập nhật mật khẩu mới
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
}

export default ResetPasswordPage;
