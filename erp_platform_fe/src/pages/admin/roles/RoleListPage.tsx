import { useState } from 'react';
import { Card, Typography, Row, Col, Space, Tag, Badge, Button, Modal, Form, Input, Empty, Spin } from 'antd';
import { Shield, Plus, Users, Lock } from 'lucide-react';
import { FilterBar } from '@shared/components/FilterBar';
import type { FilterBarField } from '@shared/components/FilterBar';
import { useRoles, useCreateRole } from '@features/rbac/hooks/useRbac';
import { useAuthStore } from '@features/auth/store/authStore';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function RoleListPage() {
  const navigate = useNavigate();
  const tenantId = useAuthStore((s) => s.user?.tenantId || '');
  const { data: roles = [], isLoading } = useRoles(tenantId);
  const createMutation = useCreateRole();

  const [filters, setFilters] = useState<Record<string, any>>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filterFields: FilterBarField[] = [
    {
      key: 'search',
      type: 'text',
      placeholder: 'Tìm kiếm vai trò...',
      span: 8,
    },
    {
      key: 'type',
      type: 'select',
      placeholder: 'Loại vai trò',
      options: [
        { label: 'Tất cả', value: '' },
        { label: 'System (Hệ thống)', value: 'system' },
        { label: 'Custom (Tùy chỉnh)', value: 'custom' },
      ],
      span: 6,
    },
  ];

  // Client-side filtering
  const filteredRoles = roles.filter((role) => {
    const search = filters.search?.toLowerCase() || '';
    const type = filters.type || '';

    const matchSearch =
      !search ||
      role.name?.toLowerCase().includes(search) ||
      role.code?.toLowerCase().includes(search) ||
      role.description?.toLowerCase().includes(search);

    const matchType =
      !type ||
      (type === 'system' && role.isSystem) ||
      (type === 'custom' && !role.isSystem);

    return matchSearch && matchType;
  });

  const handleCreateRole = (values: { code: string; name: string; description?: string }) => {
    createMutation.mutate(
      { tenantId, ...values },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
          form.resetFields();
        },
      },
    );
  };

  const getRoleColor = (code?: string): string => {
    switch (code) {
      case 'SUPER_ADMIN': return '#f5222d';
      case 'HR_MANAGER': return '#1890ff';
      case 'HR_SPECIALIST': return '#13c2c2';
      case 'RECRUITER': return '#722ed1';
      case 'PAYROLL_OFFICER': return '#fa8c16';
      case 'EMPLOYEE': return '#52c41a';
      case 'ASSET_MANAGER': return '#eb2f96';
      default: return '#8c8c8c';
    }
  };

  const getRoleIcon = (code?: string) => {
    if (code === 'SUPER_ADMIN') return <Lock size={28} />;
    if (code === 'HR_MANAGER') return <Users size={28} />;
    return <Shield size={28} />;
  };

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space direction="vertical" size={4}>
            <Title level={4} style={{ margin: 0 }}>Quản lý vai trò & quyền hạn</Title>
            <Text type="secondary">Thiết lập và quản lý vai trò hệ thống, phân quyền truy cập theo mô hình AWS IAM.</Text>
          </Space>
        </Col>
      </Row>

      <FilterBar
        values={filters}
        onChange={handleFilterChange}
        fields={filterFields}
        extra={
          <Button
            type="primary"
            icon={<Plus size={14} />}
            onClick={() => setIsCreateModalOpen(true)}
            style={{ borderRadius: 6 }}
          >
            Tạo vai trò mới
          </Button>
        }
      />

      {isLoading ? (
        <div style={{ padding: 60, textAlign: 'center' }}><Spin /></div>
      ) : filteredRoles.length === 0 ? (
        <Card style={{ borderRadius: 12 }}>
          <Empty description="Không tìm thấy vai trò nào." />
        </Card>
      ) : (
        <Row gutter={[20, 20]}>
          {filteredRoles.map((role) => {
            const permCount = role.rolePermissions?.length || 0;
            const userCount = role.principalRoles?.length || 0;
            const color = getRoleColor(role.code);

            return (
              <Col xs={24} sm={12} lg={8} xl={6} key={role.id}>
                <Card
                  hoverable
                  onClick={() => navigate(`/admin/roles/${role.id}`)}
                  style={{
                    borderRadius: 12,
                    borderTop: `3px solid ${color}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                    height: '100%',
                  }}
                  styles={{ body: { padding: 20 } }}
                >
                  <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: `${color}15`,
                          color: color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {getRoleIcon(role.code)}
                      </div>
                      {role.isSystem && (
                        <Tag color="orange" style={{ fontSize: 10, margin: 0 }}>System</Tag>
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <Text strong style={{ fontSize: 15, display: 'block' }}>{role.name || role.code}</Text>
                      <Text code style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{role.code}</Text>
                    </div>

                    {role.description && (
                      <Text type="secondary" style={{ fontSize: 12, lineHeight: 1.5 }}>
                        {role.description.length > 80 ? `${role.description.slice(0, 80)}...` : role.description}
                      </Text>
                    )}

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: 16, borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
                      <Space size={4}>
                        <Badge status="processing" />
                        <Text type="secondary" style={{ fontSize: 11 }}>{permCount} quyền</Text>
                      </Space>
                      <Space size={4}>
                        <Badge status="success" />
                        <Text type="secondary" style={{ fontSize: 11 }}>{userCount} người dùng</Text>
                      </Space>
                    </div>
                  </Space>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Create Role Modal */}
      <Modal
        title="Tạo vai trò mới"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateRole} style={{ marginTop: 16 }}>
          <Form.Item
            name="code"
            label="Mã vai trò"
            rules={[{ required: true, message: 'Vui lòng nhập mã vai trò' }]}
            extra="Ví dụ: HR_SPECIALIST, PAYROLL_OFFICER"
          >
            <Input placeholder="VD: HR_SPECIALIST" style={{ textTransform: 'uppercase' }} />
          </Form.Item>
          <Form.Item
            name="name"
            label="Tên vai trò"
            rules={[{ required: true, message: 'Vui lòng nhập tên vai trò' }]}
          >
            <Input placeholder="VD: Chuyên viên nhân sự" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea placeholder="Mô tả chức năng và phạm vi của vai trò" rows={3} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsCreateModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending}>Tạo vai trò</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
