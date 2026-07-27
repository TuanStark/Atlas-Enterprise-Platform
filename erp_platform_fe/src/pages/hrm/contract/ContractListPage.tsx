import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Space, Tag, Typography, Spin, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import { FileText, Download, Eye } from 'lucide-react';
import { FilterBar } from '@shared/components/FilterBar';
import type { FilterBarField } from '@shared/components/FilterBar';
import { useContracts } from '@features/contract/hooks/useContract';
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
    </div>
  );
}

export default ContractListPage;
