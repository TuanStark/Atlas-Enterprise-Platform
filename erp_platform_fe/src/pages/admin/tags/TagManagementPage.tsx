import { useState } from 'react';
import { Card, Table, Typography, Row, Col, Space, Tag, Button, Modal, Form, Input, ColorPicker, Empty, Spin, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import { Tags, Plus, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@shared/api';
import { message } from 'antd';

const { Title, Text } = Typography;

/** Types matching backend Tag entity */
interface TagItem {
  id: string;
  tenantId: string;
  code?: string;
  name?: string;
  color?: string;
  description?: string;
  createdAt?: string;
}

/** API matching TaggingController */
const tagApi = {
  async list(): Promise<TagItem[]> {
    const { data } = await httpClient.get<TagItem[]>('/tags');
    return data;
  },
  async create(dto: { code: string; name: string; color?: string; description?: string }): Promise<TagItem> {
    const { data } = await httpClient.post<TagItem>('/tags', dto);
    return data;
  },
  async remove(id: string): Promise<void> {
    await httpClient.delete(`/tags/${id}`);
  },
};

export default function TagManagementPage() {
  const queryClient = useQueryClient();
  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: tagApi.list,
  });

  const createMutation = useMutation({
    mutationFn: tagApi.create,
    onSuccess: () => {
      message.success('Đã tạo nhãn mới!');
      void queryClient.invalidateQueries({ queryKey: ['tags'] });
      setIsCreateOpen(false);
      form.resetFields();
    },
    onError: () => message.error('Tạo nhãn thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: tagApi.remove,
    onSuccess: () => {
      message.success('Đã xóa nhãn!');
      void queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: () => message.error('Xóa nhãn thất bại'),
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form] = Form.useForm();

  const handleDelete = (id: string, name?: string) => {
    Modal.confirm({
      title: 'Xóa nhãn',
      content: `Bạn có chắc muốn xóa nhãn "${name}"? Tất cả gán nhãn liên quan sẽ bị xóa.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const columns: TableColumnsType<TagItem> = [
    {
      title: 'Nhãn',
      key: 'tag',
      render: (_, record) => (
        <Space>
          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: 4,
              backgroundColor: record.color || '#8c8c8c',
            }}
          />
          <Text strong style={{ fontSize: 13 }}>{record.name || record.code}</Text>
        </Space>
      ),
    },
    {
      title: 'Mã',
      dataIndex: 'code',
      key: 'code',
      width: 140,
      render: (val: string) => <Text code style={{ fontSize: 12 }}>{val}</Text>,
    },
    {
      title: 'Màu sắc',
      dataIndex: 'color',
      key: 'color',
      width: 100,
      render: (val: string) => val ? <Tag color={val}>{val}</Tag> : '—',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (val: string) => val || <Text type="secondary">—</Text>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (val: string) =>
        val ? new Date(val).toLocaleDateString('vi-VN') : '—',
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Tooltip title="Xóa nhãn">
          <Button
            type="text"
            danger
            size="small"
            icon={<Trash2 size={14} />}
            onClick={() => handleDelete(record.id, record.name)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space direction="vertical" size={4}>
            <Title level={4} style={{ margin: 0 }}>
              <Space><Tags size={20} /> Quản lý nhãn (Tags)</Space>
            </Title>
            <Text type="secondary">Tạo và quản lý nhãn để phân loại, đánh dấu dữ liệu trong toàn hệ thống.</Text>
          </Space>
        </Col>
        <Col>
          <Button type="primary" icon={<Plus size={14} />} onClick={() => setIsCreateOpen(true)} style={{ borderRadius: 6 }}>
            Tạo nhãn mới
          </Button>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        <Table<TagItem>
          columns={columns}
          dataSource={tags}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10, showTotal: (total) => `Tổng ${total} nhãn` }}
          locale={{ emptyText: <Empty description="Chưa có nhãn nào." /> }}
        />
      </Card>

      {/* Create Tag Modal */}
      <Modal title="Tạo nhãn mới" open={isCreateOpen} onCancel={() => setIsCreateOpen(false)} footer={null}>
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => createMutation.mutate({ ...values, color: values.color || '#1890ff' })}
          style={{ marginTop: 16 }}
        >
          <Form.Item name="code" label="Mã nhãn" rules={[{ required: true, message: 'Nhập mã nhãn' }]}>
            <Input placeholder="VD: urgent, priority" />
          </Form.Item>
          <Form.Item name="name" label="Tên nhãn" rules={[{ required: true, message: 'Nhập tên nhãn' }]}>
            <Input placeholder="VD: Ưu tiên, Khẩn cấp" />
          </Form.Item>
          <Form.Item name="color" label="Màu sắc">
            <Input placeholder="#1890ff" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea placeholder="Mô tả mục đích sử dụng nhãn" rows={2} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsCreateOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending}>Tạo</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
