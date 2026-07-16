import { useNavigate } from 'react-router-dom';
import { Card, Form, Select, DatePicker, Input, Button, Space, Typography, Divider, Statistic, Row, Col, message, Spin } from 'antd';
import { ArrowLeft, Send } from 'lucide-react';
import { useLeaveTypes, useCreateLeaveRequest } from '@features/leave/hooks/useLeave';
import { useEmployees } from '@features/employee/hooks/useEmployee';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

function LeaveRequestFormPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { data: leaveTypes = [], isLoading: isLoadingTypes } = useLeaveTypes();
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  const createMutation = useCreateLeaveRequest();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const [startDate, endDate] = values.dateRange;

      // Find the employee's current employment
      const employee = employees.find(e => e.id === values.employeeId);
      const employmentId = employee?.employments?.find(emp => emp.isCurrent)?.id || employee?.employments?.[0]?.id;

      if (!employmentId) {
        message.error('Nhân viên này chưa được tạo Hợp đồng/Công việc!');
        return;
      }

      await createMutation.mutateAsync({
        employmentId,
        leaveTypeId: values.leaveTypeId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        reason: values.reason,
      });

      navigate('/hrm/leave-requests');
    } catch {
      message.error('Vui lòng kiểm tra lại thông tin');
    }
  };

  const isLoading = isLoadingTypes || isLoadingEmployees;

  return (
    <div>
      <Button type="text" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)} style={{ marginBottom: 16, padding: '4px 8px' }}>Quay lại</Button>

      <Spin spinning={isLoading}>
        <Row gutter={20}>
          <Col xs={24} lg={16}>
            <Card style={{ borderRadius: 12, border: '1px solid var(--color-border-light)' }}>
              <Title level={4} style={{ marginBottom: 4 }}>Tạo đơn xin nghỉ phép</Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>Điền thông tin và gửi đơn nghỉ phép</Text>

              <Form form={form} layout="vertical" requiredMark="optional" size="large">
                <Form.Item name="employeeId" label="Nhân viên" rules={[{ required: true, message: 'Chọn nhân viên' }]}>
                  <Select
                    placeholder="Chọn nhân viên xin nghỉ"
                    showSearch
                    optionFilterProp="label"
                    options={employees.map(emp => ({
                      value: emp.id,
                      label: `${emp.lastName || ''} ${emp.firstName || ''} (${emp.employeeCode || (emp as any).employeeNo || ''})`
                    }))}
                  />
                </Form.Item>
                <Form.Item name="leaveTypeId" label="Loại phép" rules={[{ required: true, message: 'Chọn loại phép' }]}>
                  <Select
                    placeholder="Chọn loại phép"
                    options={leaveTypes.map(type => ({
                      value: type.id,
                      label: type.name
                    }))}
                  />
                </Form.Item>
                <Form.Item name="dateRange" label="Thời gian nghỉ" rules={[{ required: true, message: 'Chọn thời gian' }]}>
                  <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder={['Từ ngày', 'Đến ngày']} />
                </Form.Item>
                <Form.Item name="reason" label="Lý do nghỉ phép" rules={[{ required: true, message: 'Nhập lý do' }]}>
                  <TextArea rows={3} placeholder="Nhập lý do nghỉ phép..." />
                </Form.Item>
                <Divider />
                <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button onClick={() => navigate(-1)}>Hủy</Button>
                  <Button type="primary" icon={<Send size={14} />} onClick={handleSubmit} loading={createMutation.isPending}>Gửi đơn</Button>
                </Space>
              </Form>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Số dư phép năm" style={{ borderRadius: 12, border: '1px solid var(--color-border-light)' }}>
              <Row gutter={16}>
                <Col span={12}><Statistic title="Tổng phép" value={15} valueStyle={{ color: 'var(--color-primary)' }} /></Col>
                <Col span={12}><Statistic title="Đã nghỉ" value={6.5} valueStyle={{ color: 'var(--color-text-secondary)' }} /></Col>
                <Col span={12} style={{ marginTop: 16 }}><Statistic title="Còn lại" value={8.5} valueStyle={{ color: 'var(--color-success)', fontWeight: 700 }} /></Col>
                <Col span={12} style={{ marginTop: 16 }}><Statistic title="Đang chờ" value={0} valueStyle={{ color: 'var(--color-warning)' }} /></Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
}

export default LeaveRequestFormPage;
