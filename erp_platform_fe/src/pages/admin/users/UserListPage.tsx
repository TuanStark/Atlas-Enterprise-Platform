import { useState } from 'react';
import { Card, Table, Typography, Row, Col, Space, Tag, Avatar, Badge, Button, Modal, Select, Form, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import { Shield, KeyRound } from 'lucide-react';
import { FilterBar } from '@shared/components/FilterBar';
import type { FilterBarField } from '@shared/components/FilterBar';
import { useManagedUsers, useRoles, useAssignRoleToPrincipal, useRemoveRoleFromPrincipal } from '@features/rbac/hooks/useRbac';
import { useAuthStore } from '@features/auth/store/authStore';
import type { ManagedUser, PrincipalRole } from '@features/rbac/types';
import { useCanAccessCode } from '@shared/hooks/usePermission';
import { PERMISSIONS } from '@shared/constants/permissions';

const { Title, Text } = Typography;

const statusColors: Record<string, string> = {
  active: 'success',
  inactive: 'default',
  locked: 'error',
  suspended: 'warning',
};

const statusLabels: Record<string, string> = {
  active: 'Hoạt động',
  inactive: 'Chưa kích hoạt',
  locked: 'Bị khóa',
  suspended: 'Tạm ngưng',
};

export default function UserListPage() {
  const tenantId = useAuthStore((s) => s.user?.tenantId || '');
  const { data: users = [], isLoading } = useManagedUsers();
  const { data: roles = [] } = useRoles(tenantId);
  const assignMutation = useAssignRoleToPrincipal();
  const removeMutation = useRemoveRoleFromPrincipal();

  const canManageRoles = useCanAccessCode(PERMISSIONS.ADMIN.USER.UPDATE);

  const [filters, setFilters] = useState<Record<string, any>>({});
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [form] = Form.useForm();

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filterFields: FilterBarField[] = [
    {
      key: 'search',
      type: 'text',
      placeholder: 'Tìm kiếm theo tên, email...',
      span: 8,
    },
    {
      key: 'status',
      type: 'select',
      placeholder: 'Trạng thái tài khoản',
      options: [
        { label: 'Tất cả', value: '' },
        { label: 'Hoạt động', value: 'active' },
        { label: 'Chưa kích hoạt', value: 'inactive' },
        { label: 'Bị khóa', value: 'locked' },
        { label: 'Tạm ngưng', value: 'suspended' },
      ],
      span: 6,
    },
    {
      key: 'role',
      type: 'select',
      placeholder: 'Lọc theo vai trò',
      options: [
        { label: 'Tất cả', value: '' },
        ...roles.map((r) => ({ label: r.name || r.code || '', value: r.code || '' })),
      ],
      span: 6,
    },
  ];

  // Client-side filtering
  const filteredUsers = users.filter((user) => {
    const search = filters.search?.toLowerCase() || '';
    const status = filters.status || '';
    const role = filters.role || '';

    const matchSearch =
      !search ||
      (user.username || user.displayName || '').toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.principal?.displayName?.toLowerCase().includes(search);

    const matchStatus = !status || user.principal?.status === status;

    const matchRole =
      !role ||
      user.principal?.principalRoles?.some((pr) => pr.role?.code === role);

    return matchSearch && matchStatus && matchRole;
  });

  const openAssignModal = (user: ManagedUser) => {
    setSelectedUser(user);
    form.resetFields();
    setIsAssignModalOpen(true);
  };

  const handleAssignRole = (values: { roleId: string }) => {
    if (!selectedUser?.principalId) return;
    assignMutation.mutate(
      {
        principalId: selectedUser.principalId,
        roleId: values.roleId,
        scopeId: 'GLOBAL', // will be resolved server-side
      },
      {
        onSuccess: () => {
          setIsAssignModalOpen(false);
          form.resetFields();
        },
      },
    );
  };

  const handleRemoveRole = (principalId: string, roleId: string, scopeId: string) => {
    Modal.confirm({
      title: 'Thu hồi vai trò',
      content: 'Bạn có chắc chắn muốn thu hồi vai trò này khỏi người dùng?',
      okText: 'Thu hồi',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => removeMutation.mutate({ principalId, roleId, scopeId }),
    });
  };

  const columns: TableColumnsType<ManagedUser> = [
    {
      title: 'Người dùng',
      key: 'user',
      width: 280,
      render: (_, record) => {
        const name = record.principal?.displayName || record.displayName || record.email || 'NV';
        const initials = name.slice(0, 2).toUpperCase();
        return (
          <Space>
            <Avatar style={{ backgroundColor: 'var(--color-primary)', fontWeight: 600 }}>{initials}</Avatar>
            <div>
              <Text strong style={{ display: 'block', fontSize: 13 }}>
                {record.principal?.displayName || record.displayName || record.email}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      render: (val: string, record) => <Text code style={{ fontSize: 12 }}>{val || record.email}</Text>,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 140,
      render: (_, record) => {
        const status = record.principal?.status || 'inactive';
        return (
          <Badge
            status={statusColors[status] as any || 'default'}
            text={<Text style={{ fontSize: 12 }}>{statusLabels[status] || status}</Text>}
          />
        );
      },
    },
    {
      title: 'Vai trò',
      key: 'roles',
      render: (_, record) => {
        const principalRoles = record.principal?.principalRoles || [];
        if (principalRoles.length === 0) {
          return <Text type="secondary" style={{ fontSize: 12 }}>Chưa gán vai trò</Text>;
        }
        return (
          <Space size={4} wrap>
            {principalRoles.map((pr: PrincipalRole) => (
              <Tooltip key={`${pr.roleId}-${pr.scopeId}`} title={`Scope: ${pr.scope?.name || 'Global'}`}>
                <Tag
                  color={pr.role?.code === 'SUPER_ADMIN' ? 'red' : pr.role?.code === 'HR_MANAGER' ? 'blue' : 'default'}
                  closable={canManageRoles && pr.role?.code !== 'SUPER_ADMIN'}
                  onClose={(e) => {
                    e.preventDefault();
                    handleRemoveRole(pr.principalId, pr.roleId, pr.scopeId);
                  }}
                  style={{ fontSize: 11 }}
                >
                  <Shield size={10} style={{ marginRight: 3, verticalAlign: 'middle' }} />
                  {pr.role?.name || pr.role?.code}
                </Tag>
              </Tooltip>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'Đăng nhập lần cuối',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      width: 160,
      render: (val: string) =>
        val ? <Text style={{ fontSize: 12 }}>{new Date(val).toLocaleString('vi-VN')}</Text> : <Text type="secondary" style={{ fontSize: 12 }}>Chưa đăng nhập</Text>,
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          {canManageRoles && (
            <Tooltip title="Gán vai trò">
              <Button type="text" size="small" icon={<KeyRound size={14} />} onClick={() => openAssignModal(record)} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space direction="vertical" size={4}>
            <Title level={4} style={{ margin: 0 }}>Quản lý tài khoản người dùng</Title>
            <Text type="secondary">Quản lý tài khoản, phân quyền vai trò và giám sát hoạt động người dùng trong hệ thống.</Text>
          </Space>
        </Col>
      </Row>

      <FilterBar values={filters} onChange={handleFilterChange} fields={filterFields} />

      <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        <Table<ManagedUser>
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Tổng cộng ${total} tài khoản` }}
        />
      </Card>

      {/* Assign Role Modal */}
      <Modal
        title="Gán vai trò cho người dùng"
        open={isAssignModalOpen}
        onCancel={() => setIsAssignModalOpen(false)}
        footer={null}
      >
        {selectedUser && (
          <div style={{ marginBottom: 16 }}>
            <Space>
              <Avatar style={{ backgroundColor: 'var(--color-primary)' }}>
                {(selectedUser.principal?.displayName || selectedUser.displayName || selectedUser.email || 'US').slice(0, 2).toUpperCase()}
              </Avatar>
              <div>
                <Text strong>{selectedUser.principal?.displayName || selectedUser.displayName || selectedUser.email}</Text>
                <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>{selectedUser.email}</Text>
              </div>
            </Space>
          </div>
        )}
        <Form form={form} layout="vertical" onFinish={handleAssignRole}>
          <Form.Item
            name="roleId"
            label="Chọn vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select placeholder="Chọn một vai trò để gán">
              {roles.map((role) => (
                <Select.Option key={role.id} value={role.id}>
                  <Space>
                    <Shield size={12} />
                    {role.name || role.code}
                    {role.isSystem && <Tag color="orange" style={{ fontSize: 10, marginLeft: 4 }}>System</Tag>}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsAssignModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={assignMutation.isPending}>Gán vai trò</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
