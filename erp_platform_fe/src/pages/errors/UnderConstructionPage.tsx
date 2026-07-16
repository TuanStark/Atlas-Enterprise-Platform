import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Typography, Space } from 'antd';
import {
  ArrowLeft,
  Construction,
  Wallet,
  UserPlus,
  Target,
  GraduationCap,
  Clock,
  CalendarDays,
  Building2,
  Users,
  Shield,
  Settings,
  Workflow
} from 'lucide-react';

const { Title, Text } = Typography;

interface PageConfig {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const routeConfigs: Record<string, PageConfig> = {
  '/hrm/payroll': {
    title: 'Quản lý Bảng lương',
    description: 'Hệ thống tự động tính lương, thuế thu nhập cá nhân và xuất phiếu lương (payslips) đang được phát triển.',
    icon: <Wallet size={48} className="text-primary" />
  },
  '/hrm/recruitment': {
    title: 'Hồ sơ Tuyển dụng',
    description: 'Nơi quản lý danh sách ứng viên, lịch phỏng vấn và quy trình tuyển chọn nhân tài mới.',
    icon: <UserPlus size={48} className="text-primary" />
  },
  '/hrm/performance': {
    title: 'Đánh giá nhân sự',
    description: 'Module theo dõi KPI, OKR và đánh giá năng lực định kỳ của nhân viên đang được thiết lập.',
    icon: <Target size={48} className="text-primary" />
  },
  '/hrm/training': {
    title: 'Đào tạo nội bộ',
    description: 'Hệ thống quản lý khóa học, theo dõi tiến độ học tập và cấp chứng chỉ đào tạo cho nhân viên.',
    icon: <GraduationCap size={48} className="text-primary" />
  },
  '/hrm/shifts': {
    title: 'Ca làm việc',
    description: 'Công cụ lập lịch phân ca, quản lý ca kíp và xoay ca làm việc linh hoạt.',
    icon: <Clock size={48} className="text-primary" />
  },
  '/hrm/timesheet': {
    title: 'Bảng công tháng',
    description: 'Dữ liệu tổng hợp giờ công, ngày công thực tế sau khi đối chiếu chấm công và ca làm việc.',
    icon: <Clock size={48} className="text-primary" />
  },
  '/hrm/leave-calendar': {
    title: 'Lịch nghỉ phép',
    description: 'Bản đồ theo dõi lịch nghỉ của toàn công ty, giúp tối ưu hóa quản lý nguồn lực.',
    icon: <CalendarDays size={48} className="text-primary" />
  },
  '/hrm/payroll-runs': {
    title: 'Chu kỳ tính lương',
    description: 'Bảng điều khiển chạy tính toán lương hàng tháng cho doanh nghiệp.',
    icon: <Wallet size={48} className="text-primary" />
  },
  '/hrm/recruitment-board': {
    title: 'Kênh tuyển dụng',
    description: 'Bảng Kanban quản lý quy trình ứng tuyển từ nộp hồ sơ đến onboarding.',
    icon: <UserPlus size={48} className="text-primary" />
  },
  '/hrm/performance-cycles': {
    title: 'Chu kỳ đánh giá',
    description: 'Thiết lập thời gian và chu kỳ đánh giá hiệu suất của các phòng ban.',
    icon: <Target size={48} className="text-primary" />
  },
  '/hrm/training-courses': {
    title: 'Khóa học đào tạo',
    description: 'Danh sách các tài liệu học tập, slide và video đào tạo kỹ năng doanh nghiệp.',
    icon: <GraduationCap size={48} className="text-primary" />
  },
  '/organization': {
    title: 'Cơ cấu Tổ chức',
    description: 'Quản lý sơ đồ tổ chức công ty, chi nhánh và phòng ban trực thuộc.',
    icon: <Building2 size={48} className="text-primary" />
  },
  '/admin/users': {
    title: 'Quản lý tài khoản',
    description: 'Nơi quản trị các tài khoản hệ thống của nhân viên, khóa/mở khóa tài khoản.',
    icon: <Users size={48} className="text-primary" />
  },
  '/admin/roles': {
    title: 'Vai trò & Quyền hạn',
    description: 'Phân cấp quyền truy cập chi tiết (RBAC) cho từng nhóm vai trò trong doanh nghiệp.',
    icon: <Shield size={48} className="text-primary" />
  },
  '/admin/workflows': {
    title: 'Thiết lập quy trình',
    description: 'Trình kéo thả định nghĩa các bước phê duyệt tự động (Workflows) trong ERP.',
    icon: <Workflow size={48} className="text-primary" />
  },
  '/admin/settings': {
    title: 'Cấu hình hệ thống',
    description: 'Quản lý tham số hệ thống, kết nối mail server, tích hợp và các cấu hình bảo mật nâng cao.',
    icon: <Settings size={48} className="text-primary" />
  }
};

function UnderConstructionPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;
  const config = routeConfigs[currentPath] || {
    title: 'Tính năng đang phát triển',
    description: 'Trang này hiện đang được nâng cấp và sẽ sớm ra mắt trong phiên bản tiếp theo.',
    icon: <Construction size={48} style={{ color: 'var(--color-warning)' }} />
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 160px)',
      padding: '24px 0'
    }}>
      <Card style={{
        maxWidth: 500,
        width: '100%',
        borderRadius: 16,
        textAlign: 'center',
        border: '1px solid var(--color-border-light)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: 'var(--color-bg-light)',
            margin: '0 auto'
          }}>
            {config.icon}
          </div>

          <div>
            <Title level={4} style={{ marginBottom: 8 }}>{config.title}</Title>
            <Text type="secondary" style={{ display: 'block', fontSize: 14 }}>
              {config.description}
            </Text>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 16px',
            background: '#fffbeb',
            borderRadius: 8,
            border: '1px solid #ffe8cc'
          }}>
            <Construction size={16} style={{ color: '#f59e0b', marginRight: 8 }} />
            <Text style={{ fontSize: 13, color: '#b25e00', fontWeight: 500 }}>
              Tính năng đang được hoàn thiện dưới chuẩn Enterprise
            </Text>
          </div>

          <Button 
            type="primary" 
            icon={<ArrowLeft size={16} />} 
            onClick={() => navigate('/dashboard')}
            style={{ borderRadius: 8, height: 40 }}
          >
            Quay lại Tổng quan
          </Button>
        </Space>
      </Card>
    </div>
  );
}

export default UnderConstructionPage;
