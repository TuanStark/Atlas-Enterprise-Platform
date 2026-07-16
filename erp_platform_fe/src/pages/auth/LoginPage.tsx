import { useState } from 'react';
import { Form, Input, Button, Checkbox, Typography, Divider } from 'antd';
import { Lock, User } from 'lucide-react';
import { useAuth } from '@features/auth/hooks/useAuth';
import './LoginPage.css';

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

/**
 * LoginPage — Maps to backend POST /auth/login
 */
function LoginPage() {
  const { login, isLoading } = useAuth();
  const [form] = Form.useForm<LoginFormValues>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: LoginFormValues) => {
    setSubmitting(true);
    try {
      await login({
        email: values.email,
        password: values.password,
      });
    } catch {
      // Error handled in useAuth hook
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <Title level={4} style={{ marginBottom: 4, textAlign: 'center' }}>
        Đăng nhập
      </Title>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
        Nhập thông tin tài khoản để truy cập hệ thống
      </Text>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        requiredMark={false}
        size="large"
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không đúng định dạng' }
          ]}
        >
          <Input
            prefix={<User size={16} style={{ color: 'var(--color-text-tertiary)' }} />}
            placeholder="Nhập email của bạn"
            autoFocus
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
        >
          <Input.Password
            prefix={<Lock size={16} style={{ color: 'var(--color-text-tertiary)' }} />}
            placeholder="Nhập mật khẩu"
          />
        </Form.Item>

        <div className="login-page__options">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Ghi nhớ đăng nhập</Checkbox>
          </Form.Item>
          <a href="/forgot-password" className="login-page__forgot">
            Quên mật khẩu?
          </a>
        </div>

        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting || isLoading}
            block
            style={{ height: 44, fontWeight: 600, fontSize: 15 }}
          >
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>

      <Divider plain style={{ color: 'var(--color-text-tertiary)', fontSize: 12 }}>
        hoặc đăng nhập bằng
      </Divider>

      <Button
        block
        style={{ height: 42 }}
        icon={
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
        }
      >
        Đăng nhập với Google (SSO)
      </Button>
    </div>
  );
}

export default LoginPage;
