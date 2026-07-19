import { useState } from 'react';
import { Card, Table, Button, Space, Tag, Typography, Modal, Form, Input, Switch, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Briefcase, Plus, Edit2, Trash2 } from 'lucide-react';
import { useJobTitles, useCreateJobTitle, useUpdateJobTitle, useDeleteJobTitle } from '@features/employee/hooks/useEmployee';
import dayjs from 'dayjs';

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

interface JobTitle {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
}

export default function JobTitleListPage() {
  const [form] = Form.useForm();
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<JobTitle | null>(null);

  // Queries & Mutations
  const { data: jobTitles = [], isLoading } = useJobTitles();
  const createMutation = useCreateJobTitle();
  const updateMutation = useUpdateJobTitle();
  const deleteMutation = useDeleteJobTitle();

  const handleOpenAddModal = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (record: JobTitle) => {
    setEditingItem(record);
    form.setFieldsValue({
      name: record.name,
      code: record.code,
      isActive: record.isActive,
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
            isActive: values.isActive,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          code: values.code,
          isActive: values.isActive,
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

  const columns: ColumnsType<JobTitle> = [
    {
      title: 'Tên chức danh',
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
      title: 'Mã chức danh',
      dataIndex: 'code',
      key: 'code',
      render: (text) => <Tag color="blue" style={{ borderRadius: 6, fontWeight: 500 }}>{text}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'} style={{ borderRadius: 6, fontWeight: 500 }}>
          {isActive ? 'Hoạt động' : 'Tạm dừng'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => <Text style={{ fontSize: 13 }}>{dayjs(date).format('DD/MM/YYYY')}</Text>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size={12}>
          <Button
            type="text"
            size="small"
            icon={<Edit2 size={14} />}
            onClick={() => handleOpenEditModal(record)}
            style={{ color: 'var(--color-primary)' }}
          />
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa chức danh này?"
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
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Quản lý Danh mục Chức danh</Title>
          <Text type="secondary">Quản lý và thiết lập các chức danh công việc trong doanh nghiệp</Text>
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={handleOpenAddModal}
          style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))',
            border: 'none',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(14, 165, 233, 0.25)',
          }}
        >
          Thêm chức danh
        </Button>
      </div>

      <Card style={{ borderRadius: 12, border: '1px solid var(--color-border-light)' }}>
        <Table
          dataSource={jobTitles}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingItem ? 'Chỉnh sửa chức danh' : 'Thêm chức danh mới'}
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
            label="Tên chức danh"
            rules={[{ required: true, message: 'Vui lòng nhập tên chức danh' }]}
          >
            <Input
              placeholder="Ví dụ: Senior Developer, Giám đốc tài chính..."
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
            label="Mã chức danh"
            rules={[{ required: true, message: 'Vui lòng nhập mã chức danh' }]}
          >
            <Input placeholder="Ví dụ: SR_DEV, CFO..." disabled={Boolean(editingItem)} />
          </Form.Item>

          <Form.Item name="isActive" label="Trạng thái hoạt động" valuePropName="checked">
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Tạm dừng" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
