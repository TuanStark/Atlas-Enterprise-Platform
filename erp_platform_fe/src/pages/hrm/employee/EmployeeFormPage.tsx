import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, Select, DatePicker, Button, Space, Row, Col, Typography, Divider, message } from 'antd';
import { ArrowLeft, Save } from 'lucide-react';

const { Title, Text } = Typography;

/**
 * EmployeeFormPage — Create/Edit employee form
 * Maps to: POST /api/v1/hrm/employees (create)
 * Maps to: PATCH /api/v1/hrm/employees/:id (update)
 */
import { useEffect } from 'react';
import { useCreateEmployee, useUpdateEmployee, useEmployee } from '@features/employee/hooks/useEmployee';
import dayjs from 'dayjs';

function EmployeeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const [form] = Form.useForm();

  const { data: employee, isLoading: isLoadingEmployee } = useEmployee(isEdit ? id : undefined);
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();

  useEffect(() => {
    if (isEdit && employee) {
      const email = employee.contacts?.find(c => c.type === 'email' || (c as any).contactType === 'email')?.value;
      const phone = employee.contacts?.find(c => c.type === 'phone' || (c as any).contactType === 'phone' || (c as any).contactType === 'mobile')?.value;
      const currentEmployment = employee.employments?.find(e => e.isCurrent) || employee.employments?.[0];

      form.setFieldsValue({
        lastName: employee.lastName,
        firstName: employee.firstName,
        email,
        phone,
        dateOfBirth: employee.dateOfBirth ? dayjs(employee.dateOfBirth) : null,
        gender: employee.gender,
        departmentId: currentEmployment?.departmentName ? '1' : null, // Fallback since master-data ID is mocked
        jobTitleId: currentEmployment?.jobTitleName ? '1' : null,
        joinDate: employee.joinDate ? dayjs(employee.joinDate) : null,
        employmentStatus: employee.status,
      });
    }
  }, [isEdit, employee, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : undefined,
        gender: values.gender,
        joinDate: values.joinDate ? values.joinDate.toISOString() : undefined,
        departmentId: values.departmentId,
        jobTitleId: values.jobTitleId,
        status: values.employmentStatus,
      };

      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      navigate('/hrm/employees');
    } catch {
      message.error('Vui lòng kiểm tra lại thông tin');
    }
  };

  return (
    <div>
      <Button type="text" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)} style={{ marginBottom: 16, padding: '4px 8px' }}>
        Quay lại
      </Button>

      <Card style={{ borderRadius: 12, border: '1px solid var(--color-border-light)' }}>
        <Spin spinning={isEdit && isLoadingEmployee}>
          <Title level={4} style={{ marginBottom: 4 }}>{isEdit ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
            {isEdit ? 'Cập nhật thông tin hồ sơ nhân viên' : 'Điền thông tin cơ bản để tạo hồ sơ mới'}
          </Text>

        <Form form={form} layout="vertical" requiredMark="optional" size="large">
          <Divider orientationMargin={0} plain style={{ fontSize: 13, fontWeight: 600 }}>Thông tin cá nhân</Divider>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="lastName" label="Họ" rules={[{ required: true, message: 'Vui lòng nhập họ' }]}>
                <Input placeholder="Nguyễn" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="firstName" label="Tên" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                <Input placeholder="Văn An" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
                <Input placeholder="an.nguyen@company.com" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input placeholder="0901234567" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="dateOfBirth" label="Ngày sinh">
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="gender" label="Giới tính">
                <Select placeholder="Chọn giới tính" options={[
                  { value: 'male', label: 'Nam' },
                  { value: 'female', label: 'Nữ' },
                  { value: 'other', label: 'Khác' },
                ]} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientationMargin={0} plain style={{ fontSize: 13, fontWeight: 600 }}>Thông tin công việc</Divider>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="departmentId" label="Phòng ban" rules={[{ required: true, message: 'Vui lòng chọn phòng ban' }]}>
                <Select placeholder="Chọn phòng ban" options={[
                  { value: '1', label: 'Phòng IT' },
                  { value: '2', label: 'Phòng Nhân sự' },
                  { value: '3', label: 'Phòng Tài chính' },
                  { value: '4', label: 'Phòng Marketing' },
                ]} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="jobTitleId" label="Chức danh" rules={[{ required: true, message: 'Vui lòng chọn chức danh' }]}>
                <Select placeholder="Chọn chức danh" options={[
                  { value: '1', label: 'Senior Developer' },
                  { value: '2', label: 'Junior Developer' },
                  { value: '3', label: 'HR Manager' },
                  { value: '4', label: 'Accountant' },
                ]} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="joinDate" label="Ngày vào làm" rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}>
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="employmentStatus" label="Trạng thái">
                <Select placeholder="Chọn trạng thái" defaultValue="probation" options={[
                  { value: 'probation', label: 'Thử việc' },
                  { value: 'active', label: 'Chính thức' },
                ]} />
              </Form.Item>
            </Col>
          </Row>

          <Divider />
          <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => navigate(-1)}>Hủy</Button>
            <Button type="primary" icon={<Save size={14} />} onClick={handleSubmit}>
              {isEdit ? 'Cập nhật' : 'Tạo nhân viên'}
            </Button>
          </Space>
        </Form>
        </Spin>
      </Card>
    </div>
  );
}

export default EmployeeFormPage;
