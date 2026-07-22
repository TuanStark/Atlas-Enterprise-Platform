import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Card, Button, Tag, Space, Typography, Input, Modal, Form, message, Badge, Row, Col, Divider } from 'antd';
import { Plus, Search, CheckCircle, XCircle, ShieldAlert, RefreshCw, ArrowRightLeft } from 'lucide-react';
import { httpClient } from '@shared/api/httpClient';
import { useSwitchAccount } from '@features/account-switch/hooks/useAccountSwitch';

const { Title, Text } = Typography;

interface TenantData {
  id: string;
  code: string;
  name: string;
  legalName?: string;
  taxCode?: string;
  phone?: string;
  status: 'ACTIVE' | 'inACTIVE' | 'suspended';
  createdAt: string;
}

export default function SystemTenantPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Query all tenants (Platform Level API)
  const { data: tenants = [], isLoading, refetch } = useQuery<TenantData[]>({
    queryKey: ['system-tenants'],
    queryFn: async () => {
      const res = await httpClient.get<TenantData[]>('/tenants');
      return Array.isArray(res.data) ? res.data : (res.data as any)?.items || [];
    },
  });

  // Mutation to onboard new tenant + initial admin user
  const createTenantMutation = useMutation({
    mutationFn: async (values: any) => {
      const payload = {
        code: values.code,
        name: values.name,
        legalName: values.legalName,
        taxCode: values.taxCode,
        phone: values.phone,
        adminEmail: values.adminEmail,
        adminPassword: values.adminPassword,
        adminFirstName: values.adminFirstName,
        adminLastName: values.adminLastName,
      };
      const res = await httpClient.post('/auth/register-tenant', payload);
      return res.data;
    },
    onSuccess: () => {
      message.success('Khởi tạo doanh nghiệp & tài khoản Admin đầu tiên thành công!');
      setIsModalOpen(false);
      form.resetFields();
      void queryClient.invalidateQueries({ queryKey: ['system-tenants'] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Khởi tạo doanh nghiệp thất bại.');
    },
  });

  // Mutation to toggle tenant status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const endpoint = status === 'ACTIVE' ? `/tenants/${id}/deactivate` : `/tenants/${id}/activate`;
      await httpClient.patch(endpoint);
    },
    onSuccess: () => {
      message.success('Cập nhật trạng thái doanh nghiệp thành công!');
      void queryClient.invalidateQueries({ queryKey: ['system-tenants'] });
    },
    onError: () => {
      message.error('Thao tác đổi trạng thái thất bại.');
    },
  });

  const filteredTenants = tenants.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const switchAccount = useSwitchAccount();

  const handleSupportImpersonate = async (tenantRecord: TenantData) => {
    try {
      const res = await httpClient.get<any[]>(`/users?tenantId=${tenantRecord.id}`);
      const tenantUsers = res.data || [];
      if (tenantUsers.length === 0) {
        message.warning('Doanh nghiệp này chưa có tài khoản người dùng.');
        return;
      }
      const adminUser = tenantUsers.find((u) => u.roles?.includes('ADMIN')) || tenantUsers[0];
      const targetPrincipalId = adminUser.principalId || adminUser.principal?.id;
      if (!targetPrincipalId) {
        message.error('Không tìm thấy Principal ID của tài khoản quản trị.');
        return;
      }
      switchAccount.mutate(targetPrincipalId);
    } catch {
      message.error('Không thể kết nối đến tài khoản doanh nghiệp.');
    }
  };

  const columns = [
    {
      title: 'Mã Doanh nghiệp',
      dataIndex: 'code',
      key: 'code',
      render: (code: string) => (
        <Tag color="blue" style={{ fontWeight: 600 }}>
          {code}
        </Tag>
      ),
    },
    {
      title: 'Tên Doanh nghiệp',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: TenantData) => (
        <div>
          <Text strong>{name}</Text>
          {record.legalName && (
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.legalName}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone?: string) => phone || '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge
          status={status === 'ACTIVE' ? 'success' : 'error'}
          text={status === 'ACTIVE' ? 'Hoạt động' : 'Tạm dừng'}
        />
      ),
    },
    {
      title: 'Ngày khởi tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date?: string) => (date ? new Date(date).toLocaleDateString('vi-VN') : '—'),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_: any, record: TenantData) => (
        <Space size={6}>
          <Button
            size="small"
            type="default"
            icon={<ArrowRightLeft size={13} />}
            loading={switchAccount.isPending}
            onClick={() => handleSupportImpersonate(record)}
          >
            Hỗ trợ Kỹ thuật
          </Button>
          <Button
            size="small"
            danger={record.status === 'ACTIVE'}
            icon={record.status === 'ACTIVE' ? <XCircle size={14} /> : <CheckCircle size={14} />}
            onClick={() =>
              toggleStatusMutation.mutate({ id: record.id, status: record.status })
            }
          >
            {record.status === 'ACTIVE' ? 'Tạm dừng' : 'Kích hoạt'}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space direction="vertical" size={4}>
            <Space align="center">
              <Title level={4} style={{ margin: 0 }}>
                Quản lý Doanh nghiệp (Platform Tenants)
              </Title>
              <Tag color="red" icon={<ShieldAlert size={12} style={{ marginRight: 4 }} />}>
                System Super Admin Only
              </Tag>
            </Space>
            <Text type="secondary">
              Quản lý danh sách các tập đoàn và doanh nghiệp khách hàng trên nền tảng SaaS Multi-Tenant.
            </Text>
          </Space>
        </Col>
        <Col>
          <Space>
            <Button icon={<RefreshCw size={14} />} onClick={() => refetch()}>
              Làm mới
            </Button>
            <Button type="primary" icon={<Plus size={14} />} onClick={() => setIsModalOpen(true)}>
              Tạo Doanh nghiệp mới
            </Button>
          </Space>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Input
          prefix={<Search size={16} style={{ color: '#bfbfbf' }} />}
          placeholder="Tìm kiếm theo tên hoặc mã doanh nghiệp..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          style={{ maxWidth: 400 }}
        />
      </Card>

      <Card bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={filteredTenants}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Modal create tenant + initial admin account */}
      <Modal
        title="Tạo Doanh nghiệp mới & Tài khoản Admin ban đầu"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createTenantMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={(values) => createTenantMutation.mutate(values)}>
          <Divider style={{ margin: '12px 0', fontSize: 13, color: '#1890ff' }}>
            1. THÔNG TIN DOANH NGHIỆP (ENTERPRISE WORKSPACE)
          </Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Mã Doanh nghiệp (Tenant Code)"
                rules={[{ required: true, message: 'Vui lòng nhập mã doanh nghiệp' }]}
              >
                <Input placeholder="ví dụ: vinamilk, fpt" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên Doanh nghiệp"
                rules={[{ required: true, message: 'Vui lòng nhập tên doanh nghiệp' }]}
              >
                <Input placeholder="Công ty Cổ phần Tập đoàn..." />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="legalName" label="Tên Pháp lý">
                <Input placeholder="Tên đăng ký kinh doanh" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="taxCode" label="Mã số thuế">
                <Input placeholder="Mã số thuế doanh nghiệp" />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ margin: '12px 0', fontSize: 13, color: '#722ed1' }}>
            2. TÀI KHOẢN QUẢN TRỊ VIÊN ĐẦU TIÊN (TENANT ADMIN)
          </Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="adminLastName"
                label="Họ"
                rules={[{ required: true, message: 'Vui lòng nhập họ' }]}
              >
                <Input placeholder="Nguyễn" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="adminFirstName"
                label="Tên"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
              >
                <Input placeholder="Văn A" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="adminEmail"
                label="Email đăng nhập Admin"
                rules={[
                  { required: true, message: 'Vui lòng nhập email admin' },
                  { type: 'email', message: 'Email không hợp lệ' },
                ]}
              >
                <Input placeholder="admin@company.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="adminPassword"
                label="Mật khẩu ban đầu"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu admin' }]}
              >
                <Input.Password placeholder="Mật khẩu bảo mật" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
