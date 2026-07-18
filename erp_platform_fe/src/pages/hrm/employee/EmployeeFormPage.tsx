import { useNavigate, useParams } from 'react-router-dom';
import { Card, Form, Input, Select, DatePicker, Button, Space, Row, Col, Typography, Divider, message, Spin, Radio } from 'antd';
import { ArrowLeft, Save } from 'lucide-react';
import { useEffect } from 'react';
import { useCreateEmployee, useUpdateEmployee, useEmployee } from '@features/employee/hooks/useEmployee';
import { useRoles, useManagedUsers } from '@features/rbac/hooks/useRbac';
import { useAuthStore } from '@features/auth/store/authStore';
import dayjs from 'dayjs';
import { FileUpload } from '@shared/components/FileUpload/FileUpload';

const { Title, Text } = Typography;

function EmployeeFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const [form] = Form.useForm();
  const avatarFileId = Form.useWatch('avatarFileId', form);

  const tenantId = useAuthStore((s) => s.user?.tenantId || '');
  const { data: employee, isLoading: isLoadingEmployee } = useEmployee(isEdit ? id : undefined);
  const { data: roles = [], isLoading: isLoadingRoles } = useRoles(tenantId);
  const { data: users = [], isLoading: isLoadingUsers } = useManagedUsers();

  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();

  const accountMode = Form.useWatch('accountMode', form);

  useEffect(() => {
    if (isEdit && employee) {
      const email = employee.contacts?.find(c => c.type === 'email' || (c as any).contactType === 'email')?.value;
      const phone = employee.contacts?.find(c => c.type === 'phone' || (c as any).contactType === 'phone' || (c as any).contactType === 'mobile')?.value;
      const currentEmployment = employee.employments?.find(e => e.isCurrent) || employee.employments?.[0];
      const address = employee.addresses?.find(a => a.isPrimary) || employee.addresses?.[0];

      form.setFieldsValue({
        employeeNo: employee.employeeCode || (employee as any).employeeNo,
        lastName: employee.lastName,
        firstName: employee.firstName,
        preferredName: employee.preferredName || '',
        email,
        phone,
        dateOfBirth: employee.dateOfBirth ? dayjs(employee.dateOfBirth) : null,
        gender: employee.gender,
        maritalStatus: employee.maritalStatus || (employee as any).personalInfo?.maritalStatus,
        nationality: employee.nationality || (employee as any).personalInfo?.nationality,
        nationalId: employee.nationalId || (employee as any).personalInfo?.nationalId,
        passportNo: employee.passportNo || (employee as any).personalInfo?.passportNo,
        taxNumber: employee.taxNumber || (employee as any).personalInfo?.taxNumber,
        addressLine: address?.addressLine || '',
        city: address?.city || '',
        country: address?.country || '',
        departmentId: currentEmployment?.departmentName ? '1' : null,
        jobTitleId: currentEmployment?.jobTitleName ? '1' : null,
        joinDate: employee.joinDate ? dayjs(employee.joinDate) : null,
        employmentStatus: employee.status,
        accountMode: employee.principalId ? 'link_existing' : 'no_account',
        principalId: employee.principalId || null,
        avatarFileId: employee.avatarFileId || null,
      });
    }
  }, [isEdit, employee, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        employeeNo: values.employeeNo,
        firstName: values.firstName,
        lastName: values.lastName,
        preferredName: values.preferredName,
        email: values.email,
        phone: values.phone,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : undefined,
        gender: values.gender,
        maritalStatus: values.maritalStatus,
        nationality: values.nationality,
        nationalId: values.nationalId,
        passportNo: values.passportNo,
        taxNumber: values.taxNumber,
        addressLine: values.addressLine,
        city: values.city,
        country: values.country,
        joinDate: values.joinDate ? values.joinDate.toISOString() : undefined,
        departmentId: values.departmentId,
        jobTitleId: values.jobTitleId,
        status: values.employmentStatus,
        createAccount: values.accountMode === 'create_new',
        password: values.accountMode === 'create_new' ? values.password : undefined,
        roleId: values.accountMode === 'create_new' ? values.roleId : undefined,
        principalId: values.accountMode === 'link_existing' ? values.principalId : undefined,
        avatarFileId: values.avatarFileId || null,
      };

      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data: payload as any });
      } else {
        await createMutation.mutateAsync(payload as any);
      }
      navigate('/hrm/employees');
    } catch (err: any) {
      console.error(err);
      message.error('Vui lòng kiểm tra lại thông tin và các trường bắt buộc');
    }
  };

  const roleOptions = roles.map((r) => ({
    value: r.id,
    label: r.name || r.code,
  }));

  return (
    <div>
      <Button type="text" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)} style={{ marginBottom: 16, padding: '4px 8px' }}>
        Quay lại
      </Button>

      <Card style={{ borderRadius: 12, border: '1px solid var(--color-border-light)' }}>
        <Spin spinning={(isEdit && isLoadingEmployee) || isLoadingRoles}>
          <Title level={4} style={{ marginBottom: 4 }}>{isEdit ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
            {isEdit ? 'Cập nhật thông tin hồ sơ nhân viên' : 'Điền thông tin cơ bản để tạo hồ sơ và cấp tài khoản'}
          </Text>

          <Form form={form} layout="vertical" requiredMark="optional" size="large">

            {/* Avatar Upload */}
            <Form.Item name="avatarFileId" hidden>
              <Input />
            </Form.Item>
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={24}>
                <Form.Item label="Ảnh đại diện nhân sự">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: 16, border: '1px solid rgba(0,0,0,0.06)', borderRadius: 8, background: '#fafafa' }}>
                    {avatarFileId ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <img
                          src={`/api/v1/files/${avatarFileId}/view`}
                          alt="Avatar"
                          style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.06)', background: '#fff' }}
                        />
                        <Button
                          type="text"
                          danger
                          size="small"
                          onClick={() => {
                            form.setFieldValue('avatarFileId', null);
                          }}
                        >
                          Xóa ảnh
                        </Button>
                      </div>
                    ) : (
                      <div style={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', borderRadius: '50%', border: '1px solid rgba(0,0,0,0.06)' }}>
                        <span style={{ fontSize: 24, fontWeight: 600, color: '#bfbfbf' }}>?</span>
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <FileUpload
                        accept="image/*"
                        onUploadSuccess={(fileId) => {
                          form.setFieldValue('avatarFileId', fileId);
                        }}
                        showPreview={false}
                      />
                    </div>
                  </div>
                </Form.Item>
              </Col>
            </Row>

            {/* Section 1: Personal Info */}
            <Divider titlePlacement="left" plain style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)' }}>1. Thông tin cá nhân</Divider>
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Form.Item name="employeeNo" label="Mã nhân viên" rules={[{ required: true, message: 'Vui lòng nhập mã nhân viên' }]}>
                  <Input placeholder="Ví dụ: NV001" disabled={isEdit} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item name="lastName" label="Họ" rules={[{ required: true, message: 'Vui lòng nhập họ' }]}>
                  <Input placeholder="Nguyễn" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item name="firstName" label="Tên" rules={[{ required: true, message: 'Vui lòng nhập tên' }]}>
                  <Input placeholder="Văn An" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item name="preferredName" label="Tên thường gọi/Biệt danh">
                  <Input placeholder="Ví dụ: Andy" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item name="gender" label="Giới tính">
                  <Select placeholder="Chọn giới tính" options={[
                    { value: 'male', label: 'Nam' },
                    { value: 'female', label: 'Nữ' },
                    { value: 'other', label: 'Khác' },
                  ]} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item name="dateOfBirth" label="Ngày sinh">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item name="maritalStatus" label="Tình trạng hôn nhân">
                  <Select placeholder="Chọn tình trạng" options={[
                    { value: 'single', label: 'Độc thân' },
                    { value: 'married', label: 'Đã kết hôn' },
                    { value: 'divorced', label: 'Ly hôn' },
                    { value: 'widowed', label: 'Góa phụ' },
                  ]} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item name="nationality" label="Quốc tịch">
                  <Input placeholder="Ví dụ: Việt Nam" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={8}>
                <Form.Item name="nationalId" label="Số CMND/CCCD">
                  <Input placeholder="Ví dụ: 037123456789" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="passportNo" label="Số hộ chiếu (Passport)">
                  <Input placeholder="Nhập số hộ chiếu (nếu có)" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="taxNumber" label="Mã số thuế cá nhân">
                  <Input placeholder="Nhập mã số thuế cá nhân" />
                </Form.Item>
              </Col>
            </Row>

            {/* Section 2: Contact & Address */}
            <Divider titlePlacement="left" plain style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)' }}>2. Thông tin liên hệ & Địa chỉ</Divider>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item name="email" label="Email liên hệ" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
                  <Input placeholder="an.nguyen@company.com" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="phone" label="Số điện thoại di động">
                  <Input placeholder="0901234567" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="addressLine" label="Địa chỉ cư trú (Số nhà, Tên đường)">
                  <Input placeholder="Ví dụ: 123 Đường Ba Tháng Hai, Phường 12" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={6}>
                <Form.Item name="city" label="Tỉnh/Thành phố">
                  <Input placeholder="Ví dụ: TP. Hồ Chí Minh" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={6}>
                <Form.Item name="country" label="Quốc gia">
                  <Input placeholder="Ví dụ: Việt Nam" defaultValue="Việt Nam" />
                </Form.Item>
              </Col>
            </Row>

            {/* Section 3: Employment Info */}
            <Divider titlePlacement="left" plain style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)' }}>3. Thông tin công việc</Divider>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item name="departmentId" label="Phòng ban làm việc" rules={[{ required: true, message: 'Vui lòng chọn phòng ban' }]}>
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
                <Form.Item name="joinDate" label="Ngày vào làm (Hire Date)" rules={[{ required: true, message: 'Vui lòng chọn ngày vào làm' }]}>
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="employmentStatus" label="Trạng thái hợp đồng">
                  <Select placeholder="Chọn trạng thái" defaultValue="probation" options={[
                    { value: 'probation', label: 'Thử việc (Probation)' },
                    { value: 'active', label: 'Chính thức (Active)' },
                  ]} />
                </Form.Item>
              </Col>
            </Row>

            {/* Section 4: System Account Provisioning / Linking */}
            {isEdit ? (
              <>
                <Divider titlePlacement="left" plain style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)' }}>4. Tài khoản hệ thống (Identity / User Account)</Divider>
                <Row gutter={16}>
                  <Col xs={24}>
                    <Form.Item
                      name="principalId"
                      label="Tài khoản người dùng liên kết"
                      rules={[{ required: true, message: 'Vui lòng chọn tài khoản để liên kết' }]}
                    >
                      <Select 
                        placeholder="Tìm tài khoản theo tên hoặc email..." 
                        options={users.map((u: any) => ({
                          value: u.principalId,
                          label: `${u.displayName || u.username} (${u.email})`,
                        }))} 
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        loading={isLoadingUsers}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            ) : (
              <>
                <Divider titlePlacement="left" plain style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)' }}>4. Tài khoản hệ thống (Identity / User Account)</Divider>
                <Row gutter={16}>
                  <Col xs={24}>
                    <Form.Item name="accountMode" label="Tùy chọn tài khoản hệ thống" initialValue="no_account">
                      <Radio.Group>
                        <Radio value="no_account">Không sử dụng tài khoản</Radio>
                        <Radio value="create_new">Tạo tài khoản đăng nhập mới</Radio>
                        <Radio value="link_existing">Liên kết tài khoản người dùng có sẵn</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                </Row>

                {accountMode === 'create_new' && (
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="password"
                        label="Mật khẩu đăng nhập"
                        rules={[
                          { required: true, message: 'Vui lòng nhập mật khẩu đăng nhập' },
                          { min: 8, message: 'Mật khẩu phải tối thiểu 8 ký tự' }
                        ]}
                      >
                        <Input.Password placeholder="Tối thiểu 8 ký tự" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item
                        name="roleId"
                        label="Vai trò & Phân quyền"
                        rules={[{ required: true, message: 'Vui lòng chỉ định vai trò cho tài khoản' }]}
                      >
                        <Select placeholder="Chọn vai trò của nhân sự" options={roleOptions} />
                      </Form.Item>
                    </Col>
                  </Row>
                )}

                {accountMode === 'link_existing' && (
                  <Row gutter={16}>
                    <Col xs={24}>
                      <Form.Item
                        name="principalId"
                        label="Chọn tài khoản người dùng có sẵn để liên kết"
                        rules={[{ required: true, message: 'Vui lòng chọn tài khoản để liên kết' }]}
                      >
                        <Select 
                          placeholder="Tìm tài khoản theo tên hoặc email..." 
                          options={users.map((u: any) => ({
                            value: u.principalId,
                            label: `${u.displayName || u.username} (${u.email})`,
                          }))} 
                          showSearch
                          filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                          }
                          loading={isLoadingUsers}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
              </>
            )}

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
