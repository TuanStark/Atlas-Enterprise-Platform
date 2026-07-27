import { useState } from 'react';
import { Card, Table, Button, Space, Tag, Typography, Spin, Tooltip, Modal, Form, InputNumber, Select, DatePicker } from 'antd';
import type { TableColumnsType } from 'antd';
import { FileText, Download, Eye, Plus } from 'lucide-react';
import { FilterBar } from '@shared/components/FilterBar';
import type { FilterBarField } from '@shared/components/FilterBar';
import { useContracts, useCreateContract } from '@features/contract/hooks/useContract';
import { useEmployees } from '@features/employee/hooks/useEmployee';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const contractStatusConfig: Record<string, { color: string; label: string }> = {
  draft: { color: 'default', label: 'Bản nháp' },
  active: { color: 'green', label: 'Có hiệu lực' },
  expired: { color: 'red', label: 'Hết hạn' },
  terminated: { color: 'error', label: 'Đã chấm dứt' },
};

function ContractListPage() {
  // const navigate = useNavigate();
  const [filters, setFilters] = useState<{
    status: string | undefined;
    page: number;
    pageSize: number;
  }>({
    status: undefined,
    page: 1,
    pageSize: 15,
  });

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  const createMutation = useCreateContract();
  
  // Fetch employees for the dropdown
  const { data: employeesResponse } = useEmployees({ pageSize: 1000 });
  const employeesList = employeesResponse?.data || [];

  const handleCreateContract = async (values: any) => {
    try {
      await createMutation.mutateAsync({
        employmentId: values.employmentId,
        contractType: values.contractType,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
        baseSalary: values.baseSalary,
        salaryCurrency: 'VND',
      });
      setIsCreateModalVisible(false);
      form.resetFields();
    } catch (e) {
      console.error(e);
    }
  };

  const { data: response, isLoading } = useContracts({
    page: filters.page,
    pageSize: filters.pageSize,
    status: filters.status,
  });

  const contracts = response?.data || [];
  const total = response?.total || 0;

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const filterFields: FilterBarField[] = [
    {
      key: 'status',
      type: 'select',
      label: 'Trạng thái',
      placeholder: 'Tất cả trạng thái',
      span: 6,
      options: [
        { label: 'Bản nháp', value: 'draft' },
        { label: 'Có hiệu lực', value: 'active' },
        { label: 'Hết hạn', value: 'expired' },
        { label: 'Đã chấm dứt', value: 'terminated' },
      ],
    },
  ];

  const columns: TableColumnsType<any> = [
    {
      title: 'SỐ HỢP ĐỒNG',
      dataIndex: 'contractNumber',
      key: 'contractNumber',
      width: 180,
      render: (text) => (
        <Space size={8}>
          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <FileText size={16} />
          </div>
          <Text className="font-semibold text-text-primary text-[13px]">{text}</Text>
        </Space>
      ),
    },
    {
      title: 'NHÂN VIÊN',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 200,
      render: (text) => <Text className="font-medium text-text-primary text-[13px]">{text}</Text>,
    },
    {
      title: 'LOẠI HỢP ĐỒNG',
      dataIndex: 'contractType',
      key: 'contractType',
      width: 180,
      render: (text) => <Text className="text-text-secondary text-[13px]">{text}</Text>,
    },
    {
      title: 'NGÀY HIỆU LỰC',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 150,
      render: (date) => (
        <Text className="text-text-secondary text-[13px]">
          {date ? dayjs(date).format('DD/MM/YYYY') : '-'}
        </Text>
      ),
    },
    {
      title: 'NGÀY HẾT HẠN',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 150,
      render: (date) => (
        <Text className="text-text-secondary text-[13px]">
          {date ? dayjs(date).format('DD/MM/YYYY') : 'Vô thời hạn'}
        </Text>
      ),
    },
    {
      title: 'TRẠNG THÁI',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => {
        const config = contractStatusConfig[status] || { color: 'default', label: status };
        return (
          <Tag color={config.color} className="rounded border-none px-2 py-0.5 text-xs font-semibold">
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'THAO TÁC',
      key: 'actions',
      width: 120,
      align: 'right',
      render: (_,) => (
        <Space size={4}>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<Eye size={16} />}
              className="text-text-tertiary hover:text-primary hover:bg-primary/5"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="pb-8 animate-[fadeIn_0.3s_ease-in-out]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={4} style={{ marginBottom: 4, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
            Quản lý hợp đồng
          </Title>
          <Text type="secondary" className="text-[13px] font-medium">
            Danh sách tất cả hợp đồng nhân sự trong toàn công ty
          </Text>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            className="rounded-lg h-9 font-semibold text-[13px] shadow-sm"
            onClick={() => setIsCreateModalVisible(true)}
          >
            Tạo hợp đồng
          </Button>
          <Button
            icon={<Download size={16} />}
            className="rounded-lg h-9 font-semibold text-[13px] border-border-light text-text-secondary hover:text-primary hover:border-primary shadow-sm"
          >
            Xuất dữ liệu
          </Button>
        </Space>
      </div>

      <Card className="!rounded-2xl !border-border-light shadow-[0_4px_20px_-2px_rgba(15,23,42,0.02)] [&_.ant-card-body]:!p-0 overflow-hidden bg-white">
        <FilterBar fields={filterFields} values={filters} onChange={handleFilterChange} />

        <div className="px-5 pb-5">
          {isLoading ? (
            <div className="flex justify-center items-center h-[400px]">
              <Spin size="large" />
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={contracts}
              rowKey="id"
              pagination={{
                current: filters.page,
                pageSize: filters.pageSize,
                total: total,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} hợp đồng`,
                className: '!mb-0 !mt-5',
                onChange: (page, pageSize) => setFilters(prev => ({ ...prev, page, pageSize })),
              }}
              className="custom-table"
              scroll={{ x: 1000 }}
            />
          )}
        </div>
      </Card>

      <Modal
        title="Tạo Hợp đồng mới"
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
        destroyOnClose={false}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateContract}>
          <Form.Item name="employmentId" label="Nhân viên" rules={[{ required: true, message: 'Vui lòng chọn nhân viên' }]}>
            <Select showSearch optionFilterProp="children" placeholder="Chọn nhân viên">
              {employeesList.map(emp => {
                const employmentId = emp.employments?.[0]?.id;
                if (!employmentId) return null;
                return (
                  <Select.Option key={employmentId} value={employmentId}>
                    {emp.employeeCode} - {emp.lastName} {emp.firstName}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item name="contractType" label="Loại hợp đồng" rules={[{ required: true, message: 'Vui lòng chọn loại hợp đồng' }]}>
            <Select placeholder="Chọn loại hợp đồng">
              <Select.Option value="probation">Thử việc</Select.Option>
              <Select.Option value="indefinite">Không xác định thời hạn</Select.Option>
              <Select.Option value="definite_12m">Xác định thời hạn 12 tháng</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày bắt đầu" />
          </Form.Item>
          <Form.Item name="endDate" label="Ngày kết thúc">
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày kết thúc" />
          </Form.Item>
          <Form.Item name="baseSalary" label="Lương cơ bản (VND)" rules={[{ required: true, message: 'Vui lòng nhập mức lương' }]}>
            <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} placeholder="Nhập mức lương" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ContractListPage;
