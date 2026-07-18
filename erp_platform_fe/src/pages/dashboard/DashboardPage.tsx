import { useState } from 'react';
import { Row, Col, Card, Typography, List, Avatar, Tag, Space, Checkbox, Spin, Empty, Popconfirm } from 'antd';
import {
  Users,
  TrendingUp,
  UserPlus,
  FileCheck,
  PlusCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const { Title, Text } = Typography;

import { useEmployees } from '@features/employee/hooks/useEmployee';
import { useLeaveRequests, useApproveLeaveRequest, useRejectLeaveRequest } from '@features/leave/hooks/useLeave';
import { useAttendanceRecords } from '@features/attendance/hooks/useAttendance';

const COLORS = ['#0a65ff', '#10b981', '#a855f7', '#f59e0b', '#06b6d4'];

function DashboardPage() {
  const navigate = useNavigate();
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  const { data: leaveRequests = [], isLoading: isLoadingLeaves } = useLeaveRequests();
  const { data: _attendanceRecords = [], isLoading: isLoadingAttendance } = useAttendanceRecords();

  const approveMutation = useApproveLeaveRequest();
  const rejectMutation = useRejectLeaveRequest();

  const [todoList, setTodoList] = useState([
    { id: 1, text: 'Phê duyệt các đơn xin nghỉ phép', checked: false },
    { id: 2, text: 'Chốt bảng công ca làm việc tháng', checked: false },
    { id: 3, text: 'Đánh giá ứng viên ứng tuyển mới', checked: true },
    { id: 4, text: 'Cập nhật cấu hình bảo mật MFA hệ thống', checked: false },
  ]);

  const isLoading = isLoadingEmployees || isLoadingLeaves || isLoadingAttendance;

  // Calculators
  const totalEmployees = employees.length;
  const pendingLeaves = leaveRequests.filter((r) => r.status === 'pending');
  const pendingLeavesCount = pendingLeaves.length;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Group real employees by department
  const deptCounts: Record<string, number> = {};
  employees.forEach((emp) => {
    const currentEmployment = emp.employments?.find((e: any) => e.isCurrent) || emp.employments?.[0];
    const deptName = currentEmployment?.departmentName || 'Chưa phân phòng';
    deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
  });

  const departmentData = Object.keys(deptCounts).length > 0
    ? Object.entries(deptCounts).map(([name, value]) => ({ name, value }))
    : [
      { name: 'Kỹ thuật', value: 362 },
      { name: 'Nhân sự', value: 224 },
      { name: 'Kinh doanh', value: 250 },
      { name: 'Tài chính', value: 168 },
      { name: 'Vận hành', value: 244 },
    ];

  const totalDeptValue = departmentData.reduce((acc, curr) => acc + curr.value, 0);

  // Headcount growth trend (12 months)
  const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
  const monthlyHires = new Array(12).fill(0);
  employees.forEach((emp) => {
    const date = new Date(emp.joinDate || emp.createdAt);
    if (!isNaN(date.getTime())) {
      monthlyHires[date.getMonth()] += 1;
    }
  });

  let cumulative = 0;
  const growthData = months.map((month, idx) => {
    cumulative += monthlyHires[idx];
    // Fallback base values so graph has nice shape even if no database data
    const fallbackBase = Math.floor(1100 + idx * 25 + Math.sin(idx) * 15);
    return { month, Headcount: Math.max(fallbackBase, totalEmployees ? totalEmployees + cumulative : fallbackBase) };
  });

  const stats = [
    {
      title: 'Tổng nhân viên',
      value: totalEmployees || '1.248',
      icon: <Users size={20} />,
      trend: { value: '5.2%', isUp: true },
      trendText: 'so với tháng trước',
      color: '#0a65ff',
      bgColor: '#f0f6ff',
    },
    {
      title: 'Tỷ lệ đi làm',
      value: '94.6%',
      icon: <TrendingUp size={20} />,
      trend: { value: '2.3%', isUp: true },
      trendText: 'so với tuần trước',
      color: '#10b981',
      bgColor: '#ecfdf5',
    },
    {
      title: 'Vị trí tuyển dụng',
      value: 24,
      icon: <UserPlus size={20} />,
      trend: { value: '9.1%', isUp: true },
      trendText: 'so với tháng trước',
      color: '#a855f7',
      bgColor: '#faf5ff',
    },
    {
      title: 'Yêu cầu chờ duyệt',
      value: pendingLeavesCount || '3',
      icon: <FileCheck size={20} />,
      trend: { value: pendingLeavesCount ? `${pendingLeavesCount} đơn` : 'Đang xử lý', isUp: pendingLeavesCount > 0 },
      trendText: 'yêu cầu mới',
      color: '#f59e0b',
      bgColor: '#fffbeb',
    },
  ];

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

  const handleToggleTodo = (id: number) => {
    setTodoList(prev => prev.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
  };

  function getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      leave: '#f59e0b',
      approve: '#10b981',
      update: '#ef4444',
      checkin: '#0a65ff',
    };
    return colors[type] || '#94a3b8';
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Spin size="large" tip="Đang tải dữ liệu tổng quan..." />
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <Title level={3} style={{ marginBottom: 4, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--color-text-primary)' }}>
            Chào mừng trở lại, Spencer
          </Title>
          <Text type="secondary" style={{ fontSize: 13, fontWeight: 500 }}>
            Dưới đây là tổng quan hoạt động của tổ chức hôm nay.
          </Text>
        </div>
        <button className="inline-flex items-center justify-center px-4 h-[38px] bg-primary text-white border-none rounded-lg font-semibold text-[13px] cursor-pointer shadow-[0_4px_12px_rgba(10,101,255,0.15)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_6px_16px_rgba(10,101,255,0.25)]" onClick={() => navigate('/hrm/employees/new')}>
          <PlusCircle size={16} style={{ marginRight: 8 }} />
          Thêm nhân viên
        </button>
      </div>

      {/* Stat Cards */}
      <Row gutter={[20, 20]} className="mb-0">
        {stats.map((stat) => (
          <Col xs={24} sm={12} lg={6} key={stat.title}>
            <Card className="!rounded-2xl !border-solid !border-border-light shadow-[0_4px_20px_-2px_rgba(15,23,42,0.02)] transition-all duration-200 !bg-white hover:-translate-y-0.5 hover:shadow-[0_10px_25px_-5px_rgba(15,23,42,0.05)] hover:!border-primary/15" hoverable>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Text type="secondary" className="!text-[12px] !font-semibold !text-text-secondary uppercase tracking-wider">
                    {stat.title}
                  </Text>
                  <div className="flex flex-col mt-2">
                    <span className="text-[26px] font-extrabold text-text-primary tracking-tight leading-none">{stat.value}</span>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded ${stat.trend.isUp ? 'bg-success-light text-success' : 'bg-error-light text-error'}`}>
                        {stat.trend.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {stat.trend.value}
                      </span>
                      <span className="text-[11px] text-text-tertiary font-medium">{stat.trendText}</span>
                    </div>
                  </div>
                </div>
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: stat.bgColor, color: stat.color }}
                >
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Visual Chart Grid */}
      <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
        {/* Headcount by Department (Donut) */}
        <Col xs={24} lg={8}>
          <Card title="Nhân sự theo phòng ban" className="!rounded-2xl !border-solid !border-border-light shadow-[0_4px_20px_-2px_rgba(15,23,42,0.02)] !bg-white h-full [&_.ant-card-head]:!border-b [&_.ant-card-head]:!border-solid [&_.ant-card-head]:!border-border-light [&_.ant-card-head]:!min-h-0 [&_.ant-card-head]:!px-5 [&_.ant-card-head]:!py-4 [&_.ant-card-head-title]:!text-[14px] [&_.ant-card-head-title]:!font-bold [&_.ant-card-head-title]:!text-text-primary [&_.ant-card-body]:!p-5">
            <div className="flex justify-center items-center h-[200px] mb-2">
              <div className="relative w-[200px] h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {departmentData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Content */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[26px] font-extrabold text-text-primary leading-none tracking-tight">{totalDeptValue}</span>
                  <span className="text-[10px] text-text-tertiary font-semibold uppercase tracking-wider mt-0.5">Tổng số</span>
                </div>
              </div>
            </div>
            {/* Custom Styled Legends */}
            <div className="flex flex-col gap-2 mt-4 border-0 border-t border-solid border-border-light pt-4">
              {departmentData.map((dept, index) => (
                <div key={dept.name} className="flex items-center text-xs">
                  <span className="w-2 h-2 rounded-full mr-2 inline-block shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-text-secondary flex-1 font-medium">{dept.name}</span>
                  <span className="text-text-tertiary text-[11px] mr-3 font-medium">{Math.round((dept.value / totalDeptValue) * 100)}%</span>
                  <span className="font-semibold text-text-primary">{dept.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Employee Growth (Area Chart) */}
        <Col xs={24} lg={10}>
          <Card title="Xu hướng nhân sự hàng tháng" className="!rounded-2xl !border-solid !border-border-light shadow-[0_4px_20px_-2px_rgba(15,23,42,0.02)] !bg-white h-full [&_.ant-card-head]:!border-b [&_.ant-card-head]:!border-solid [&_.ant-card-head]:!border-border-light [&_.ant-card-head]:!min-h-0 [&_.ant-card-head]:!px-5 [&_.ant-card-head]:!py-4 [&_.ant-card-head-title]:!text-[14px] [&_.ant-card-head-title]:!font-bold [&_.ant-card-head-title]:!text-text-primary [&_.ant-card-body]:!p-5">
            <div style={{ height: 260, marginTop: 10 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHeadcount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0a65ff" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0a65ff" stopOpacity={0.005} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    style={{ fontSize: 11, fill: 'var(--color-text-tertiary)', fontWeight: 500 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    domain={['dataMin - 100', 'dataMax + 100']}
                    style={{ fontSize: 11, fill: 'var(--color-text-tertiary)', fontWeight: 500 }}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Headcount"
                    name="Số nhân sự"
                    stroke="#0a65ff"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorHeadcount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* To-Do List */}
        <Col xs={24} lg={6}>
          <Card title="Công việc cần làm" className="!rounded-2xl !border-solid !border-border-light shadow-[0_4px_20px_-2px_rgba(15,23,42,0.02)] !bg-white h-full [&_.ant-card-head]:!border-b [&_.ant-card-head]:!border-solid [&_.ant-card-head]:!border-border-light [&_.ant-card-head]:!min-h-0 [&_.ant-card-head]:!px-5 [&_.ant-card-head]:!py-4 [&_.ant-card-head-title]:!text-[14px] [&_.ant-card-head-title]:!font-bold [&_.ant-card-head-title]:!text-text-primary [&_.ant-card-body]:!p-5">
            <List
              dataSource={todoList}
              renderItem={(item) => (
                <List.Item style={{ padding: '12px 4px', borderBottom: '1px solid var(--color-border-light)' }}>
                  <Checkbox
                    checked={item.checked}
                    onChange={() => handleToggleTodo(item.id)}
                    style={{
                      textDecoration: item.checked ? 'line-through' : 'none',
                      color: item.checked ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
                      fontSize: 13,
                      fontWeight: item.checked ? 400 : 500
                    }}
                  >
                    {item.text}
                  </Checkbox>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Content Grid */}
      <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
        {/* Recent Activities */}
        <Col xs={24} lg={14}>
          <Card title="Hoạt động gần đây" className="!rounded-2xl !border-solid !border-border-light shadow-[0_4px_20px_-2px_rgba(15,23,42,0.02)] !bg-white h-full [&_.ant-card-head]:!border-b [&_.ant-card-head]:!border-solid [&_.ant-card-head]:!border-border-light [&_.ant-card-head]:!min-h-0 [&_.ant-card-head]:!px-5 [&_.ant-card-head]:!py-4 [&_.ant-card-head-title]:!text-[14px] [&_.ant-card-head-title]:!font-bold [&_.ant-card-head-title]:!text-text-primary [&_.ant-card-body]:!p-5">
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
                            fontSize: 11,
                            fontWeight: 600,
                            color: 'white',
                          }}
                        >
                          {item.avatar}
                        </Avatar>
                      }
                      title={
                        <Text style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>
                          <Text strong>{item.user}</Text> {item.action}
                        </Text>
                      }
                      description={
                        <Space size={6} style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
                          <Clock size={12} />
                          <span>{item.time}</span>
                        </Space>
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
                <span>Đơn chờ phê duyệt</span>
                <Tag color="blue" style={{ borderRadius: 6, fontWeight: 600 }}>{pendingLeavesCount}</Tag>
              </Space>
            }
            className="!rounded-2xl !border-solid !border-border-light shadow-[0_4px_20px_-2px_rgba(15,23,42,0.02)] !bg-white h-full [&_.ant-card-head]:!border-b [&_.ant-card-head]:!border-solid [&_.ant-card-head]:!border-border-light [&_.ant-card-head]:!min-h-0 [&_.ant-card-head]:!px-5 [&_.ant-card-head]:!py-4 [&_.ant-card-head-title]:!text-[14px] [&_.ant-card-head-title]:!font-bold [&_.ant-card-head-title]:!text-text-primary [&_.ant-card-body]:!p-5"
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
                          <a style={{ color: 'var(--color-success)', fontSize: 13, fontWeight: 600 }}>Duyệt</a>
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
                          <a style={{ color: 'var(--color-error)', fontSize: 13, fontWeight: 600 }}>Từ chối</a>
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
                            <Tag color="blue-light" style={{ fontSize: 10, borderRadius: 4, border: 'none', background: '#f0f6ff', color: '#0a65ff', fontWeight: 600 }}>
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
