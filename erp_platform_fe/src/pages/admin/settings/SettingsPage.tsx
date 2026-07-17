import { useState } from 'react';
import { Card, Form, Input, Button, Tabs, Switch, Select, Row, Col, Space, Typography, message, Divider } from 'antd';
import { Building2, Mail, Shield, Save } from 'lucide-react';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function SettingsPage() {
  const [form] = Form.useForm();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (values: any) => {
    setIsSaving(true);
    console.log('Saving settings:', values);
    // Simulate API call to save settings
    setTimeout(() => {
      setIsSaving(false);
      message.success('Đã lưu cấu hình hệ thống thành công!');
    }, 1000);
  };

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space direction="vertical" size={4}>
            <Title level={4} style={{ margin: 0 }}>Cấu hình Hệ thống</Title>
            <Text type="secondary">Quản trị viên thiết lập tham số hệ thống, kết nối máy chủ và chính sách bảo mật cho doanh nghiệp.</Text>
          </Space>
        </Col>
      </Row>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          companyName: 'Atlas Enterprise Platform Corp',
          taxCode: '0109283746',
          timezone: 'Asia/Ho_Chi_Minh',
          currency: 'VND',
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          smtpUser: 'noreply@erp-atlas.com',
          emailPayroll: true,
          emailLeave: true,
          passwordPolicy: 'strong',
          twoFactor: false,
          sessionTimeout: 60,
        }}
        onFinish={handleSave}
      >
        <Card
          style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
          styles={{ body: { padding: '12px 24px 24px 24px' } }}
        >
          <Tabs defaultActiveKey="1">
            {/* Tab 1: Company Profile */}
            <TabPane
              tab={
                <Space>
                  <Building2 size={16} />
                  <span>Doanh nghiệp</span>
                </Space>
              }
              key="1"
            >
              <div style={{ padding: '16px 0' }}>
                <Row gutter={24}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="companyName"
                      label="Tên doanh nghiệp"
                      rules={[{ required: true, message: 'Nhập tên doanh nghiệp' }]}
                    >
                      <Input placeholder="Ví dụ: Công ty Cổ phần Atlas" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="taxCode"
                      label="Mã số thuế"
                      rules={[{ required: true, message: 'Nhập mã số thuế' }]}
                    >
                      <Input placeholder="Ví dụ: 0101234567" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={24}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="timezone"
                      label="Múi giờ hệ thống"
                      rules={[{ required: true }]}
                    >
                      <Select>
                        <Select.Option value="Asia/Ho_Chi_Minh">(GMT+07:00) Asia/Ho_Chi_Minh</Select.Option>
                        <Select.Option value="Asia/Tokyo">(GMT+09:00) Asia/Tokyo</Select.Option>
                        <Select.Option value="America/New_York">(GMT-05:00) America/New_York</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="currency"
                      label="Đơn vị tiền tệ chính"
                      rules={[{ required: true }]}
                    >
                      <Select>
                        <Select.Option value="VND">VND (₫)</Select.Option>
                        <Select.Option value="USD">USD ($)</Select.Option>
                        <Select.Option value="EUR">EUR (€)</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </TabPane>

            {/* Tab 2: Mail & Notification */}
            <TabPane
              tab={
                <Space>
                  <Mail size={16} />
                  <span>Email & Thông báo</span>
                </Space>
              }
              key="2"
            >
              <div style={{ padding: '16px 0' }}>
                <Title level={5} style={{ margin: '0 0 16px 0' }}>Cấu hình Máy chủ gửi thư (SMTP)</Title>
                <Row gutter={24}>
                  <Col xs={24} md={12}>
                    <Form.Item name="smtpHost" label="SMTP Host">
                      <Input placeholder="Ví dụ: smtp.gmail.com" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Form.Item name="smtpPort" label="Port">
                      <Input placeholder="Ví dụ: 587" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={6}>
                    <Form.Item name="smtpUser" label="Email gửi tin">
                      <Input placeholder="Ví dụ: system@company.com" />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider style={{ margin: '12px 0 24px 0' }} />

                <Title level={5} style={{ margin: '0 0 16px 0' }}>Tự động gửi thông báo</Title>
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Text strong style={{ display: 'block' }}>Gửi phiếu lương tự động qua email</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>Tự động gửi payslip cho nhân viên sau khi chu kỳ tính lương được xác nhận.</Text>
                    </Col>
                    <Col>
                      <Form.Item name="emailPayroll" valuePropName="checked" style={{ margin: 0 }}>
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row justify="space-between" align="middle">
                    <Col>
                      <Text strong style={{ display: 'block' }}>Gửi email duyệt đơn nghỉ phép</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>Tự động gửi email thông báo cho quản lý khi nhân viên tạo yêu cầu nghỉ phép mới.</Text>
                    </Col>
                    <Col>
                      <Form.Item name="emailLeave" valuePropName="checked" style={{ margin: 0 }}>
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>
                </Space>
              </div>
            </TabPane>

            {/* Tab 3: Security */}
            <TabPane
              tab={
                <Space>
                  <Shield size={16} />
                  <span>Bảo mật</span>
                </Space>
              }
              key="3"
            >
              <div style={{ padding: '16px 0' }}>
                <Row gutter={24}>
                  <Col xs={24} md={12}>
                    <Form.Item name="passwordPolicy" label="Độ phức tạp mật khẩu tối thiểu">
                      <Select>
                        <Select.Option value="low">Yếu (Tối thiểu 6 ký tự bất kỳ)</Select.Option>
                        <Select.Option value="medium">Trung bình (8 ký tự, bao gồm cả số)</Select.Option>
                        <Select.Option value="strong">Mạnh (8 ký tự, chữ hoa, thường, số, ký tự đặc biệt)</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="sessionTimeout" label="Thời gian tự động đăng xuất (Phút)">
                      <Select>
                        <Select.Option value={15}>15 phút</Select.Option>
                        <Select.Option value={30}>30 phút</Select.Option>
                        <Select.Option value={60}>60 phút</Select.Option>
                        <Select.Option value={120}>120 phút</Select.Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row justify="space-between" align="middle" style={{ marginTop: 8 }}>
                  <Col>
                    <Text strong style={{ display: 'block' }}>Bảo mật hai lớp (2FA)</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>Yêu cầu tất cả nhân sự thiết lập mã OTP xác thực (Google Authenticator) khi đăng nhập.</Text>
                  </Col>
                  <Col>
                    <Form.Item name="twoFactor" valuePropName="checked" style={{ margin: 0 }}>
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
            </TabPane>
          </Tabs>

          <Divider style={{ margin: '24px 0 16px 0' }} />

          <div style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<Save size={16} />}
              loading={isSaving}
              style={{ borderRadius: 6, height: 40, padding: '0 24px' }}
            >
              Lưu cài đặt
            </Button>
          </div>
        </Card>
      </Form>
    </div>
  );
}
