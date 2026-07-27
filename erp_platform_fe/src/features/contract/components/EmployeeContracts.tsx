import { useState } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, DatePicker, InputNumber, Select, Spin, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { Plus, FileSignature, FilePlus2 } from 'lucide-react';
import { useEmploymentContracts, useCreateContract, useSignContract, useCreateContractAnnex } from '../hooks/useContract';
import type { Contract } from '../types';

const { Text } = Typography;

interface EmployeeContractsProps {
  employmentId: string;
}

const statusConfig: Record<string, { color: string; label: string }> = {
  draft: { color: 'default', label: 'Bản nháp' },
  active: { color: 'blue', label: 'Đang hiệu lực' },
  expired: { color: 'red', label: 'Hết hạn' },
  terminated: { color: 'red', label: 'Chấm dứt' },
};

export const EmployeeContracts = ({ employmentId }: EmployeeContractsProps) => {
  const { data: contracts = [], isLoading } = useEmploymentContracts(employmentId);
  const createMutation = useCreateContract();
  const signMutation = useSignContract();
  const createAnnexMutation = useCreateContractAnnex();

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isAnnexModalVisible, setIsAnnexModalVisible] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

  const [form] = Form.useForm();
  const [annexForm] = Form.useForm();

  const handleCreateContract = async (values: any) => {
    try {
      await createMutation.mutateAsync({
        employmentId,
        contractType: values.contractType,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
        baseSalary: values.baseSalary,
        salaryCurrency: values.salaryCurrency || 'VND',
      });
      setIsCreateModalVisible(false);
      form.resetFields();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSign = (contractId: string) => {
    Modal.confirm({
      title: 'Xác nhận ký hợp đồng',
      content: 'Bạn có chắc chắn muốn ký duyệt hợp đồng này?',
      okText: 'Ký duyệt',
      cancelText: 'Hủy',
      onOk: () => {
        signMutation.mutate({ id: contractId, employmentId });
      },
    });
  };

  const handleCreateAnnex = async (values: any) => {
    if (!selectedContractId) return;
    try {
      await createAnnexMutation.mutateAsync({
        contractId: selectedContractId,
        employmentId,
        data: {
          effectiveDate: values.effectiveDate.format('YYYY-MM-DD'),
          content: values.content,
        },
      });
      setIsAnnexModalVisible(false);
      annexForm.resetFields();
      setSelectedContractId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const columns: TableColumnsType<Contract> = [
    {
      title: 'Số hợp đồng',
      dataIndex: 'contractNo',
      key: 'contractNo',
      render: (val: string) => <Text strong>{val || '-'}</Text>,
    },
    {
      title: 'Loại hợp đồng',
      dataIndex: 'contractType',
      key: 'contractType',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (val: string) => {
        const config = statusConfig[val] || { color: 'default', label: val || 'Unknown' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Ngày hiệu lực',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (val: string) => val ? new Date(val).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (val: string) => val ? new Date(val).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Lương cơ bản',
      key: 'salary',
      render: (_, record) => `${record.baseSalary?.toLocaleString()} ${record.salaryCurrency}`,
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          {record.status === 'draft' && (
            <Button type="link" size="small" onClick={() => handleSign(record.id)}>
              <FileSignature size={14} style={{ marginRight: 4 }} /> Ký
            </Button>
          )}
          {record.status === 'active' && (
            <Button type="link" size="small" onClick={() => { setSelectedContractId(record.id); setIsAnnexModalVisible(true); }}>
              <FilePlus2 size={14} style={{ marginRight: 4 }} /> Phụ lục
            </Button>
          )}
        </Space>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spin tip="Đang tải danh sách hợp đồng..." />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Text strong>Danh sách hợp đồng</Text>
        <Button
          type="primary"
          icon={<Plus size={14} />}
          onClick={() => setIsCreateModalVisible(true)}
        >
          Tạo hợp đồng
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={contracts}
        rowKey="id"
        pagination={false}
        size="small"
      />

      <Modal
        title="Tạo Hợp đồng mới"
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={createMutation.isPending}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateContract}>
          <Form.Item name="contractType" label="Loại hợp đồng" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="probation">Thử việc</Select.Option>
              <Select.Option value="indefinite">Không xác định thời hạn</Select.Option>
              <Select.Option value="definite_12m">Xác định thời hạn 12 tháng</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="endDate" label="Ngày kết thúc">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="baseSalary" label="Lương cơ bản" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Tạo Phụ lục Hợp đồng"
        open={isAnnexModalVisible}
        onCancel={() => setIsAnnexModalVisible(false)}
        onOk={() => annexForm.submit()}
        confirmLoading={createAnnexMutation.isPending}
      >
        <Form form={annexForm} layout="vertical" onFinish={handleCreateAnnex}>
          <Form.Item name="effectiveDate" label="Ngày hiệu lực" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="content" label="Nội dung phụ lục" rules={[{ required: true }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
