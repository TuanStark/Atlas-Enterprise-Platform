import { useState } from 'react';
import { Card, Table, Button, Tag, Typography, Row, Col, Space, Modal, Form, Input, InputNumber, Switch, Spin, Empty, TimePicker, Popconfirm } from 'antd';
import type { TableColumnsType } from 'antd';
import { Plus, Clock, Trash2, Check, X } from 'lucide-react';
import { useShifts, useCreateShift, useDeleteShift } from '@features/attendance/hooks/useShifts';
import type { Shift } from '@features/attendance/types';

const { Title, Text } = Typography;

export default function ShiftsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Queries & Mutations
  const { data: shifts = [], isLoading } = useShifts();
  const createMutation = useCreateShift();
  const deleteMutation = useDeleteShift();

  const handleCreate = (values: any) => {
    createMutation.mutate(
      {
        code: values.code,
        name: values.name,
        startTime: values.startTime.format('HH:mm'),
        endTime: values.endTime.format('HH:mm'),
        breakMinutes: values.breakMinutes || 60,
        isFlexible: values.isFlexible || false,
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          form.resetFields();
        },
      }
    );
  };

  const columns: TableColumnsType<Shift> = [
    {
      title: 'Mã ca',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code) => <Tag color="blue" style={{ fontWeight: 600 }}>{code}</Tag>,
    },
    {
      title: 'Tên ca làm việc',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <Text strong>{name}</Text>,
    },
    {
      title: 'Giờ làm việc',
      key: 'hours',
      width: 200,
      render: (_, record) => {
        // format ISO or HH:mm string safely
        const start = record.startTime ? record.startTime.slice(0, 5) : '--:--';
        const end = record.endTime ? record.endTime.slice(0, 5) : '--:--';
        return (
          <Space>
            <Clock size={14} className="text-secondary" />
            <Text>{start} - {end}</Text>
          </Space>
        );
      },
    },
    {
      title: 'Nghỉ giữa ca',
      dataIndex: 'breakMinutes',
      key: 'breakMinutes',
      width: 140,
      align: 'center',
      render: (mins) => <Text>{mins || 0} phút</Text>,
    },
    {
      title: 'Ca linh hoạt',
      dataIndex: 'isFlexible',
      key: 'isFlexible',
      width: 140,
      align: 'center',
      render: (flexible) => flexible ? <Check size={16} style={{ color: 'var(--color-success)' }} /> : <X size={16} style={{ color: 'var(--color-text-tertiary)' }} />,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Popconfirm
          title="Xóa ca làm việc"
          description="Bạn có chắc chắn muốn xóa ca này?"
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
          onConfirm={() => deleteMutation.mutate(record.id)}
        >
          <Button danger type="text" size="small" icon={<Trash2 size={14} />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space direction="vertical" size={4}>
            <Title level={4} style={{ margin: 0 }}>Danh mục Ca làm việc</Title>
            <Text type="secondary">Cấu hình khung giờ làm việc tiêu chuẩn hoặc linh hoạt cho doanh nghiệp.</Text>
          </Space>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsModalOpen(true)}
            style={{ borderRadius: 6 }}
          >
            Thêm ca làm việc
          </Button>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)', overflow: 'hidden' }} styles={{ body: { padding: 0 } }}>
        {isLoading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><Spin /></div>
        ) : shifts.length > 0 ? (
          <Table<Shift>
            columns={columns}
            dataSource={shifts}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        ) : (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Empty description="Chưa có ca làm việc nào được cấu hình." />
          </div>
        )}
      </Card>

      {/* Modal: Create Shift */}
      <Modal
        title="Thêm ca làm việc mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate} style={{ marginTop: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="code"
                label="Mã ca"
                rules={[{ required: true, message: 'Nhập mã ca' }]}
              >
                <Input placeholder="Ví dụ: HC" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="name"
                label="Tên ca làm việc"
                rules={[{ required: true, message: 'Nhập tên ca' }]}
              >
                <Input placeholder="Ví dụ: Hành chính Văn phòng" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startTime"
                label="Giờ bắt đầu"
                rules={[{ required: true, message: 'Chọn giờ bắt đầu' }]}
              >
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endTime"
                label="Giờ kết thúc"
                rules={[{ required: true, message: 'Chọn giờ kết thúc' }]}
              >
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16} align="middle">
            <Col span={14}>
              <Form.Item
                name="breakMinutes"
                label="Nghỉ giữa ca (Phút)"
                initialValue={60}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={10} style={{ display: 'flex', alignItems: 'center', paddingTop: 8 }}>
              <Form.Item
                name="isFlexible"
                label="Ca linh hoạt"
                valuePropName="checked"
                initialValue={false}
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending}>Tạo ca</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
