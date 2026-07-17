import { useState } from 'react';
import { Card, Table, Button, Tag, Typography, Row, Col, Space, Modal, Form, Input, InputNumber, Progress, Spin, Empty, DatePicker } from 'antd';
import type { TableColumnsType } from 'antd';
import { Plus, Target, Calendar } from 'lucide-react';
import { usePerformanceCycles, useCreatePerformanceCycle, useDeletePerformanceCycle, usePerformanceGoals, useCreatePerformanceGoal } from '@features/performance/hooks/usePerformance';
import type { PerformanceCycle, PerformanceGoal } from '@features/performance/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const cycleStatusConfig: Record<string, { color: string; label: string }> = {
  draft: { color: 'orange', label: 'Nháp' },
  active: { color: 'green', label: 'Đang diễn ra' },
  completed: { color: 'default', label: 'Hoàn thành' },
};

const goalStatusConfig: Record<string, { color: string; label: string }> = {
  pending: { color: 'orange', label: 'Chờ duyệt' },
  active: { color: 'blue', label: 'Đang thực hiện' },
  completed: { color: 'green', label: 'Đã hoàn thành' },
  cancelled: { color: 'default', label: 'Đã hủy' },
};

export default function PerformancePage() {
  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [cycleForm] = Form.useForm();
  const [goalForm] = Form.useForm();

  // Queries & Mutations
  const { data: cycles = [], isLoading: isLoadingCycles } = usePerformanceCycles();
  const { data: goals = [], isLoading: isLoadingGoals } = usePerformanceGoals();

  const createCycleMutation = useCreatePerformanceCycle();
  const deleteCycleMutation = useDeletePerformanceCycle();
  const createGoalMutation = useCreatePerformanceGoal();

  // Form Handlers
  const handleCreateCycle = (values: any) => {
    createCycleMutation.mutate(
      {
        name: values.name,
        startDate: values.dates[0].format('YYYY-MM-DD'),
        endDate: values.dates[1].format('YYYY-MM-DD'),
        status: 'draft',
      },
      {
        onSuccess: () => {
          setIsCycleModalOpen(false);
          cycleForm.resetFields();
        },
      }
    );
  };

  const handleCreateGoal = (values: any) => {
    createGoalMutation.mutate(
      {
        ...values,
        employeeId: 'mock-employee-id',
        currentValue: 0,
        status: 'active',
      },
      {
        onSuccess: () => {
          setIsGoalModalOpen(false);
          goalForm.resetFields();
        },
      }
    );
  };

  // Columns Definitions
  const cycleColumns: TableColumnsType<PerformanceCycle> = [
    {
      title: 'Chu kỳ đánh giá',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{text}</Text>
          <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
            {dayjs(record.startDate).format('DD/MM/YYYY')} - {dayjs(record.endDate).format('DD/MM/YYYY')}
          </Text>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status) => {
        const conf = cycleStatusConfig[status] || { color: 'default', label: status };
        return <Tag color={conf.color}>{conf.label}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          danger
          type="text"
          size="small"
          onClick={() => deleteCycleMutation.mutate(record.id)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  const goalColumns: TableColumnsType<PerformanceGoal> = [
    {
      title: 'Mục tiêu (KPI/OKR)',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{text}</Text>
          {record.description && <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{record.description}</Text>}
        </div>
      ),
    },
    {
      title: 'Trọng số',
      dataIndex: 'weight',
      key: 'weight',
      width: 100,
      align: 'center',
      render: (w) => <Text>{w}%</Text>,
    },
    {
      title: 'Tiến độ',
      key: 'progress',
      width: 220,
      render: (_, record) => {
        const percent = Math.min(100, Math.round((record.currentValue / record.targetValue) * 100)) || 0;
        return (
          <div>
            <Progress percent={percent} size="small" />
            <Text type="secondary" style={{ fontSize: 11 }}>
              Hiện tại: {record.currentValue} / Mục tiêu: {record.targetValue}
            </Text>
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status) => {
        const conf = goalStatusConfig[status] || { color: 'default', label: status };
        return <Tag color={conf.color}>{conf.label}</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Space direction="vertical" size={4}>
            <Title level={4} style={{ margin: 0 }}>Đánh giá & Quản lý Hiệu suất</Title>
            <Text type="secondary">Thiết lập chu kỳ đánh giá OKRs/KPIs, thiết lập mục tiêu và xem phân tích năng lực nhân viên.</Text>
          </Space>
        </Col>
      </Row>

      {/* Grid: Cycles on left, Goals on right */}
      <Row gutter={24}>
        {/* Left Side: Cycles */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <Calendar size={16} className="text-primary" />
                <span>Chu kỳ Đánh giá</span>
              </Space>
            }
            extra={
              <Button
                type="primary"
                size="small"
                icon={<Plus size={12} />}
                onClick={() => setIsCycleModalOpen(true)}
              >
                Chu kỳ mới
              </Button>
            }
            styles={{ body: { padding: 0 } }}
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)', overflow: 'hidden', marginBottom: 24 }}
          >
            {isLoadingCycles ? (
              <div style={{ padding: 40, textAlign: 'center' }}><Spin /></div>
            ) : cycles.length > 0 ? (
              <Table<PerformanceCycle>
                columns={cycleColumns}
                dataSource={cycles}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            ) : (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <Empty description="Chưa có chu kỳ đánh giá nào." />
              </div>
            )}
          </Card>
        </Col>

        {/* Right Side: Goals */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <Target size={16} className="text-primary" />
                <span>Mục tiêu Hiệu suất</span>
              </Space>
            }
            extra={
              <Button
                type="primary"
                size="small"
                icon={<Plus size={12} />}
                onClick={() => setIsGoalModalOpen(true)}
              >
                Thêm mục tiêu
              </Button>
            }
            styles={{ body: { padding: 0 } }}
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)', overflow: 'hidden' }}
          >
            {isLoadingGoals ? (
              <div style={{ padding: 40, textAlign: 'center' }}><Spin /></div>
            ) : goals.length > 0 ? (
              <Table<PerformanceGoal>
                columns={goalColumns}
                dataSource={goals}
                rowKey="id"
                pagination={{ pageSize: 5 }}
              />
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <Space direction="vertical" size={12}>
                      <Text type="secondary">Chưa có mục tiêu cá nhân hoặc KPI nào được phân bổ.</Text>
                      <Button
                        type="primary"
                        icon={<Plus size={14} />}
                        onClick={() => setIsGoalModalOpen(true)}
                        style={{ borderRadius: 6 }}
                      >
                        Thiết lập mục tiêu đầu tiên
                      </Button>
                    </Space>
                  }
                />
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Modal: Create Cycle */}
      <Modal
        title="Tạo chu kỳ đánh giá mới"
        open={isCycleModalOpen}
        onCancel={() => setIsCycleModalOpen(false)}
        footer={null}
      >
        <Form form={cycleForm} layout="vertical" onFinish={handleCreateCycle} style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Tên chu kỳ"
            rules={[{ required: true, message: 'Vui lòng nhập tên chu kỳ đánh giá' }]}
          >
            <Input placeholder="Ví dụ: Đánh giá Hiệu suất Cuối năm 2026" />
          </Form.Item>
          <Form.Item
            name="dates"
            label="Thời hạn đánh giá"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu và kết thúc' }]}
          >
            <DatePicker.RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsCycleModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={createCycleMutation.isPending}>Tạo mới</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal: Create Goal */}
      <Modal
        title="Thiết lập mục tiêu hiệu suất mới"
        open={isGoalModalOpen}
        onCancel={() => setIsGoalModalOpen(false)}
        footer={null}
      >
        <Form form={goalForm} layout="vertical" onFinish={handleCreateGoal} style={{ marginTop: 16 }}>
          <Form.Item
            name="title"
            label="Tên mục tiêu / KPI"
            rules={[{ required: true, message: 'Vui lòng nhập tên mục tiêu' }]}
          >
            <Input placeholder="Ví dụ: Đạt doanh số 500M hoặc Tối ưu tốc độ tải trang 20%" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả mục tiêu"
          >
            <Input.TextArea rows={3} placeholder="Mô tả tiêu chuẩn hoàn thành mục tiêu..." />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="weight"
                label="Trọng số (%)"
                rules={[{ required: true, message: 'Nhập trọng số' }]}
              >
                <InputNumber min={1} max={100} style={{ width: '100%' }} placeholder="Ví dụ: 30" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="targetValue"
                label="Chỉ tiêu cần đạt"
                rules={[{ required: true, message: 'Nhập chỉ tiêu' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="Ví dụ: 100" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsGoalModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={createGoalMutation.isPending}>Lưu mục tiêu</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
