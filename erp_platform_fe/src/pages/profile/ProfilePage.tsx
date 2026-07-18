import { useEffect, useRef } from 'react';
import { Card, Form, Input, Button, Tabs, Row, Col, Space, Typography, message, Avatar, Spin, Divider } from 'antd';
import { User, Lock, Mail, Save, Key, Shield, UserCheck } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { httpClient } from '@shared/api';
import { useCurrentUser } from '@features/auth/hooks/useAuth';
import { useAuthStore } from '@features/auth/store/authStore';
import { FileUpload } from '@shared/components/FileUpload/FileUpload';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function ProfilePage() {
  const [profileForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const user = useCurrentUser();
  const updateUser = useAuthStore((state) => state.updateUser);
  const isInitialized = useRef(false);

  // Fetch full user profile details
  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['user-profile', user?.principalId],
    queryFn: async () => {
      const { data } = await httpClient.get<any>('/users/me');
      return data;
    },
    enabled: !!user?.principalId,
  });

  // Populate profile form on load
  useEffect(() => {
    if (profile && !isInitialized.current) {
      profileForm.setFieldsValue({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        displayName: profile.displayName || '',
      });
      isInitialized.current = true;
    }
  }, [profile, profileForm]);

  // Update profile details mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: any) => {
      const { data } = await httpClient.put<any>('/users/me', {
        firstName: values.firstName,
        lastName: values.lastName,
        displayName: values.displayName,
        avatarUrl: values.avatarUrl,
      });
      return data;
    },
    onSuccess: (updatedUser) => {
      message.success('Cập nhật hồ sơ cá nhân thành công!');
      updateUser({
        displayName: updatedUser.displayName,
        avatarUrl: updatedUser.avatarUrl,
      });
      void refetch();
    },
    onError: (error: any) => {
      message.error(error.message || 'Cập nhật thông tin thất bại');
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (values: any) => {
      const { data } = await httpClient.patch<any>(`/users/${user?.principalId}/change-password`, {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      return data;
    },
    onSuccess: () => {
      message.success('Đổi mật khẩu thành công!');
      securityForm.resetFields();
    },
    onError: (error: any) => {
      message.error(error.message || 'Thay đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.');
    },
  });

  const handleProfileSave = (values: any) => {
    updateProfileMutation.mutate({
      ...values,
      avatarUrl: profile?.avatarUrl,
    });
  };

  const handleSecuritySave = (values: any) => {
    changePasswordMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div style={{ padding: 48, textAlign: 'center' }}>
        <Spin size="large" tip="Đang tải thông tin cá nhân..." />
      </div>
    );
  }

  // Generate avatar initials
  const getInitials = () => {
    if (user?.displayName) return user.displayName.charAt(0).toUpperCase();
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space direction="vertical" size={4}>
            <Title level={4} style={{ margin: 0, fontWeight: 600 }}>Tài khoản của tôi</Title>
            <Text type="secondary">Quản lý hồ sơ cá nhân, thông tin liên hệ và cài đặt bảo mật.</Text>
          </Space>
        </Col>
      </Row>

      <Row gutter={24}>
        {/* Left column: Overview card */}
        <Col xs={24} md={8} style={{ marginBottom: 24 }}>
          <Card
            style={{
              borderRadius: 12,
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              textAlign: 'center',
              border: '1px solid rgba(0,0,0,0.04)',
              background: 'linear-gradient(to bottom, #ffffff, #fafafa)',
            }}
            styles={{ body: { padding: '32px 16px' } }}
          >
             <div style={{ position: 'relative', display: 'inline-block', marginBottom: 16 }}>
              <Avatar
                size={84}
                src={user?.avatarUrl ? `/api/v1/files/${user.avatarUrl}/view` : undefined}
                style={{
                  background: !user?.avatarUrl ? 'linear-gradient(135deg, #0a65ff, #004ecc)' : undefined,
                  fontSize: 32,
                  fontWeight: 600,
                  boxShadow: '0 8px 16px rgba(10, 101, 255, 0.15)',
                  border: '3px solid #fff',
                }}
              >
                {!user?.avatarUrl && getInitials()}
              </Avatar>
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  background: '#10b981',
                  color: '#fff',
                  borderRadius: '50%',
                  width: 22,
                  height: 22,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                <UserCheck size={12} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <FileUpload
                accept="image/*"
                onUploadSuccess={async (fileId) => {
                  await updateProfileMutation.mutateAsync({
                    firstName: profile?.firstName,
                    lastName: profile?.lastName,
                    displayName: profile?.displayName,
                    avatarUrl: fileId,
                  });
                }}
                showPreview={false}
              />
            </div>

            <Title level={5} style={{ margin: '0 0 4px 0', fontWeight: 600 }}>
              {user?.displayName || user?.username}
            </Title>
            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 16 }}>
              {user?.email}
            </Text>

            <Divider style={{ margin: '16px 0' }} />

            <div style={{ textAlign: 'left', padding: '0 8px' }}>
              <div style={{ marginBottom: 10 }}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>VAI TRÒ</Text>
                <Text strong style={{ fontSize: 13 }}>
                  {user?.roles?.join(', ') || 'Nhân viên'}
                </Text>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>DOANH NGHIỆP</Text>
                <Text strong style={{ fontSize: 13 }}>
                  {user?.tenant?.name ? `${user.tenant.name} (${user.tenant.code})` : 'Hệ thống'}
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        {/* Right column: Form Tabs */}
        <Col xs={24} md={16}>
          <Card
            style={{
              borderRadius: 12,
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.04)',
            }}
            styles={{ body: { padding: '12px 24px 24px 24px' } }}
          >
            <Tabs defaultActiveKey="1" size="large">
              {/* Tab 1: Profile Info */}
              <TabPane
                tab={
                  <Space size={8}>
                    <User size={16} />
                    <span>Thông tin hồ sơ</span>
                  </Space>
                }
                key="1"
              >
                <Form
                  form={profileForm}
                  layout="vertical"
                  onFinish={handleProfileSave}
                  style={{ paddingTop: 16 }}
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="lastName"
                        label="Họ"
                        rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
                      >
                        <Input
                          placeholder="Ví dụ: Nguyễn"
                          prefix={<User size={14} className="text-text-tertiary" style={{ marginRight: 6 }} />}
                          className="!h-10 !rounded-lg"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="firstName"
                        label="Tên"
                        rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
                      >
                        <Input
                          placeholder="Ví dụ: Văn Nam"
                          prefix={<User size={14} className="text-text-tertiary" style={{ marginRight: 6 }} />}
                          className="!h-10 !rounded-lg"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="displayName"
                    label="Tên hiển thị"
                    rules={[{ required: true, message: 'Vui lòng nhập tên hiển thị' }]}
                  >
                    <Input
                      placeholder="Tên đại diện hiển thị trên hệ thống"
                      prefix={<User size={14} className="text-text-tertiary" style={{ marginRight: 6 }} />}
                      className="!h-10 !rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Địa chỉ Email"
                    tooltip="Email dùng để đăng nhập và không thể thay đổi."
                  >
                    <Input
                      value={profile?.email}
                      disabled
                      prefix={<Mail size={14} className="text-text-tertiary" style={{ marginRight: 6 }} />}
                      className="!h-10 !rounded-lg !bg-bg-secondary"
                    />
                  </Form.Item>

                  <Divider style={{ margin: '24px 0 16px 0' }} />

                  <div style={{ textAlign: 'right' }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<Save size={16} />}
                      loading={updateProfileMutation.isPending}
                      style={{ borderRadius: 6, height: 40, padding: '0 24px' }}
                    >
                      Lưu thay đổi
                    </Button>
                  </div>
                </Form>
              </TabPane>

              {/* Tab 2: Security & Password */}
              <TabPane
                tab={
                  <Space size={8}>
                    <Shield size={16} />
                    <span>Mật khẩu & Bảo mật</span>
                  </Space>
                }
                key="2"
              >
                <Form
                  form={securityForm}
                  layout="vertical"
                  onFinish={handleSecuritySave}
                  style={{ paddingTop: 16 }}
                >
                  <Form.Item
                    name="oldPassword"
                    label="Mật khẩu hiện tại"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
                  >
                    <Input.Password
                      placeholder="Nhập mật khẩu đang sử dụng"
                      prefix={<Key size={14} className="text-text-tertiary" style={{ marginRight: 6 }} />}
                      className="!h-10 !rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item
                    name="newPassword"
                    label="Mật khẩu mới"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                      { min: 8, message: 'Mật khẩu phải tối thiểu 8 ký tự' },
                    ]}
                  >
                    <Input.Password
                      placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                      prefix={<Lock size={14} className="text-text-tertiary" style={{ marginRight: 6 }} />}
                      className="!h-10 !rounded-lg"
                    />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label="Xác nhận mật khẩu mới"
                    dependencies={['newPassword']}
                    rules={[
                      { required: true, message: 'Vui lòng nhập lại mật khẩu mới' },
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
                      placeholder="Nhập lại mật khẩu mới để xác nhận"
                      prefix={<Lock size={14} className="text-text-tertiary" style={{ marginRight: 6 }} />}
                      className="!h-10 !rounded-lg"
                    />
                  </Form.Item>

                  <Divider style={{ margin: '24px 0 16px 0' }} />

                  <div style={{ textAlign: 'right' }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<Save size={16} />}
                      loading={changePasswordMutation.isPending}
                      style={{ borderRadius: 6, height: 40, padding: '0 24px' }}
                    >
                      Đổi mật khẩu
                    </Button>
                  </div>
                </Form>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
