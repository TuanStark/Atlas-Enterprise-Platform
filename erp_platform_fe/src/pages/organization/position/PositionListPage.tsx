import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, Typography, Modal, Form, Input, InputNumber, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Briefcase, Plus, Edit2, Trash2 } from 'lucide-react';
import { useOrganizations } from '@features/organization/hooks/useOrganization';
import {
  usePositions,
  useCreatePosition,
  useUpdatePosition,
  useDeletePosition,
} from '@features/organization/hooks/usePosition';
import type { Position } from '@features/organization/types';
import { PermissionGate, useCanAccessCode } from '@shared/hooks/usePermission';
import { PERMISSIONS } from '@shared/constants/permissions';

const { Title, Text } = Typography;

const convertNameToCode = (name: string): string => {
  if (!name) return '';
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
};

export default function PositionListPage() {
  const [form] = Form.useForm();

  // Organization Context Selection
  const [selectedOrgId, setSelectedOrgId] = useState<string>();
  const { data: organizations = [] } = useOrganizations();

  // Auto-select first organization on load
  useEffect(() => {
    if (organizations.length > 0 && !selectedOrgId) {
      setSelectedOrgId(organizations[0].id);
    }
  }, [organizations, selectedOrgId]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Position | null>(null);

  // Queries & Mutations
  const { data: positions = [], isLoading } = usePositions(selectedOrgId);
  const createMutation = useCreatePosition(selectedOrgId);
  const updateMutation = useUpdatePosition(selectedOrgId);
  const deleteMutation = useDeletePosition(selectedOrgId);

  const canUpdatePosition = useCanAccessCode(PERMISSIONS.ORGANIZATION.POSITION.UPDATE);
  const canDeletePosition = useCanAccessCode(PERMISSIONS.ORGANIZATION.POSITION.DELETE);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: Position) => {
    setEditingItem(record);
    form.setFieldsValue({
      name: record.name,
      code: record.code,
      description: record.description,
      level: record.level,
    });
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await updateMutation.mutateAsync({
          id: editingItem.id,
          payload: {
            name: values.name,
            code: values.code,
            description: values.description,
            level: values.level,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          code: values.code,
          description: values.description,
          level: values.level,
        });
      }
      setIsModalOpen(false);
      setEditingItem(null);
      form.resetFields();
    } catch (err) {
      console.error('Validation failed:', err);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const columns: ColumnsType<Position> = [
    {
      title: 'Tên vị trí',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space size={8}>
          <Briefcase size={16} style={{ color: 'var(--color-primary)' }} />
          <Text strong style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
            {text}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Mã vị trí',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <Tag color="blue" style={{ borderRadius: 6, fontWeight: 500 }}>{text}</Tag>,
    },
    {
      title: 'Cấp độ',
      dataIndex: 'level',
      key: 'level',
      render: (level) => <Text style={{ fontSize: 13, fontWeight: 600 }}>{level || '-'}</Text>,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <Text type="secondary" style={{ fontSize: 13 }}>{text || '-'}</Text>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => {
        return (
          <Space size={12}>
            {canUpdatePosition && (
              <Button
                type="text"
                size="small"
                icon={<Edit2 size={14} />}
                onClick={() => handleOpenEditModal(record)}
                style={{ color: 'var(--color-primary)' }}
              />
            )}
            {canDeletePosition && (
              <Popconfirm
                title="Xác nhận xóa"
                description="Bạn có chắc chắn muốn xóa vị trí công việc này?"
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
                onConfirm={() => handleDelete(record.id)}
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<Trash2 size={14} />}
                />
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Quản lý Danh mục Vị trí công việc</Title>
          <Text type="secondary">Quản lý và thiết lập các vị trí công việc trong doanh nghiệp</Text>
        </div>
        <PermissionGate permission={PERMISSIONS.ORGANIZATION.POSITION.CREATE}>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={handleOpenAddModal}
            disabled={!selectedOrgId}
            style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))',
              border: 'none',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(14, 165, 233, 0.25)',
            }}
          >
            Thêm vị trí
          </Button>
        </PermissionGate>
      </div>

      <Card style={{ borderRadius: 12, border: '1px solid var(--color-border-light)' }}>
        <Table
          dataSource={positions}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingItem ? 'Chỉnh sửa vị trí' : 'Thêm vị trí mới'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText={editingItem ? 'Lưu thay đổi' : 'Thêm mới'}
        cancelText="Hủy"
        okButtonProps={{
          style: {
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))',
            border: 'none',
          },
          loading: createMutation.isPending || updateMutation.isPending,
        }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Tên vị trí"
            rules={[{ required: true, message: 'Vui lòng nhập tên vị trí' }]}
          >
            <Input
              placeholder="Ví dụ: Senior Developer, Junior Developer, HR Manager..."
              onChange={(e) => {
                if (!editingItem) {
                  const generatedCode = convertNameToCode(e.target.value);
                  form.setFieldsValue({ code: generatedCode });
                }
              }}
            />
          </Form.Item>

          <Form.Item
            name="code"
            label="Mã vị trí"
            rules={[{ required: true, message: 'Vui lòng nhập mã vị trí' }]}
          >
            <Input placeholder="Ví dụ: SR_DEV, JR_DEV, HR_MGR..." disabled={Boolean(editingItem)} />
          </Form.Item>

          <Form.Item
            name="level"
            label="Cấp độ (Level)"
            rules={[{ type: 'number', min: 1, message: 'Cấp độ phải lớn hơn hoặc bằng 1' }]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="Ví dụ: 1, 2, 3..." />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea placeholder="Nhập mô tả vị trí công việc..." rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
