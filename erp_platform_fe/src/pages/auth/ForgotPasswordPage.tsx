import { useState } from 'react';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { Mail, ChevronLeft } from 'lucide-react';
import { authApi } from '@features/auth/api/authApi';

const { Title, Text } = Typography;

interface ForgotPasswordFormValues {
  email: string;
}

function ForgotPasswordPage() {
  const [form] = Form.useForm<ForgotPasswordFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await authApi.forgotPassword(values.email);
      setSuccess(true);
      form.resetFields();
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
        err?.message ||
        'Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col [&_.ant-form-item]:!mb-5 [&_.ant-form-item-label]:!pb-1.5 [&_.ant-form-item-label_label]:!text-xs [&_.ant-form-item-label_label]:!font-semibold [&_.ant-form-item-label_label]:!text-text-secondary [&_.ant-input-affix-wrapper]:!rounded-lg [&_.ant-input-affix-wrapper]:!border-border [&_.ant-input-affix-wrapper:hover]:!border-primary/40">
      <Title level={3} style={{ marginBottom: 4, fontWeight: 700, letterSpacing: '-0.02em' }}>
        Quên mật khẩu?
      </Title>
      <Text type="secondary" style={{ display: 'block', fontSize: 13, marginBottom: 24 }}>
        Nhập email của bạn để nhận liên kết đặt lại mật khẩu
      </Text>

      {success ? (
        <div className="flex flex-col gap-5 animate-[authCardEnter_0.3s_ease]">
          <Alert
            message="Yêu cầu thành công"
            description="Một liên kết đặt lại mật khẩu đã được gửi đến email của bạn nếu tài khoản đó tồn tại trên hệ thống. Trên môi trường phát triển (Dev), hãy kiểm tra log terminal của Back-End để nhấp trực tiếp vào liên kết."
            type="success"
            showIcon
          />
          <a
            href="/login"
            className="flex items-center justify-center gap-2 h-11 border border-solid border-border hover:border-primary hover:text-primary rounded-xl text-[13px] font-semibold text-text-secondary cursor-pointer transition-all duration-200"
          >
            <ChevronLeft size={16} />
            <span>Quay lại Đăng nhập</span>
          </a>
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

          <Form.Item
            name="email"
            label="Địa chỉ Email"
            rules={[
              { required: true, message: 'Vui lòng nhập địa chỉ email của bạn' },
              { type: 'email', message: 'Định dạng email không hợp lệ' }
            ]}
          >
            <Input
              prefix={<Mail size={16} style={{ color: 'var(--color-text-tertiary)', marginRight: 4 }} />}
              placeholder="admin@erp.com"
              autoFocus
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
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
              Gửi liên kết đặt lại mật khẩu
            </Button>
          </Form.Item>

          <div className="text-center">
            <a
              href="/login"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:text-primary-hover transition-colors"
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

export default ForgotPasswordPage;
