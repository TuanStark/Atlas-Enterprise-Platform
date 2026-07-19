import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Tag, Button, Space, Avatar, Typography, Row, Col, Timeline, Spin, Descriptions } from 'antd';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Briefcase, Calendar, User, FileText } from 'lucide-react';
import { useEmployee } from '@features/employee/hooks/useEmployee';
import { PermissionGate } from '@shared/hooks/usePermission';
import { PERMISSIONS } from '@shared/constants/permissions';

const { Title, Text } = Typography;

const statusConfig: Record<string, { color: string; label: string }> = {
  active: { color: 'green', label: 'Chính thức' },
  probation: { color: 'orange', label: 'Thử việc' },
  suspended: { color: 'red', label: 'Tạm ngưng' },
  resigned: { color: 'default', label: 'Nghỉ việc' },
};

function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: employee, isLoading, error } = useEmployee(id);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Spin size="large" tip="Đang tải thông tin nhân viên..." />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <Card style={{ borderRadius: 12, border: '1px solid var(--color-border-light)', textAlign: 'center', padding: 40 }}>
        <Text type="secondary">Không tìm thấy thông tin nhân viên hoặc đã xảy ra lỗi.</Text>
        <div style={{ marginTop: 16 }}>
          <Button onClick={() => navigate('/hrm/employees')}>Quay lại danh sách</Button>
        </div>
      </Card>
    );
  }

  const email = employee.contacts?.find(c => c.type === 'email' || (c as any).contactType === 'email')?.value || '-';
  const phone = employee.contacts?.find(c => c.type === 'phone' || (c as any).contactType === 'phone' || (c as any).contactType === 'mobile')?.value || '-';
  const primaryAddress = employee.addresses?.find(a => a.isPrimary) || employee.addresses?.[0];
  const addressStr = primaryAddress
    ? [primaryAddress.addressLine1 || (primaryAddress as any).addressLine, primaryAddress.city, primaryAddress.country].filter(Boolean).join(', ')
    : '-';

  const currentEmployment = employee.employments?.find(e => e.isCurrent) || employee.employments?.[0];
  const departmentName = currentEmployment?.departmentName || '-';
  const jobTitleName = currentEmployment?.jobTitleName || '-';
  const code = employee.employeeCode || (employee as any).employeeNo || '-';
  const statusInfo = statusConfig[employee.status] || { color: 'blue', label: employee.status || 'Chính thức' };

  const tabItems = [
    {
      key: 'info',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <User size={14} />
          Thông tin cá nhân
        </span>
      ),
      children: (
        <div style={{ padding: '8px 0' }}>
          <Descriptions column={{ xs: 1, sm: 2 }} size="middle" bordered={false} labelStyle={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            <Descriptions.Item label="Họ & Tên">{`${employee.lastName} ${employee.firstName}`}</Descriptions.Item>
            <Descriptions.Item label="Mã nhân viên">{code}</Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">{employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString('vi-VN') : '-'}</Descriptions.Item>
            <Descriptions.Item label="Giới tính">{employee.gender === 'male' ? 'Nam' : employee.gender === 'female' ? 'Nữ' : 'Khác'}</Descriptions.Item>
            <Descriptions.Item label="Email">
              <Space><Mail size={14} style={{ color: 'var(--color-primary)' }} />{email}</Space>
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              <Space><Phone size={14} style={{ color: 'var(--color-primary)' }} />{phone}</Space>
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ liên hệ" span={2}>
              <Space><MapPin size={14} style={{ color: 'var(--color-primary)' }} />{addressStr}</Space>
            </Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
    {
      key: 'employment',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Briefcase size={14} />
          Công việc & Hợp đồng
        </span>
      ),
      children: (
        <div style={{ padding: '8px 0' }}>
          <Descriptions column={{ xs: 1, sm: 2 }} size="middle" labelStyle={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            <Descriptions.Item label="Phòng ban">
              <Space><Briefcase size={14} style={{ color: 'var(--color-primary)' }} />{departmentName}</Space>
            </Descriptions.Item>
            <Descriptions.Item label="Chức danh cụ thể">{jobTitleName}</Descriptions.Item>
            <Descriptions.Item label="Ngày gia nhập">
              <Space><Calendar size={14} style={{ color: 'var(--color-primary)' }} />{employee.joinDate ? new Date(employee.joinDate).toLocaleDateString('vi-VN') : '-'}</Space>
            </Descriptions.Item>
            <Descriptions.Item label="Hình thức làm việc">{currentEmployment?.employmentType || 'Toàn thời gian'}</Descriptions.Item>
          </Descriptions>
        </div>
      ),
    },
    {
      key: 'history',
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FileText size={14} />
          Lịch sử hoạt động
        </span>
      ),
      children: (
        <div style={{ padding: '16px 8px' }}>
          <Timeline
            items={[
              { color: 'green', children: `Gia nhập doanh nghiệp — ${employee.joinDate ? new Date(employee.joinDate).toLocaleDateString('vi-VN') : '-'}` },
              { color: 'blue', children: `Hồ sơ được cập nhật lần cuối — ${employee.updatedAt ? new Date(employee.updatedAt).toLocaleDateString('vi-VN') : '-'}` },
              { color: 'gray', children: `Khởi tạo hồ sơ nhân sự trên hệ thống — ${employee.createdAt ? new Date(employee.createdAt).toLocaleDateString('vi-VN') : '-'}` },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div style={{ paddingBottom: 24 }}>
      <Button
        type="text"
        icon={<ArrowLeft size={16} />}
        onClick={() => navigate('/hrm/employees')}
        style={{ marginBottom: 16, padding: '4px 8px' }}
      >
        Quay lại danh sách
      </Button>

      <Card style={{ borderRadius: 16, border: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <Row gutter={[24, 24]} align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Avatar 
              size={72} 
              src={employee.avatarFileId ? `/api/v1/files/${employee.avatarFileId}/view` : undefined}
              style={{ 
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))', 
                fontSize: 28, 
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.2)'
              }}
            >
              {employee.lastName?.[0] || ''}{employee.firstName?.[0] || ''}
            </Avatar>
          </Col>
          <Col flex="1">
            <Title level={4} style={{ marginBottom: 6, fontWeight: 700 }}>
              {employee.lastName} {employee.firstName}
            </Title>
            <Space size={8} wrap>
              <Tag color="blue" style={{ borderRadius: 4, fontWeight: 500 }}>{jobTitleName}</Tag>
              <span style={{ color: 'var(--color-text-tertiary)' }}>•</span>
              <Text type="secondary">{departmentName}</Text>
              <span style={{ color: 'var(--color-text-tertiary)' }}>•</span>
              <Tag color={statusInfo.color} style={{ borderRadius: 4, fontWeight: 500 }}>
                {statusInfo.label}
              </Tag>
            </Space>
          </Col>
          <Col>
            <PermissionGate permission={PERMISSIONS.HRM.EMPLOYEE.UPDATE}>
              <Button 
                type="primary" 
                icon={<Edit size={14} />} 
                onClick={() => navigate(`/hrm/employees/${id}/edit`)}
                style={{ borderRadius: 8, height: 38, background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))', border: 'none' }}
              >
                Chỉnh sửa hồ sơ
              </Button>
            </PermissionGate>
          </Col>
        </Row>

        <Tabs 
          items={tabItems} 
          defaultActiveKey="info" 
          tabBarStyle={{ marginBottom: 20 }}
        />
      </Card>
    </div>
  );
}

export default EmployeeDetailPage;
