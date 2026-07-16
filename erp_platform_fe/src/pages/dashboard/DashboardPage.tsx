import { Row, Col, Card, Statistic, Typography, List, Avatar, Tag, Space } from 'antd';
import {
  Users,
  CalendarCheck,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  FileCheck,
} from 'lucide-react';
import './DashboardPage.css';

const { Title, Text } = Typography;

/**
 * DashboardPage — Overview dashboard with key metrics
 *
 * Widgets map to backend HRM module aggregations:
 * - Employee count
 * - Pending leave requests
 * - Today's attendance
 * - Performance stats
 */

import { useEmployees } from '@features/employee/hooks/useEmployee';
import { useLeaveRequests, useApproveLeaveRequest, useRejectLeaveRequest } from '@features/leave/hooks/useLeave';
import { useAttendanceRecords } from '@features/attendance/hooks/useAttendance';
import { Spin, Empty, Popconfirm, message } from 'antd';

function DashboardPage() {
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  const { data: leaveRequests = [], isLoading: isLoadingLeaves } = useLeaveRequests();
  const { data: attendanceRecords = [], isLoading: isLoadingAttendance } = useAttendanceRecords();

  const approveMutation = useApproveLeaveRequest();
  const rejectMutation = useRejectLeaveRequest();

  const isLoading = isLoadingEmployees || isLoadingLeaves || isLoadingAttendance;

  // Calculators
  const totalEmployees = employees.length;
  const pendingLeaves = leaveRequests.filter((r) => r.status === 'pending');
  const pendingLeavesCount = pendingLeaves.length;

  const todayStr = new Date().toDateString();
  const todayAttendanceCount = attendanceRecords.filter((r) => {
    return r.attendanceDate && new Date(r.attendanceDate).toDateString() === todayStr && r.status === 'present';
  }).length;
  const attendanceRate = totalEmployees > 0 ? Math.round((todayAttendanceCount / totalEmployees) * 100) : 0;

  // Recruitment count - just dummy based on employees created in last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newHires = employees.filter((e) => new Date(e.createdAt) >= thirtyDaysAgo).length;

  const stats = [
    {
      title: 'Tổng nhân viên',
      value: totalEmployees,
      icon: <Users size={22} />,
      trend: { value: employees.length > 0 ? 100 : 0, isUp: true, suffix: '%' },
      color: '#6366f1',
      bgColor: '#eef2ff',
    },
    {
      title: 'Đơn chờ duyệt',
      value: pendingLeavesCount,
      icon: <FileCheck size={22} />,
      trend: { value: pendingLeavesCount, isUp: pendingLeavesCount > 0 },
      color: '#f59e0b',
      bgColor: '#fffbeb',
    },
    {
      title: 'Có mặt hôm nay',
      value: todayAttendanceCount,
      icon: <CalendarCheck size={22} />,
      trend: { value: attendanceRate, isUp: true, suffix: '%' },
      color: '#10b981',
      bgColor: '#ecfdf5',
    },
    {
      title: 'Nhân viên mới (30 ngày)',
      value: newHires,
      icon: <UserPlus size={22} />,
      trend: { value: newHires > 0 ? 100 : 0, isUp: true, suffix: '%' },
      color: '#3b82f6',
      bgColor: '#eff6ff',
    },
  ];

  // Activities mapping from real leave requests
  const recentActivities = leaveRequests
    .slice(0, 5)
    .map((req) => {
      const emp = req.employment?.employee;
      const initials = emp ? `${emp.lastName?.[0] || ''}${emp.firstName?.[0] || ''}` : 'NV';
      const name = emp ? `${emp.lastName} ${emp.firstName}` : 'Nhân viên';

      let action = 'đã gửi đơn xin nghỉ phép';
      if (req.status === 'approved') action = 'đã được duyệt đơn nghỉ phép';
      if (req.status === 'rejected') action = 'đã bị từ chối đơn nghỉ phép';

      return {
        id: req.id,
        user: name,
        action,
        time: new Date(req.updatedAt || req.createdAt).toLocaleDateString('vi-VN'),
        avatar: initials || 'NV',
        type: req.status === 'approved' ? 'approve' : req.status === 'rejected' ? 'update' : 'leave',
      };
    });

  const handleApprove = async (id: string) => {
    try {
      await approveMutation.mutateAsync(id);
    } catch {
      // Handled
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectMutation.mutateAsync({ id });
    } catch {
      // Handled
    }
  };

  function getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      leave: '#f59e0b',
      approve: '#10b981',
      update: '#3b82f6',
      checkin: '#6366f1',
      training: '#8b5cf6',
    };
    return colors[type] || '#94a3b8';
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" tip="Đang tải dữ liệu tổng quan..." />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <div className="dashboard-page__header">
        <div>
          <Title level={4} style={{ marginBottom: 4 }}>
            Tổng quan
          </Title>
          <Text type="secondary">Chào mừng trở lại! Đây là tổng quan hệ thống hôm nay.</Text>
        </div>
      </div>

      {/* Stat Cards */}
      <Row gutter={[20, 20]} className="dashboard-page__stats">
        {stats.map((stat) => (
          <Col xs={24} sm={12} lg={6} key={stat.title}>
            <Card className="dashboard-page__stat-card" hoverable>
              <div className="dashboard-page__stat-content">
                <div className="dashboard-page__stat-info">
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {stat.title}
                  </Text>
                  <div className="dashboard-page__stat-value-row">
                    <Statistic
                      value={stat.value}
                      valueStyle={{
                        fontSize: 28,
                        fontWeight: 700,
                        lineHeight: '36px',
                        color: 'var(--color-text-primary)',
                      }}
                    />
                    <span
                      className={`dashboard-page__stat-trend ${
                        stat.trend.isUp ? 'dashboard-page__stat-trend--up' : 'dashboard-page__stat-trend--down'
                      }`}
                    >
                      {stat.trend.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {stat.trend.value}{stat.trend.suffix || ''}
                    </span>
                  </div>
                </div>
                <div
                  className="dashboard-page__stat-icon"
                  style={{ background: stat.bgColor, color: stat.color }}
                >
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Content Grid */}
      <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
        {/* Recent Activities */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <Clock size={16} />
                <span>Hoạt động gần đây</span>
              </Space>
            }
            className="dashboard-page__card"
          >
            {recentActivities.length === 0 ? (
              <Empty description="Không có hoạt động gần đây" />
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={recentActivities}
                renderItem={(item) => (
                  <List.Item style={{ padding: '12px 0' }}>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          size={36}
                          style={{
                            background: getTypeColor(item.type),
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {item.avatar}
                        </Avatar>
                      }
                      title={
                        <Text style={{ fontSize: 13 }}>
                          <Text strong>{item.user}</Text> {item.action}
                        </Text>
                      }
                      description={
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.time}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        {/* Pending Approvals */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <TrendingUp size={16} />
                <span>Đơn chờ phê duyệt</span>
                <Tag color="orange">{pendingLeavesCount}</Tag>
              </Space>
            }
            className="dashboard-page__card"
          >
            {pendingLeaves.length === 0 ? (
              <Empty description="Không có đơn chờ duyệt" />
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={pendingLeaves}
                renderItem={(item) => {
                  const emp = item.employment?.employee;
                  const name = emp ? `${emp.lastName} ${emp.firstName}` : 'Nhân viên';
                  const daysStr = typeof item.totalDays === 'object' && item.totalDays !== null ? Number(item.totalDays).toString() : String(item.totalDays || 0);

                  return (
                    <List.Item
                      style={{ padding: '12px 0' }}
                      actions={[
                        <Popconfirm
                          key="approve"
                          title="Duyệt đơn nghỉ phép"
                          description="Duyệt đơn của nhân viên này?"
                          onConfirm={() => handleApprove(item.id)}
                          okText="Duyệt"
                          cancelText="Hủy"
                        >
                          <a style={{ color: 'var(--color-success)', fontSize: 13 }}>Duyệt</a>
                        </Popconfirm>,
                        <Popconfirm
                          key="reject"
                          title="Từ chối đơn"
                          description="Từ chối đơn của nhân viên này?"
                          onConfirm={() => handleReject(item.id)}
                          okText="Từ chối"
                          cancelText="Hủy"
                          okType="danger"
                        >
                          <a style={{ color: 'var(--color-error)', fontSize: 13 }}>Từ chối</a>
                        </Popconfirm>,
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Text strong style={{ fontSize: 13 }}>
                            {name}
                          </Text>
                        }
                        description={
                          <Space size={4}>
                            <Tag color="blue" style={{ fontSize: 11 }}>
                              {item.leaveType?.name || 'Phép năm'}
                            </Tag>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {daysStr} ngày
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default DashboardPage;
