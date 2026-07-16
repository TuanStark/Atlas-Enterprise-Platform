import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Descriptions, Tag, Button, Space, Avatar, Typography, Row, Col, Timeline, Spin } from 'antd';
import { ArrowLeft, Edit, Mail, Phone, MapPin, Briefcase, Calendar } from 'lucide-react';
import { useEmployee } from '@features/employee/hooks/useEmployee';

const { Title, Text } = Typography;

const statusConfig: Record<string, { color: string; label: string }> = {
  active: { color: 'green', label: 'Đang làm' },
  probation: { color: 'orange', label: 'Thử việc' },
  suspended: { color: 'red', label: 'Tạm ngưng' },
  resigned: { color: 'default', label: 'Nghỉ việc' },
};

/**
 * EmployeeDetailPage — Detailed view of a single employee
 * Maps to: GET /api/v1/hrm/employees/:id
 */
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

  const tabItems = [
    {
      key: 'info',
      label: 'Thông tin cá nhân',
      children: (
        <Descriptions column={{ xs: 1, sm: 2 }} size="middle" bordered={false}>
          <Descriptions.Item label="Mã nhân viên">{code}</Descriptions.Item>
          <Descriptions.Item label="Ngày sinh">{employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString('vi-VN') : '-'}</Descriptions.Item>
          <Descriptions.Item label="Giới tính">{employee.gender === 'male' ? 'Nam' : employee.gender === 'female' ? 'Nữ' : 'Khác'}</Descriptions.Item>
          <Descriptions.Item label="Email">
            <Space><Mail size={14} />{email}</Space>
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            <Space><Phone size={14} />{phone}</Space>
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">
            <Space><MapPin size={14} />{addressStr}</Space>
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'employment',
      label: 'Công việc & Hợp đồng',
      children: (
        <Descriptions column={{ xs: 1, sm: 2 }} size="middle">
          <Descriptions.Item label="Phòng ban">
            <Space><Briefcase size={14} />{departmentName}</Space>
          </Descriptions.Item>
          <Descriptions.Item label="Chức danh">{jobTitleName}</Descriptions.Item>
          <Descriptions.Item label="Ngày vào">
            <Space><Calendar size={14} />{employee.joinDate ? new Date(employee.joinDate).toLocaleDateString('vi-VN') : '-'}</Space>
          </Descriptions.Item>
          <Descriptions.Item label="Loại hợp đồng">{currentEmployment?.employmentType || 'Toàn thời gian'}</Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'history',
      label: 'Lịch sử',
      children: (
        <Timeline
          items={[
            { color: 'green', children: `Gia nhập công ty — ${employee.joinDate ? new Date(employee.joinDate).toLocaleDateString('vi-VN') : '-'}` },
            { color: 'blue', children: `Hồ sơ được cập nhật lúc — ${new Date(employee.updatedAt).toLocaleDateString('vi-VN')}` },
            { color: 'gray', children: `Hồ sơ được tạo lúc — ${new Date(employee.createdAt).toLocaleDateString('vi-VN')}` },
          ]}
        />
      ),
    },
  ];

  return (
    <div>
      <Button
        type="text"
        icon={<ArrowLeft size={16} />}
        onClick={() => navigate('/hrm/employees')}
        style={{ marginBottom: 16, padding: '4px 8px' }}
      >
        Quay lại
      </Button>

      <Card style={{ borderRadius: 12, border: '1px solid var(--color-border-light)' }}>
        <Row gutter={24} align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Avatar size={64} style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', fontSize: 24, fontWeight: 700 }}>
              {employee.lastName[0]}{employee.firstName[0]}
            </Avatar>
          </Col>
          <Col flex="1">
            <Title level={4} style={{ marginBottom: 4 }}>{employee.lastName} {employee.firstName}</Title>
            <Space>
              <Text type="secondary">{employee.jobTitle}</Text>
              <Text type="secondary">•</Text>
              <Text type="secondary">{employee.department}</Text>
              <Tag color="green">Đang làm</Tag>
            </Space>
          </Col>
          <Col>
            <Button type="primary" icon={<Edit size={14} />} onClick={() => navigate(`/hrm/employees/${id}/edit`)}>
              Chỉnh sửa
            </Button>
          </Col>
        </Row>

        <Tabs items={tabItems} defaultActiveKey="info" />
      </Card>
    </div>
  );
}

export default EmployeeDetailPage;
