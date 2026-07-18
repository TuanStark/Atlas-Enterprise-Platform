import { useState } from 'react';
import { Card, Table, Button, Tag, Typography, Row, Col, Space, Modal, Form, Input, DatePicker, Empty, Spin } from 'antd';
import type { TableColumnsType } from 'antd';
import { Plus, Wallet, Play, Calendar } from 'lucide-react';
import dayjs from 'dayjs';
import { FilterBar } from '@shared/components/FilterBar';
import { usePayrollPeriods, useCreatePayrollPeriod, useCalculatePayroll, usePayrollsByPeriod } from '@features/payroll/hooks/usePayroll';
import type { PayrollPeriod, Payroll } from '@features/payroll/types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const periodStatusConfig: Record<string, { color: string; label: string }> = {
  draft: { color: 'blue', label: 'Nháp' },
  processed: { color: 'green', label: 'Đã tính' },
  closed: { color: 'default', label: 'Đã khóa' },
};

export default function PayrollPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  // Queries & Mutations
  const { data: periods = [], isLoading: isLoadingPeriods } = usePayrollPeriods();
  const { data: payrolls = [], isLoading: isLoadingPayrolls } = usePayrollsByPeriod(selectedPeriod?.id);

  const createPeriodMutation = useCreatePayrollPeriod();
  const calculateMutation = useCalculatePayroll();

  const handleCreatePeriod = (values: any) => {
    const [start, end] = values.dates;
    createPeriodMutation.mutate(
      {
        name: values.name,
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD'),
        status: 'draft',
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          form.resetFields();
        },
      }
    );
  };

  const handleCalculate = () => {
    if (!selectedPeriod) return;
    calculateMutation.mutate(selectedPeriod.id, {
      onSuccess: () => {
        // Refresh local status reference
        setSelectedPeriod(prev => prev ? { ...prev, status: 'processed' } : null);
      }
    });
  };

  const periodColumns: TableColumnsType<PayrollPeriod> = [
    {
      title: 'Chu kỳ',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ cursor: 'pointer' }}>
          <Text strong style={{ fontSize: 13, display: 'block' }}>{text}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {dayjs(record.startDate).format('DD/MM')} - {dayjs(record.endDate).format('DD/MM/YYYY')}
          </Text>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const config = periodStatusConfig[status] || { color: 'default', label: status };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
  ];

  const payrollColumns: TableColumnsType<Payroll> = [
    {
      title: 'Nhân viên',
      key: 'employee',
      render: (_, record) => {
        const emp = record.employment?.employee;
        return (
          <Space>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 600,
              fontSize: 12
            }}>
              {emp ? `${emp.lastName?.[0] || ''}${emp.firstName?.[0] || ''}` : 'NV'}
            </div>
            <div>
              <Text strong style={{ fontSize: 13 }}>
                {emp ? `${emp.lastName} ${emp.firstName}` : `Nhân viên ID: ${record.employmentId.slice(0, 8)}`}
              </Text>
              {emp?.employeeCode && <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>{emp.employeeCode}</Text>}
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Lương cơ bản',
      dataIndex: 'baseSalary',
      key: 'baseSalary',
      render: (v) => <Text>{Number(v).toLocaleString('vi-VN')} ₫</Text>,
    },
    {
      title: 'Phụ cấp',
      dataIndex: 'allowances',
      key: 'allowances',
      render: (v) => <Text style={{ color: 'var(--color-success)' }}>+{Number(v).toLocaleString('vi-VN')} ₫</Text>,
    },
    {
      title: 'Khấu trừ',
      dataIndex: 'deductions',
      key: 'deductions',
      render: (v) => <Text style={{ color: 'var(--color-error)' }}>-{Number(v).toLocaleString('vi-VN')} ₫</Text>,
    },
    {
      title: 'Thực nhận',
      dataIndex: 'netSalary',
      key: 'netSalary',
      render: (v) => <Text strong style={{ color: 'var(--color-primary)' }}>{Number(v).toLocaleString('vi-VN')} ₫</Text>,
    },
  ];

  const filteredPayrolls = payrolls.filter(p => {
    const emp = p.employment?.employee;
    const name = emp ? `${emp.lastName || ''} ${emp.firstName || ''}`.toLowerCase() : '';
    const code = emp?.employeeCode?.toLowerCase() || '';
    return name.includes(searchText.toLowerCase()) || code.includes(searchText.toLowerCase());
  });

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Space direction="vertical" size={4}>
            <Title level={4} style={{ margin: 0 }}>Quản lý Bảng lương</Title>
            <Text type="secondary">Tính toán lương, phụ cấp và các khoản khấu trừ cho nhân sự doanh nghiệp.</Text>
          </Space>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsModalOpen(true)}
            style={{ borderRadius: 6 }}
          >
            Tạo chu kỳ mới
          </Button>
        </Col>
      </Row>

      <Row gutter={24}>
        {/* Left Column: Payroll Periods */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <Calendar size={16} className="text-primary" />
                <span>Danh sách Chu kỳ</span>
              </Space>
            }
            styles={{ body: { padding: 0 } }}
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)', overflow: 'hidden' }}
          >
            {isLoadingPeriods ? (
              <div style={{ padding: 40, textAlign: 'center' }}><Spin /></div>
            ) : (
              <Table<PayrollPeriod>
                columns={periodColumns}
                dataSource={periods}
                rowKey="id"
                pagination={{ pageSize: 8 }}
                rowClassName={(record) => record.id === selectedPeriod?.id ? 'ant-table-row-selected' : ''}
                onRow={(record) => ({
                  onClick: () => {
                    setSelectedPeriod(record);
                    setSearchText('');
                  },
                })}
              />
            )}
          </Card>
        </Col>

        {/* Right Column: Calculations for Selected Period */}
        <Col xs={24} lg={16}>
          {selectedPeriod ? (
            <Card
              title={
                <Row justify="space-between" align="middle" style={{ width: '100%' }}>
                  <Space>
                    <Wallet size={16} className="text-primary" />
                    <span style={{ fontWeight: 600 }}>{selectedPeriod.name}</span>
                    <Tag color={periodStatusConfig[selectedPeriod.status]?.color}>
                      {periodStatusConfig[selectedPeriod.status]?.label}
                    </Tag>
                  </Space>
                  {selectedPeriod.status === 'draft' && (
                    <Button
                      type="primary"
                      icon={<Play size={14} />}
                      loading={calculateMutation.isPending}
                      onClick={handleCalculate}
                      style={{ background: 'var(--color-success)', borderColor: 'var(--color-success)' }}
                    >
                      Chạy tính lương
                    </Button>
                  )}
                </Row>
              }
              style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
            >
              {selectedPeriod.status === 'processed' ? (
                isLoadingPayrolls ? (
                  <div style={{ padding: 40, textAlign: 'center' }}><Spin /></div>
                ) : (
                  <div>
                    <FilterBar
                      values={{ search: searchText }}
                      onChange={(_, val) => setSearchText(val)}
                      fields={[{
                        key: 'search',
                        type: 'text',
                        placeholder: 'Tìm kiếm nhân viên trong bảng lương...',
                        span: 24
                      }]}
                      cardStyle={{
                        marginBottom: 16,
                        border: '1px dashed var(--color-border)',
                        borderRadius: 10,
                        boxShadow: 'none',
                        background: 'var(--color-bg-layout)'
                      }}
                    />
                    {filteredPayrolls.length > 0 ? (
                      <Table<Payroll>
                        columns={payrollColumns}
                        dataSource={filteredPayrolls}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                      />
                    ) : (
                      <Empty description="Không tìm thấy nhân viên nào khớp với tìm kiếm." />
                    )}
                  </div>
                )
              ) : (
                <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <Space direction="vertical" size={12}>
                        <Text type="secondary">Chu kỳ lương này đang ở trạng thái nháp và chưa được tính toán.</Text>
                        <Button
                          type="primary"
                          icon={<Play size={14} />}
                          loading={calculateMutation.isPending}
                          onClick={handleCalculate}
                          style={{ borderRadius: 6 }}
                        >
                          Chạy tính lương ngay
                        </Button>
                      </Space>
                    }
                  />
                </div>
              )}
            </Card>
          ) : (
            <Card style={{ borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
              <Empty description="Chọn một chu kỳ tính lương bên trái để xem chi tiết." />
            </Card>
          )}
        </Col>
      </Row>

      {/* Modal for Creating New Period */}
      <Modal
        title="Tạo chu kỳ tính lương mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreatePeriod} style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Tên chu kỳ"
            rules={[{ required: true, message: 'Vui lòng nhập tên chu kỳ tính lương' }]}
          >
            <Input placeholder="Ví dụ: Bảng lương Tháng 7/2026" />
          </Form.Item>
          <Form.Item
            name="dates"
            label="Thời gian áp dụng"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu và kết thúc' }]}
          >
            <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={createPeriodMutation.isPending}>Tạo mới</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
