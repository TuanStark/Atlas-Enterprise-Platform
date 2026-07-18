import { useState, useEffect } from 'react';
import { Card, Button, Tag, Typography, Row, Col, Space, Modal, Form, Select, DatePicker, Empty, Spin, Avatar, Badge, Calendar, Popover, Divider } from 'antd';
import { FilterBar } from '@shared/components/FilterBar';
import type { FilterBarField } from '@shared/components/FilterBar';
import { useEmployees } from '@features/employee/hooks/useEmployee';
import { useShifts, useAssignShift, useEmployeeAssignments } from '@features/attendance/hooks/useShifts';
import type { Employee } from '@features/employee/types';
import type { ShiftAssignment } from '@features/attendance/types';
import { ShiftAssignmentTag } from '@features/attendance/components/ShiftAssignmentTag';
import dayjs from 'dayjs';
import { Plus, UserCheck } from 'lucide-react';

const { Title, Text } = Typography;

export default function TimesheetPage() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // Enrich assignments with their shift details using the loaded shifts list
  const enrichedAssignments = assignments.map(assignment => {
    if (!assignment.shift && assignment.shiftId) {
      const match = shifts.find(s => s.id === assignment.shiftId);
      if (match) {
        return {
          ...assignment,
          shift: match,
        };
      }
    }
    return assignment;
  });

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
    return enrichedAssignments
      .filter(item => {
        // Strip time/timezone component for strict date-only comparisons
        const fromDateStr = item.effectiveFrom.split('T')[0];
        const fromDate = dayjs(fromDateStr).startOf('day');
        
        const toDate = item.effectiveTo 
          ? dayjs(item.effectiveTo.split('T')[0]).endOf('day') 
          : null;

        const targetDate = date.startOf('day');

        const isAfterOrEqualFrom = targetDate.isSame(fromDate, 'day') || targetDate.isAfter(fromDate, 'day');
        const isBeforeOrEqualTo = !toDate || targetDate.isSame(toDate, 'day') || targetDate.isBefore(toDate, 'day');

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
            <Space size={12}>
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
              {employmentId ? (
                <Button
                  type="primary"
                  icon={<Plus size={14} />}
                  onClick={() => openModal(selectedDate)}
                  style={{ borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  Phân ca làm việc
                </Button>
              ) : (
                <Tag color="error">Thiếu Hợp đồng/Employment</Tag>
              )}
            </Space>
          )
        }
      />

      {/* Main Schedule Board */}
      <Row>
        <Col span={24}>
          {isLoadingEmployees ? (
            <div style={{ padding: 60, textAlign: 'center' }}><Spin /></div>
          ) : selectedEmployee ? (
            <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              {isLoadingAssignments ? (
                <div style={{ padding: 60, textAlign: 'center' }}><Spin /></div>
              ) : (
                <div className="shift-calendar-container">
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
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
                  </div>
                  <Calendar
                    fullscreen={true}
                    cellRender={(date) => {
                      const dailyAssignments = getAssignmentsForDate(date);
                      return (
                        <div style={{ maxHeight: 75, overflowY: 'auto' }}>
                          {dailyAssignments.map((assignment) => (
                            <div key={assignment.id} style={{ margin: '2px 0' }}>
                              <ShiftAssignmentTag assignment={assignment} />
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
