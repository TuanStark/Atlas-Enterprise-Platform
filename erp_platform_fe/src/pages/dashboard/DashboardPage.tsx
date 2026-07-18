import { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, List, Avatar, Tag, Space, Checkbox, Spin, Empty, Popconfirm, message, Button } from 'antd';
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
import { useAttendanceRecords, useAttendanceByEmployment, useCheckIn, useCheckOut } from '@features/attendance/hooks/useAttendance';
import { useJobPostings, useJobApplications } from '@features/recruitment/hooks/useRecruitment';
import { useCurrentUser } from '@features/auth/hooks/useAuth';

const COLORS = ['#0a65ff', '#10b981', '#a855f7', '#f59e0b', '#06b6d4'];

function DashboardPage() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  const { data: leaveRequests = [], isLoading: isLoadingLeaves } = useLeaveRequests();
  const { data: attendanceRecords = [], isLoading: isLoadingAttendance } = useAttendanceRecords();
  const { data: jobPostings = [], isLoading: isLoadingPostings } = useJobPostings();
  const { data: jobApplications = [], isLoading: isLoadingApplications } = useJobApplications();

  const approveMutation = useApproveLeaveRequest();
  const rejectMutation = useRejectLeaveRequest();

  // Find current user's employee & active employment
  const currentUserEmployee = employees.find((emp: any) => emp.principalId === user?.principalId);
  const currentEmployment = currentUserEmployee?.employments?.find((e: any) => e.isCurrent) || currentUserEmployee?.employments?.[0];
  const employmentId = currentEmployment?.id;

  // Fetch current user's attendance records
  const { data: userAttendanceRecords = [], isLoading: isLoadingUserAttendance } = useAttendanceByEmployment(employmentId);

  // Digital clock state
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Check-in and Check-out mutations
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  // Find today's attendance record
  const todayRecord = userAttendanceRecords.find((rec: any) => {
    const recDate = new Date(rec.attendanceDate);
    const today = new Date();
    return recDate.getDate() === today.getDate() &&
           recDate.getMonth() === today.getMonth() &&
           recDate.getFullYear() === today.getFullYear();
  });

  const handleWebCheckIn = async () => {
    if (!employmentId) {
      message.error('Không tìm thấy thông tin hợp đồng nhân sự của bạn!');
      return;
    }
    try {
      await checkInMutation.mutateAsync({
        employmentId,
        checkInTime: new Date().toISOString(),
        source: 'web',
      });
    } catch {
      // Handled in hook
    }
  };

  const handleWebCheckOut = async () => {
    if (!todayRecord) return;
    try {
      await checkOutMutation.mutateAsync({
        recordId: todayRecord.id,
        dto: {
          checkOutTime: new Date().toISOString(),
          source: 'web',
        },
      });
    } catch {
      // Handled in hook
    }
  };

  const [todoList, setTodoList] = useState([
    { id: 1, text: 'Phê duyệt các đơn xin nghỉ phép', checked: false },
    { id: 2, text: 'Chốt bảng công ca làm việc tháng', checked: false },
    { id: 3, text: 'Đánh giá ứng viên ứng tuyển mới', checked: true },
    { id: 4, text: 'Cập nhật cấu hình bảo mật MFA hệ thống', checked: false },
  ]);

  const isLoading = isLoadingEmployees || isLoadingLeaves || isLoadingAttendance || isLoadingPostings || isLoadingApplications;

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

  const departmentData = Object.entries(deptCounts).map(([name, value]) => ({ name, value }));

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

  // Calculate starting headcount before this year
  const totalHiresThisYear = monthlyHires.reduce((a, b) => a + b, 0);
  let cumulative = Math.max(0, totalEmployees - totalHiresThisYear);
  const growthData = months.map((month, idx) => {
    cumulative += monthlyHires[idx];
    return { month, Headcount: cumulative };
  });

  // Calculate attendance rate dynamically
  const presentRecordsCount = attendanceRecords.filter((r) => r.status !== 'absent').length;
  const totalAttendanceCount = attendanceRecords.length;
  const attendanceRate = totalAttendanceCount > 0
    ? `${((presentRecordsCount / totalAttendanceCount) * 100).toFixed(1)}%`
    : '0.0%';

  // Calculate recruitment open positions & candidates dynamically
  const openPositionsCount = jobPostings.filter((p) => p.status === 'published').reduce((acc, curr) => acc + (curr.vacancies || 1), 0);
  const pendingApplicationsCount = jobApplications.filter((a) => a.stage === 'new' || a.status === 'active').length;

  // New hires in last 30 days for employee card trend
  const newHiresLast30Days = employees.filter(emp => {
    const date = new Date(emp.joinDate || emp.createdAt);
    return date >= thirtyDaysAgo;
  }).length;

  const stats = [
    {
      title: 'Tổng nhân viên',
      value: totalEmployees.toString(),
      icon: <Users size={20} />,
      trend: { value: `+${newHiresLast30Days}`, isUp: true },
      trendText: 'mới trong 30 ngày',
      color: '#0a65ff',
      bgColor: '#f0f6ff',
    },
    {
      title: 'Tỷ lệ đi làm',
      value: attendanceRate,
      icon: <TrendingUp size={20} />,
      trend: { value: `${presentRecordsCount}/${totalAttendanceCount}`, isUp: true },
      trendText: 'lượt có mặt',
      color: '#10b981',
      bgColor: '#ecfdf5',
    },
    {
      title: 'Vị trí tuyển dụng',
      value: openPositionsCount,
      icon: <UserPlus size={20} />,
      trend: { value: `${pendingApplicationsCount} hồ sơ`, isUp: pendingApplicationsCount > 0 },
      trendText: 'chờ xử lý',
      color: '#a855f7',
      bgColor: '#faf5ff',
    },
    {
      title: 'Yêu cầu chờ duyệt',
      value: pendingLeavesCount,
      icon: <FileCheck size={20} />,
      trend: { value: `${pendingLeavesCount} đơn`, isUp: pendingLeavesCount > 0 },
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
            Chào mừng trở lại, {user?.displayName || 'Admin'}
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

      {/* Stat Cards & Web Check-in Widget */}
      <Row gutter={[20, 20]} className="mb-0 items-stretch">
        <Col xs={24} lg={18}>
          <Row gutter={[20, 20]} className="h-full">
            {stats.map((stat) => (
              <Col xs={24} sm={12} lg={6} key={stat.title}>
                <Card className="!rounded-2xl !border-border-light shadow-[0_4px_20px_-2px_rgba(15,23,42,0.02)] transition-all duration-200 !bg-white hover:-translate-y-0.5 hover:shadow-[0_10px_25px_-5px_rgba(15,23,42,0.05)] hover:!border-primary/15 h-full" hoverable>
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
        </Col>

        <Col xs={24} lg={6}>
          <Card 
            className="!rounded-2xl !border-border-light shadow-[0_4px_20px_-2px_rgba(15,23,42,0.02)] !bg-white [&_.ant-card-body]:!p-4 h-full flex flex-col justify-center"
          >
            <div className="flex flex-col items-center">
              <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                Chấm công trực tuyến
              </div>
              <div className="text-[22px] font-extrabold text-text-primary tracking-tight leading-none mb-1">
                {currentTime.toLocaleTimeString('vi-VN')}
              </div>
              <div className="text-[11px] text-text-tertiary font-medium mb-3">
                {currentTime.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>

              {/* Status Tag */}
              <div className="mb-3">
                {isLoadingUserAttendance ? (
                  <Spin size="small" />
                ) : !todayRecord?.checkInAt ? (
                  <Tag color="default" className="px-3 py-0.5 rounded-full font-semibold border-none !text-[11px]">Chưa Check-in</Tag>
                ) : !todayRecord?.checkOutAt ? (
                  <Tag color="processing" className="px-3 py-0.5 rounded-full font-semibold border-none !text-[11px]">Đang làm việc</Tag>
                ) : (
                  <Tag color="success" className="px-3 py-0.5 rounded-full font-semibold border-none !text-[11px]">Đã hoàn thành</Tag>
                )}
              </div>

              {/* Check-in/out button */}
              <div className="w-full flex flex-col gap-2">
                {isLoadingUserAttendance ? (
                  <Button block disabled size="middle" className="rounded-xl font-bold">Đang tải...</Button>
                ) : !todayRecord?.checkInAt ? (
                  <Button 
                    type="primary" 
                    block 
                    size="middle" 
                    icon={<Clock size={15} />} 
                    loading={checkInMutation.isPending}
                    onClick={handleWebCheckIn}
                    className="!rounded-xl font-bold bg-primary hover:bg-primary-hover shadow-sm text-xs h-[36px]"
                  >
                    Check In
                  </Button>
                ) : !todayRecord?.checkOutAt ? (
                  <Popconfirm
                    title="Xác nhận Check-out"
                    description="Bạn có chắc chắn muốn Check-out ca làm việc hôm nay?"
                    onConfirm={handleWebCheckOut}
                    okText="Đồng ý"
                    cancelText="Hủy"
                    placement="topRight"
                  >
                    <Button 
                      type="primary" 
                      danger
                      block 
                      size="middle" 
                      icon={<Clock size={15} />} 
                      loading={checkOutMutation.isPending}
                      className="!rounded-xl font-bold shadow-sm text-xs h-[36px]"
                    >
                      Check Out
                    </Button>
                  </Popconfirm>
                ) : (
                  <Button 
                    block 
                    disabled 
                    size="middle" 
                    className="!rounded-xl font-bold text-xs h-[36px]"
                  >
                    Đã hoàn thành ngày công
                  </Button>
                )}
              </div>

              {/* Today's detail metrics */}
              {todayRecord && (
                <div className="w-full mt-3 pt-3 border-0 border-t border-solid border-border-light flex justify-around text-center text-[11px]">
                  <div>
                    <div className="text-text-tertiary font-medium">Giờ vào</div>
                    <div className="font-semibold text-text-primary mt-0.5">
                      {todayRecord.checkInAt ? new Date(todayRecord.checkInAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </div>
                  </div>
                  <div className="w-[1px] bg-border-light self-stretch" />
                  <div>
                    <div className="text-text-tertiary font-medium">Giờ ra</div>
                    <div className="font-semibold text-text-primary mt-0.5">
                      {todayRecord.checkOutAt ? new Date(todayRecord.checkOutAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </div>
                  </div>
                  <div className="w-[1px] bg-border-light self-stretch" />
                  <div>
                    <div className="text-text-tertiary font-medium">Giờ làm</div>
                    <div className="font-semibold text-text-primary mt-0.5">
                      {todayRecord.workedMinutes && todayRecord.workedMinutes > 0 ? `${(todayRecord.workedMinutes / 60).toFixed(1)}h` : '-'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Visual Chart Grid */}
      <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
        {/* Headcount by Department (Donut) */}
        <Col xs={24} lg={8}>
          <Card title="Nhân sự theo phòng ban" className="!rounded-2xl !border-border-light shadow-[0_4px_20px_-2px_rgba(15,23,42,0.02)] !bg-white h-full [&_.ant-card-head]:!border-border-light [&_.ant-card-head]:!min-h-0 [&_.ant-card-head]:!px-5 [&_.ant-card-head]:!py-4 [&_.ant-card-head-title]:!text-[14px] [&_.ant-card-head-title]:!font-bold [&_.ant-card-head-title]:!text-text-primary [&_.ant-card-body]:!p-5">
            {departmentData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[260px]">
                <Empty description="Chưa có dữ liệu phòng ban" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            ) : (
              <>
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
                      <span className="text-text-tertiary text-[11px] mr-3 font-medium">
                        {totalDeptValue > 0 ? Math.round((dept.value / totalDeptValue) * 100) : 0}%
                      </span>
                      <span className="font-semibold text-text-primary">{dept.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </Col>

        {/* Employee Growth (Area Chart) */}
        <Col xs={24} lg={10}>
          <Card title="Xu hướng nhân sự hàng tháng" className="!rounded-2xl !border-border-light shadow-[0_4px_20px_-2px_rgba(15,23,42,0.02)] !bg-white h-full [&_.ant-card-head]:!border-border-light [&_.ant-card-head]:!min-h-0 [&_.ant-card-head]:!px-5 [&_.ant-card-head]:!py-4 [&_.ant-card-head-title]:!text-[14px] [&_.ant-card-head-title]:!font-bold [&_.ant-card-head-title]:!text-text-primary [&_.ant-card-body]:!p-5">
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
                    domain={[0, 'auto']}
                    allowDecimals={false}
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
          <Card title="Công việc cần làm" className="!rounded-2xl !border-border-light shadow-[0_4px_20px_-2px_rgba(15,23,42,0.02)] !bg-white h-full [&_.ant-card-head]:!border-border-light [&_.ant-card-head]:!min-h-0 [&_.ant-card-head]:!px-5 [&_.ant-card-head]:!py-4 [&_.ant-card-head-title]:!text-[14px] [&_.ant-card-head-title]:!font-bold [&_.ant-card-head-title]:!text-text-primary [&_.ant-card-body]:!p-5">
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
          <Card title="Hoạt động gần đây" className="!rounded-2xl !border-border-light shadow-[0_4px_20px_-2px_rgba(15,23,42,0.02)] !bg-white h-full [&_.ant-card-head]:!border-border-light [&_.ant-card-head]:!min-h-0 [&_.ant-card-head]:!px-5 [&_.ant-card-head]:!py-4 [&_.ant-card-head-title]:!text-[14px] [&_.ant-card-head-title]:!font-bold [&_.ant-card-head-title]:!text-text-primary [&_.ant-card-body]:!p-5">
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
            className="!rounded-2xl !border-border-light shadow-[0_4px_20px_-2px_rgba(15,23,42,0.02)] !bg-white h-full [&_.ant-card-head]:!border-border-light [&_.ant-card-head]:!min-h-0 [&_.ant-card-head]:!px-5 [&_.ant-card-head]:!py-4 [&_.ant-card-head-title]:!text-[14px] [&_.ant-card-head-title]:!font-bold [&_.ant-card-head-title]:!text-text-primary [&_.ant-card-body]:!p-5"
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
