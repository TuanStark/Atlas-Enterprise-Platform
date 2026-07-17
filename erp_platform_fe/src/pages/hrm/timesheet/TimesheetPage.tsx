import { useState } from 'react';
import { Card, Table, Button, Tag, Typography, Row, Col, Space, Modal, Form, Select, DatePicker, Empty, Spin, Avatar, Badge } from 'antd';
import type { TableColumnsType } from 'antd';
import { UserCheck, Plus } from 'lucide-react';
import { useEmployees } from '@features/employee/hooks/useEmployee';
import { useShifts, useAssignShift, useEmployeeAssignments } from '@features/attendance/hooks/useShifts';
import type { Employee } from '@features/employee/types';
import type { ShiftAssignment } from '@features/attendance/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function TimesheetPage() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Queries & Mutations
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  const { data: shifts = [] } = useShifts();

  // Get current active employment ID for selected employee
  const activeEmployment = selectedEmployee?.employments?.find(e => e.isCurrent) || selectedEmployee?.employments?.[0];
  const employmentId = activeEmployment?.id;

  const { data: assignments = [], isLoading: isLoadingAssignments } = useEmployeeAssignments(employmentId);
  const assignMutation = useAssignShift();

  const handleAssign = (values: any) => {
    if (!employmentId) return;
    assignMutation.mutate(
      {
        employmentId,
        payload: {
          shiftId: values.shiftId,
          effectiveFrom: values.effectiveFrom.format('YYYY-MM-DD'),
          effectiveTo: values.effectiveTo ? values.effectiveTo.format('YYYY-MM-DD') : undefined,
        },
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          form.resetFields();
        },
      }
    );
  };

  const employeeColumns: TableColumnsType<Employee> = [
    {
      title: 'Nhân sự',
      key: 'name',
      render: (_, record) => {
        const initials = `${record.lastName?.[0] || ''}${record.firstName?.[0] || ''}`;
        const activeEmp = record.employments?.find(e => e.isCurrent) || record.employments?.[0];
        return (
          <div style={{ cursor: 'pointer' }}>
            <Space size={10}>
              <Avatar style={{ backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)', fontWeight: 600 }}>
                {initials || 'NS'}
              </Avatar>
              <div>
                <Text strong style={{ fontSize: 13, display: 'block' }}>{record.lastName} {record.firstName}</Text>
                {activeEmp && <Text type="secondary" style={{ fontSize: 11 }}>{activeEmp.positionName} • {activeEmp.departmentName}</Text>}
              </div>
            </Space>
          </div>
        );
      },
    },
  ];

  const assignmentColumns: TableColumnsType<ShiftAssignment> = [
    {
      title: 'Ca làm việc',
      key: 'shift',
      render: (_, record) => (
        <div>
          <Tag color="blue" style={{ fontWeight: 600, marginBottom: 2 }}>{record.shift?.code || 'CA'}</Tag>
          <Text strong style={{ display: 'block', fontSize: 12 }}>{record.shift?.name}</Text>
        </div>
      ),
    },
    {
      title: 'Giờ ca',
      key: 'hours',
      render: (_, record) => {
        const start = record.shift?.startTime ? record.shift.startTime.slice(0, 5) : '--:--';
        const end = record.shift?.endTime ? record.shift.endTime.slice(0, 5) : '--:--';
        return <Text style={{ fontSize: 12 }}>{start} - {end}</Text>;
      },
    },
    {
      title: 'Hiệu lực',
      key: 'dates',
      render: (_, record) => {
        const from = dayjs(record.effectiveFrom).format('DD/MM/YYYY');
        const to = record.effectiveTo ? dayjs(record.effectiveTo).format('DD/MM/YYYY') : 'Vô thời hạn';
        return <Text style={{ fontSize: 12 }}>{from} - {to}</Text>;
      },
    },
    {
      title: 'Chính thức',
      dataIndex: 'isPrimary',
      key: 'isPrimary',
      width: 100,
      render: (primary) => (
        <Badge status={primary ? 'success' : 'default'} text={primary ? 'Chính' : 'Phụ'} />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Space direction="vertical" size={4}>
            <Title level={4} style={{ margin: 0 }}>Lập kế hoạch phân ca nhân sự</Title>
            <Text type="secondary">Phân bổ ca làm việc, lịch biểu chuẩn cho nhân viên và theo dõi lịch sử phân ca.</Text>
          </Space>
        </Col>
      </Row>

      <Row gutter={24}>
        {/* Left: Employee list */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <UserCheck size={16} className="text-primary" />
                <span>Danh sách Nhân sự</span>
              </Space>
            }
            styles={{ body: { padding: 0 } }}
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)', overflow: 'hidden' }}
          >
            {isLoadingEmployees ? (
              <div style={{ padding: 40, textAlign: 'center' }}><Spin /></div>
            ) : employees.length > 0 ? (
              <Table<Employee>
                columns={employeeColumns}
                dataSource={employees}
                rowKey="id"
                pagination={{ pageSize: 8 }}
                rowClassName={(record) => record.id === selectedEmployee?.id ? 'ant-table-row-selected' : ''}
                onRow={(record) => ({
                  onClick: () => setSelectedEmployee(record),
                })}
              />
            ) : (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <Empty description="Không tìm thấy nhân sự nào." />
              </div>
            )}
          </Card>
        </Col>

        {/* Right: Assignments and planner */}
        <Col xs={24} lg={16}>
          {selectedEmployee ? (
            <Card
              title={
                <Row justify="space-between" align="middle" style={{ width: '100%' }}>
                  <Col>
                    <Space size={12}>
                      <Avatar style={{ backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: 600 }}>
                        {`${selectedEmployee.lastName?.[0] || ''}${selectedEmployee.firstName?.[0] || ''}`}
                      </Avatar>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>
                          {selectedEmployee.lastName} {selectedEmployee.firstName}
                        </span>
                        {activeEmployment ? (
                          <span style={{ fontSize: 11, color: 'var(--color-text-secondary)', display: 'block' }}>
                            {activeEmployment.positionName} • {activeEmployment.departmentName}
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', display: 'block' }}>
                            Chưa gán vị trí/phòng ban
                          </span>
                        )}
                      </div>
                    </Space>
                  </Col>
                  <Col>
                    {employmentId ? (
                      <Button
                        type="primary"
                        icon={<Plus size={14} />}
                        onClick={() => setIsModalOpen(true)}
                        style={{ borderRadius: 6 }}
                      >
                        Phân ca làm việc
                      </Button>
                    ) : (
                      <Tag color="error">Thiếu Hợp đồng/Employment</Tag>
                    )}
                  </Col>
                </Row>
              }
              style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
            >
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>Lịch sử phân ca làm việc</Text>
                {isLoadingAssignments ? (
                  <div style={{ padding: 30, textAlign: 'center' }}><Spin /></div>
                ) : assignments.length > 0 ? (
                  <Table<ShiftAssignment>
                    columns={assignmentColumns}
                    dataSource={assignments}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                  />
                ) : (
                  <Empty description="Nhân sự này chưa được xếp ca làm việc nào." />
                )}
              </div>
            </Card>
          ) : (
            <Card style={{ borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
              <Empty description="Chọn một nhân sự ở danh sách bên trái để lập kế hoạch phân ca." />
            </Card>
          )}
        </Col>
      </Row>

      {/* Modal: Assign Shift */}
      <Modal
        title="Gán ca làm việc cho nhân sự"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAssign} style={{ marginTop: 16 }}>
          <Form.Item
            name="shiftId"
            label="Chọn ca làm việc"
            rules={[{ required: true, message: 'Vui lòng chọn ca làm việc' }]}
          >
            <Select placeholder="Chọn một ca từ danh mục">
              {shifts.map(shift => (
                <Select.Option key={shift.id} value={shift.id}>
                  {shift.name} ({shift.startTime.slice(0, 5)} - {shift.endTime.slice(0, 5)})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="effectiveFrom"
                label="Ngày bắt đầu hiệu lực"
                rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="effectiveTo"
                label="Ngày kết thúc hiệu lực"
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Vô thời hạn" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={assignMutation.isPending}>Gán ca</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
