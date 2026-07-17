import { useState } from 'react';
import { Card, Calendar, Typography, Row, Col, Space, Tag, Badge, List, Avatar, Spin } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useLeaveRequests } from '@features/leave/hooks/useLeave';
import type { LeaveRequest } from '@features/leave/types';
import { CalendarDays, Users, Clock, CheckCircle } from 'lucide-react';

const { Title, Text } = Typography;

export default function LeaveCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const { data: requests = [], isLoading } = useLeaveRequests();

  // Helper: check if a leave request spans a specific date
  const getRequestsForDate = (date: Dayjs): LeaveRequest[] => {
    return requests.filter(req => {
      const start = dayjs(req.startDate).startOf('day');
      const end = dayjs(req.endDate).endOf('day');
      const target = date.startOf('day');
      // Must be approved or pending
      return (req.status === 'approved' || req.status === 'pending') &&
        (target.isAfter(start) || target.isSame(start)) &&
        (target.isBefore(end) || target.isSame(end));
    });
  };

  // Render events in the calendar cells
  const dateCellRender = (value: Dayjs) => {
    const listData = getRequestsForDate(value);
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, overflow: 'hidden' }}>
        {listData.slice(0, 3).map((item) => {
          const emp = item.employment?.employee;
          const name = emp ? `${emp.lastName || ''} ${emp.firstName || ''}`.trim() : 'Nhân sự';
          const isApproved = item.status === 'approved';
          return (
            <li key={item.id} style={{ marginBottom: 2 }}>
              <Badge
                status={isApproved ? 'success' : 'warning'}
                text={
                  <span style={{ fontSize: 10, color: isApproved ? 'var(--color-success)' : 'var(--color-warning)' }}>
                    {name}
                  </span>
                }
              />
            </li>
          );
        })}
        {listData.length > 3 && (
          <li style={{ fontSize: 10, color: 'var(--color-text-secondary)', paddingLeft: 8 }}>
            + {listData.length - 3} người nữa
          </li>
        )}
      </ul>
    );
  };

  const selectedDateRequests = getRequestsForDate(selectedDate);

  // Statistics
  const todayRequests = getRequestsForDate(dayjs());
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedThisMonth = requests.filter(r => {
    const start = dayjs(r.startDate);
    return r.status === 'approved' && start.month() === dayjs().month() && start.year() === dayjs().year();
  });

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Space direction="vertical" size={4}>
            <Title level={4} style={{ margin: 0 }}>Lịch nghỉ phép toàn công ty</Title>
            <Text type="secondary">Theo dõi, sắp xếp lịch nghỉ của nhân viên để quản lý dự án và nhân lực tối ưu.</Text>
          </Space>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <Row justify="space-between" align="middle">
              <Space direction="vertical" size={2}>
                <Text type="secondary">Nghỉ hôm nay</Text>
                <Title level={3} style={{ margin: 0 }}>{todayRequests.length}</Title>
              </Space>
              <Avatar style={{ backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)' }} icon={<Users size={20} />} />
            </Row>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <Row justify="space-between" align="middle">
              <Space direction="vertical" size={2}>
                <Text type="secondary">Yêu cầu chờ duyệt</Text>
                <Title level={3} style={{ margin: 0 }}>{pendingRequests.length}</Title>
              </Space>
              <Avatar style={{ backgroundColor: '#fffbe6', color: '#d46b08' }} icon={<Clock size={20} />} />
            </Row>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <Row justify="space-between" align="middle">
              <Space direction="vertical" size={2}>
                <Text type="secondary">Đã duyệt tháng này</Text>
                <Title level={3} style={{ margin: 0 }}>{approvedThisMonth.length}</Title>
              </Space>
              <Avatar style={{ backgroundColor: '#f6ffed', color: '#389e0d' }} icon={<CheckCircle size={20} />} />
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={24}>
        {/* Left Side: Main Calendar */}
        <Col xs={24} lg={17}>
          <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            {isLoading ? (
              <div style={{ padding: 60, textAlign: 'center' }}><Spin /></div>
            ) : (
              <Calendar
                cellRender={dateCellRender}
                value={selectedDate}
                onSelect={setSelectedDate}
              />
            )}
          </Card>
        </Col>

        {/* Right Side: Info Panel for Selected Date */}
        <Col xs={24} lg={7}>
          <Card
            title={
              <Space>
                <CalendarDays size={16} className="text-primary" />
                <span>Nghỉ phép ngày {selectedDate.format('DD/MM/YYYY')}</span>
              </Space>
            }
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)', height: '100%' }}
          >
            {selectedDateRequests.length > 0 ? (
              <List
                itemLayout="horizontal"
                dataSource={selectedDateRequests}
                renderItem={(item) => {
                  const emp = item.employment?.employee;
                  const name = emp ? `${emp.lastName || ''} ${emp.firstName || ''}` : 'Nhân viên';
                  const initials = emp ? `${emp.lastName?.[0] || ''}${emp.firstName?.[0] || ''}` : 'NV';
                  return (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar style={{ backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary)' }}>
                            {initials}
                          </Avatar>
                        }
                        title={<Text strong>{name}</Text>}
                        description={
                          <Space direction="vertical" size={2}>
                            <Tag color="blue">{item.leaveType?.name || 'Phép năm'}</Tag>
                            <Text type="secondary" style={{ fontSize: 11 }}>Lý do: {item.reason || 'Nghỉ phép cá nhân'}</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            ) : (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <Text type="secondary">Không có nhân viên nào đăng ký nghỉ phép trong ngày này.</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
