import { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Typography, Row, Col, Space, Modal, Form, Select, DatePicker, Empty, Spin, Avatar, Badge, Calendar, Segmented, Popover, Divider } from 'antd';
import type { TableColumnsType } from 'antd';
import { UserCheck, Plus, CalendarDays, List, Clock } from 'lucide-react';
import { FilterBar } from '@shared/components/FilterBar';
import type { FilterBarField } from '@shared/components/FilterBar';
import { useEmployees } from '@features/employee/hooks/useEmployee';
import { useShifts, useAssignShift, useEmployeeAssignments } from '@features/attendance/hooks/useShifts';
import type { Employee } from '@features/employee/types';
import type { ShiftAssignment } from '@features/attendance/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function TimesheetPage() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs>(dayjs());
  const [form] = Form.useForm();

  // Queries & Mutations
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  const { data: shifts = [] } = useShifts();

  // Auto-select the first employee once the list is loaded
  useEffect(() => {
    if (employees.length > 0) {
      const exists = selectedEmployee && employees.some(e => e.id === selectedEmployee.id);
      if (!exists) {
        setSelectedEmployee(employees[0]);
      }
    }
  }, [employees, selectedEmployee]);

  const handleFilterChange = (key: string, value: any) => {
    if (key === 'employeeId') {
      const emp = employees.find(e => e.id === value);
      if (emp) setSelectedEmployee(emp);
    }
  };

  const filterFields: FilterBarField[] = [
    {
      key: 'employeeId',
      type: 'select',
      label: 'Chọn nhân sự',
      placeholder: 'Tìm kiếm và chọn nhân viên...',
      options: employees.map(emp => {
        const activeEmp = emp.employments?.find(e => e.isCurrent) || emp.employments?.[0];
        const deptPos = activeEmp ? ` (${activeEmp.departmentName} - ${activeEmp.positionName})` : '';
        return {
          label: `${emp.lastName} ${emp.firstName}${deptPos}`,
          value: emp.id,
        };
      }),
      showSearch: true,
      span: 8,
    }
  ];

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

  const openModal = (date?: dayjs.Dayjs) => {
    form.setFieldsValue({
      effectiveFrom: date ? dayjs(date) : dayjs(),
      effectiveTo: undefined,
      shiftId: undefined,
    });
    setIsModalOpen(true);
  };

  const getAssignmentsForDate = (date: dayjs.Dayjs): ShiftAssignment[] => {
    return assignments
      .filter(item => {
        const fromDate = dayjs(item.effectiveFrom).startOf('day');
        const toDate = item.effectiveTo ? dayjs(item.effectiveTo).endOf('day') : null;

        const isAfterOrEqualFrom = date.isSame(fromDate, 'day') || date.isAfter(fromDate, 'day');
        const isBeforeOrEqualTo = !toDate || date.isSame(toDate, 'day') || date.isBefore(toDate, 'day');

        return isAfterOrEqualFrom && isBeforeOrEqualTo;
      })
      .sort((a, b) => {
        const aPrimary = a.isPrimary ? 1 : 0;
        const bPrimary = b.isPrimary ? 1 : 0;
        return bPrimary - aPrimary;
      });
  };

  const renderEmployeeHoverCard = (employee: Employee) => {
    const activeEmp = employee.employments?.find(e => e.isCurrent) || employee.employments?.[0];
    const email = employee.contacts?.find(c => c.type === 'email')?.value;
    const phone = employee.contacts?.find(c => c.type === 'phone' || c.type === 'mobile')?.value;
    const statusColors: Record<string, string> = {
      active: 'success',
      probation: 'processing',
      suspended: 'warning',
      resigned: 'default',
      terminated: 'error',
    };
    const statusLabels: Record<string, string> = {
      active: 'Đang làm việc',
      probation: 'Thử việc',
      suspended: 'Tạm hoãn',
      resigned: 'Đã nghỉ việc',
      terminated: 'Sa thải',
    };

    return (
      <div style={{ width: 280, padding: '4px 0' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'center' }}>
          <Avatar
            size={50}
            src={employee.photoUrl}
            style={{
              backgroundColor: 'var(--color-primary-bg)',
              color: 'var(--color-primary)',
              fontWeight: 600,
              fontSize: 20
            }}
          >
            {`${employee.lastName?.[0] || ''}${employee.firstName?.[0] || ''}` || 'NS'}
          </Avatar>
          <div>
            <Text strong style={{ fontSize: 15, display: 'block', lineHeight: '1.2' }}>
              {employee.lastName} {employee.firstName}
            </Text>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
              Mã: {employee.employeeCode || 'N/A'}
            </Text>
            <Tag color={statusColors[employee.status] || 'default'} style={{ fontSize: 10, marginTop: 4, padding: '0 4px', lineHeight: '1.5' }}>
              {statusLabels[employee.status] || employee.status}
            </Tag>
          </div>
        </div>

        <Divider style={{ margin: '8px 0' }} />

        <Space direction="vertical" size={6} style={{ width: '100%' }}>
          {activeEmp && (
            <>
              <div>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Bộ phận & Vị trí</Text>
                <Text strong style={{ fontSize: 12 }}>{activeEmp.departmentName} — {activeEmp.positionName}</Text>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Loại hợp đồng</Text>
                <Text style={{ fontSize: 12 }}>{activeEmp.employmentType || 'Chính thức'}</Text>
              </div>
            </>
          )}
          {employee.joinDate && (
            <div>
              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Ngày vào công ty</Text>
              <Text style={{ fontSize: 12 }}>{dayjs(employee.joinDate).format('DD/MM/YYYY')}</Text>
            </div>
          )}
          {email && (
            <div>
              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Email liên hệ</Text>
              <Text style={{ fontSize: 12, wordBreak: 'break-all' }}>{email}</Text>
            </div>
          )}
          {phone && (
            <div>
              <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Số điện thoại</Text>
              <Text style={{ fontSize: 12 }}>{phone}</Text>
            </div>
          )}
        </Space>
      </div>
    );
  };

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

      {/* Top Filter Selector */}
      <FilterBar
        values={{ employeeId: selectedEmployee?.id }}
        onChange={handleFilterChange}
        fields={filterFields}
        extra={
          selectedEmployee && (
            <Popover
              content={renderEmployeeHoverCard(selectedEmployee)}
              placement="bottomRight"
              trigger="hover"
              mouseEnterDelay={0.2}
              mouseLeaveDelay={0.1}
            >
              <Button type="link" size="small" icon={<UserCheck size={14} />} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                Xem nhanh hồ sơ nhân sự
              </Button>
            </Popover>
          )
        }
      />

      {/* Main Schedule Board */}
      <Row>
        <Col span={24}>
          {isLoadingEmployees ? (
            <div style={{ padding: 60, textAlign: 'center' }}><Spin /></div>
          ) : selectedEmployee ? (
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
                        onClick={() => openModal(selectedDate)}
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
              {/* Segmented View Switcher & Legend */}
              <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                <Col>
                  <Segmented
                    value={viewMode}
                    onChange={(value) => setViewMode(value as 'calendar' | 'table')}
                    options={[
                      { label: 'Dạng lịch', value: 'calendar', icon: <CalendarDays size={14} /> },
                      { label: 'Dạng bảng', value: 'table', icon: <List size={14} /> },
                    ]}
                  />
                </Col>
                <Col>
                  {viewMode === 'calendar' && (
                    <Space size={16}>
                      <Space size={6}>
                        <Badge status="processing" />
                        <Text type="secondary" style={{ fontSize: 12 }}>Ca chính</Text>
                      </Space>
                      <Space size={6}>
                        <Badge status="default" />
                        <Text type="secondary" style={{ fontSize: 12 }}>Ca phụ</Text>
                      </Space>
                    </Space>
                  )}
                </Col>
              </Row>

              {viewMode === 'calendar' ? (
                <div>
                  {isLoadingAssignments ? (
                    <div style={{ padding: 60, textAlign: 'center' }}><Spin /></div>
                  ) : (
                    <div className="shift-calendar-container" style={{ marginBottom: 20 }}>
                      <Calendar
                        fullscreen={true}
                        cellRender={(date) => {
                          const dailyAssignments = getAssignmentsForDate(date);
                          return (
                            <div style={{ maxHeight: 75, overflowY: 'auto' }}>
                              {dailyAssignments.map((assignment) => (
                                <div key={assignment.id} style={{ margin: '2px 0' }}>
                                  <Tag
                                    color={assignment.isPrimary ? 'blue' : 'default'}
                                    style={{
                                      fontSize: '11px',
                                      width: '100%',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      margin: 0,
                                      padding: '0 4px',
                                      border: assignment.isPrimary ? '1px solid var(--color-primary-bg-hover)' : '1px solid var(--color-border)',
                                    }}
                                  >
                                    <span style={{ fontWeight: 600 }}>{assignment.shift?.code || 'Ca'}</span>
                                    <span style={{ fontSize: '10px', marginLeft: 4, opacity: 0.8 }}>
                                      ({assignment.shift?.startTime?.slice(0, 5) || '--:--'})
                                    </span>
                                  </Tag>
                                </div>
                              ))}
                            </div>
                          );
                        }}
                        value={selectedDate}
                        onSelect={(date) => setSelectedDate(date)}
                      />
                    </div>
                  )}

                  {/* Date details section */}
                  <Card
                    size="small"
                    title={
                      <Space>
                        <CalendarDays size={15} style={{ color: 'var(--color-primary)' }} />
                        <span style={{ fontWeight: 600, fontSize: 13 }}>
                          Chi tiết ca trực ngày {selectedDate.format('DD/MM/YYYY')}
                        </span>
                      </Space>
                    }
                    extra={
                      employmentId && (
                        <Button
                          type="dashed"
                          size="small"
                          icon={<Plus size={12} />}
                          onClick={() => openModal(selectedDate)}
                        >
                          Thêm ca ngày này
                        </Button>
                      )
                    }
                    style={{
                      borderRadius: 10,
                      backgroundColor: 'var(--color-bg-layout)',
                      border: '1px dashed var(--color-border)',
                    }}
                  >
                    {getAssignmentsForDate(selectedDate).length > 0 ? (
                      <Row gutter={[12, 12]}>
                        {getAssignmentsForDate(selectedDate).map((assignment) => {
                          const start = assignment.shift?.startTime ? assignment.shift.startTime.slice(0, 5) : '--:--';
                          const end = assignment.shift?.endTime ? assignment.shift.endTime.slice(0, 5) : '--:--';
                          return (
                            <Col xs={24} sm={12} key={assignment.id}>
                              <Card
                                bordered={false}
                                styles={{ body: { padding: 12 } }}
                                style={{
                                  borderRadius: 8,
                                  background: '#ffffff',
                                  border: '1px solid var(--color-border-secondary)',
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.01)',
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div>
                                    <Space style={{ marginBottom: 4 }}>
                                      <Tag color={assignment.isPrimary ? 'blue' : 'default'} style={{ fontWeight: 600 }}>
                                        {assignment.shift?.code}
                                      </Tag>
                                      <Text strong style={{ fontSize: 13 }}>{assignment.shift?.name}</Text>
                                    </Space>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
                                      <Text type="secondary" style={{ fontSize: 12 }}>
                                        <Clock size={12} style={{ marginRight: 4, display: 'inline', verticalAlign: 'middle' }} />
                                        Giờ làm việc: <Text strong style={{ fontSize: 12 }}>{start} - {end}</Text>
                                      </Text>
                                      <Text type="secondary" style={{ fontSize: 12 }}>
                                        Nghỉ giữa ca: {assignment.shift?.breakMinutes || 0} phút
                                      </Text>
                                    </div>
                                  </div>
                                  <Badge
                                    status={assignment.isPrimary ? 'success' : 'default'}
                                    text={<span style={{ fontSize: 11 }}>{assignment.isPrimary ? 'Chính' : 'Phụ'}</span>}
                                  />
                                </div>
                              </Card>
                            </Col>
                          );
                        })}
                      </Row>
                    ) : (
                      <div style={{ padding: '16px 0', textAlign: 'center' }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>Không có ca làm việc nào được gán cho ngày này.</Text>
                      </div>
                    )}
                  </Card>
                </div>
              ) : (
                /* Table View */
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
              )}
            </Card>
          ) : (
            <Card style={{ borderRadius: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350 }}>
              <Empty description="Vui lòng chọn một nhân sự ở bộ lọc phía trên để lập kế hoạch phân ca." />
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
