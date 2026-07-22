import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, Card, Button, Tag, Space, Typography, Input, Modal, Form, message, Badge, Row, Col } from 'antd';
import { Plus, Search, CheckCircle, XCircle, ShieldAlert, RefreshCw } from 'lucide-react';
import { httpClient } from '@shared/api/httpClient';

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

  // Mutation to create tenant
  const createTenantMutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await httpClient.post('/tenants', values);
      return res.data;
    },
    onSuccess: () => {
      message.success('Tạo doanh nghiệp mới thành công!');
      setIsModalOpen(false);
      form.resetFields();
      void queryClient.invalidateQueries({ queryKey: ['system-tenants'] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Không thể tạo doanh nghiệp.');
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

      {/* Modal create tenant */}
      <Modal
        title="Tạo Doanh nghiệp mới (Onboard Tenant)"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={createTenantMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={(values) => createTenantMutation.mutate(values)}>
          <Form.Item
            name="code"
            label="Mã Doanh nghiệp (Code)"
            rules={[{ required: true, message: 'Vui lòng nhập mã doanh nghiệp' }]}
          >
            <Input placeholder="ví dụ: vinamilk, fpt" />
          </Form.Item>
          <Form.Item
            name="name"
            label="Tên Doanh nghiệp"
            rules={[{ required: true, message: 'Vui lòng nhập tên doanh nghiệp' }]}
          >
            <Input placeholder="Công ty Cổ phần Tập đoàn..." />
          </Form.Item>
          <Form.Item name="legalName" label="Tên Pháp lý">
            <Input placeholder="Tên đăng ký kinh doanh" />
          </Form.Item>
          <Form.Item name="taxCode" label="Mã số thuế">
            <Input placeholder="MST doanh nghiệp" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
