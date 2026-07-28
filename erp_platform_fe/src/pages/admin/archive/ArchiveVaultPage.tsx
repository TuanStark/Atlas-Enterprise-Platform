import { useState } from 'react';
import { Card, Table, Button, Space, Tag, Typography, Spin, Tooltip, Modal, Segmented, Descriptions, Empty } from 'antd';
import type { TableColumnsType } from 'antd';
import { Archive, RotateCcw, Eye, FileText, User, CalendarDays } from 'lucide-react';
import { FilterBar } from '@shared/components/FilterBar';
import type { FilterBarField } from '@shared/components/FilterBar';
import { useArchiveRecords, useUnarchiveRecord } from '@features/archive/hooks/useArchive';
import { useCanAccessCode } from '@shared/hooks/usePermission';
import { PERMISSIONS } from '@shared/constants/permissions';
import type { ArchiveRecord } from '@features/archive/types';
import { SOURCE_MODULE_LABELS, SOURCE_ENTITY_LABELS } from '@features/archive/types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const entityIconMap: Record<string, React.ReactNode> = {
  contract: <FileText size={16} />,
  employee: <User size={16} />,
  leave_request: <CalendarDays size={16} />,
};

const entityColorMap: Record<string, string> = {
  contract: '#1677ff',
  employee: '#52c41a',
  leave_request: '#fa8c16',
};

type TabOption = 'all' | 'contract' | 'employee' | 'leave_request';

const TAB_OPTIONS: { label: string; value: TabOption; icon: React.ReactNode }[] = [
  { label: 'Tất cả', value: 'all', icon: <Archive size={14} /> },
  { label: 'Hợp đồng', value: 'contract', icon: <FileText size={14} /> },
  { label: 'Nhân viên', value: 'employee', icon: <User size={14} /> },
  { label: 'Đơn nghỉ phép', value: 'leave_request', icon: <CalendarDays size={14} /> },
];

function ArchiveVaultPage() {
  const [activeTab, setActiveTab] = useState<TabOption>('all');
  const [filters, setFilters] = useState<{
    page: number;
    pageSize: number;
  }>({
    page: 1,
    pageSize: 15,
  });
  const [selectedRecord, setSelectedRecord] = useState<ArchiveRecord | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  const queryParams = {
    page: filters.page,
    pageSize: filters.pageSize,
    ...(activeTab !== 'all' ? { sourceEntity: activeTab } : {}),
  };

  const { data: response, isLoading } = useArchiveRecords(queryParams);
  const unarchiveMutation = useUnarchiveRecord();

  const records = response?.data || [];
  const total = response?.total || 0;

  const canRestore = useCanAccessCode(PERMISSIONS.ADMIN.ARCHIVE.RESTORE);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const filterFields: FilterBarField[] = [];

  const handleViewDetail = (record: ArchiveRecord) => {
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
  };

  const handleUnarchive = (record: ArchiveRecord) => {
    Modal.confirm({
      title: 'Xác nhận khôi phục',
      content: (
        <div>
          <Text>Bạn có chắc chắn muốn khôi phục <Text strong>{record.displayLabel}</Text>?</Text>
          <br />
          <Text type="secondary" className="text-xs">Dữ liệu sẽ được đưa lại về danh sách chính của module gốc.</Text>
        </div>
      ),
      okText: 'Khôi phục',
      cancelText: 'Hủy',
      okButtonProps: { className: 'bg-primary' },
      onOk: () => {
        return unarchiveMutation.mutateAsync(record.id);
      },
    });
  };

  const handleTabChange = (value: string | number) => {
    setActiveTab(value as TabOption);
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  const renderSnapshotData = (snapshotData: Record<string, any> | undefined) => {
    if (!snapshotData || Object.keys(snapshotData).length === 0) {
      return <Empty description="Không có dữ liệu snapshot" />;
    }

    const fieldLabelMap: Record<string, string> = {
      contractNumber: 'Số hợp đồng',
      contractType: 'Loại hợp đồng',
      status: 'Trạng thái',
      startDate: 'Ngày hiệu lực',
      endDate: 'Ngày hết hạn',
      baseSalary: 'Lương cơ bản',
      signedDate: 'Ngày ký',
      employeeName: 'Nhân viên',
      employeeCode: 'Mã nhân viên',
      salaryCurrency: 'Đơn vị tiền tệ',
    };

    const displayKeys = Object.keys(snapshotData).filter(
      (key) => !['id', 'tenantId', 'createdAt', 'updatedAt', 'metadata', 'employmentId', 'contractTypeId', 'contractTemplateId', 'fileId', 'isCurrent', 'workingHours'].includes(key),
    );

    return (
      <Descriptions bordered column={2} size="small">
        {displayKeys.map((key) => {
          const label = fieldLabelMap[key] || key;
          let value = snapshotData[key];

          if (value === null || value === undefined) {
            value = '-';
          } else if (typeof value === 'object') {
            value = JSON.stringify(value, null, 2);
          } else if (key.toLowerCase().includes('date') && typeof value === 'string') {
            value = dayjs(value).format('DD/MM/YYYY');
          } else if (key === 'baseSalary' && typeof value === 'number') {
            value = `${value.toLocaleString('vi-VN')} VND`;
          }

          return (
            <Descriptions.Item key={key} label={label} span={key === 'employeeName' ? 2 : 1}>
              {String(value)}
            </Descriptions.Item>
          );
        })}
      </Descriptions>
    );
  };

  const columns: TableColumnsType<ArchiveRecord> = [
    {
      title: 'MÔ TẢ',
      dataIndex: 'displayLabel',
      key: 'displayLabel',
      width: 280,
      render: (text, record) => {
        const icon = entityIconMap[record.sourceEntity] || <Archive size={16} />;
        const color = entityColorMap[record.sourceEntity] || '#666';
        return (
          <Space size={10}>
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${color}10`, color }}
            >
              {icon}
            </div>
            <div className="flex flex-col">
              <Text className="font-semibold text-text-primary text-[13px]">{text}</Text>
              <Text className="text-text-tertiary text-[11px]">
                {SOURCE_MODULE_LABELS[record.sourceModule] || record.sourceModule}
              </Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'LOẠI DỮ LIỆU',
      dataIndex: 'sourceEntity',
      key: 'sourceEntity',
      width: 150,
      render: (entity: string) => {
        const color = entityColorMap[entity] || '#666';
        return (
          <Tag
            color={color}
            className="rounded border-none px-2 py-0.5 text-xs font-semibold"
          >
            {SOURCE_ENTITY_LABELS[entity] || entity}
          </Tag>
        );
      },
    },
    {
      title: 'NGƯỜI LƯU TRỮ',
      key: 'archivedBy',
      width: 170,
      render: (_, record) => (
        <Text className="text-text-secondary text-[13px]">
          {record.principal?.displayName || '-'}
        </Text>
      ),
    },
    {
      title: 'NGÀY LƯU TRỮ',
      dataIndex: 'archivedAt',
      key: 'archivedAt',
      width: 150,
      render: (date: string) => (
        <Text className="text-text-secondary text-[13px]">
          {date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '-'}
        </Text>
      ),
    },
    {
      title: 'LÝ DO',
      dataIndex: 'reason',
      key: 'reason',
      width: 200,
      ellipsis: true,
      render: (text) => (
        <Text className="text-text-tertiary text-[13px]">
          {text || '-'}
        </Text>
      ),
    },
    {
      title: 'THAO TÁC',
      key: 'actions',
      width: 100,
      align: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<Eye size={16} />}
              className="text-text-tertiary hover:text-primary hover:bg-primary/5"
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {canRestore && (
            <Tooltip title="Khôi phục">
              <Button
                type="text"
                icon={<RotateCcw size={16} />}
                className="text-text-tertiary hover:text-green-600 hover:bg-green-50"
                onClick={() => handleUnarchive(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="pb-8 animate-[fadeIn_0.3s_ease-in-out]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-sm">
              <Archive size={20} />
            </div>
            <div>
              <Title level={4} style={{ marginBottom: 0, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
                Kho Lưu trữ
              </Title>
              <Text type="secondary" className="text-[13px] font-medium">
                Quản lý tập trung tất cả dữ liệu đã lưu trữ trong hệ thống
              </Text>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tag className="rounded-full border-none bg-primary/10 text-primary font-semibold px-3 py-0.5 text-xs">
            {total} bản ghi
          </Tag>
        </div>
      </div>

      <Card className="!rounded-2xl !border-border-light shadow-[0_4px_20px_-2px_rgba(15,23,42,0.02)] [&_.ant-card-body]:!p-0 overflow-hidden bg-white">
        <div className="px-5 pt-5 pb-3">
          <Segmented
            value={activeTab}
            onChange={handleTabChange}
            options={TAB_OPTIONS.map((opt) => ({
              label: (
                <Space size={6}>
                  {opt.icon}
                  <span>{opt.label}</span>
                </Space>
              ),
              value: opt.value,
            }))}
            className="[&_.ant-segmented-item]:!px-4 [&_.ant-segmented-item]:!py-1.5 [&_.ant-segmented-item-selected]:!bg-primary/10 [&_.ant-segmented-item-selected]:!text-primary !bg-bg-tertiary !rounded-lg"
          />
        </div>

        {filterFields.length > 0 && (
          <FilterBar fields={filterFields} values={filters} onChange={handleFilterChange} />
        )}

        <div className="px-5 pb-5">
          {isLoading ? (
            <div className="flex justify-center items-center h-[400px]">
              <Spin size="large" />
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Archive size={28} className="text-gray-400" />
              </div>
              <Text className="text-text-secondary font-semibold text-base">Chưa có dữ liệu lưu trữ</Text>
              <Text className="text-text-tertiary text-[13px] mt-1">
                Dữ liệu hết hạn hoặc chấm dứt sẽ được lưu trữ tại đây
              </Text>
            </div>
          ) : (
            <Table
              columns={columns}
              dataSource={records}
              rowKey="id"
              pagination={{
                current: filters.page,
                pageSize: filters.pageSize,
                total: total,
                showSizeChanger: true,
                showTotal: (t) => `Tổng ${t} bản ghi`,
                className: '!mb-0 !mt-5',
                onChange: (page, pageSize) => setFilters(prev => ({ ...prev, page, pageSize })),
              }}
              className="custom-table"
              scroll={{ x: 900 }}
            />
          )}
        </div>
      </Card>

      {/* =================== ARCHIVE DETAIL MODAL =================== */}
      <Modal
        title={
          <Space>
            <Archive size={18} />
            <span>Chi tiết bản ghi lưu trữ</span>
          </Space>
        }
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setSelectedRecord(null);
        }}
        footer={
          canRestore && selectedRecord ? (
            <Button
              icon={<RotateCcw size={14} />}
              onClick={() => {
                setIsDetailModalVisible(false);
                handleUnarchive(selectedRecord);
              }}
              className="border-green-500 text-green-600 hover:!bg-green-50 hover:!border-green-600"
            >
              Khôi phục
            </Button>
          ) : null
        }
        width={700}
      >
        {selectedRecord && (
          <div className="space-y-5 mt-4">
            <Descriptions bordered column={2} size="small" title="Thông tin lưu trữ">
              <Descriptions.Item label="Mô tả" span={2}>
                <Text strong>{selectedRecord.displayLabel}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Module">
                {SOURCE_MODULE_LABELS[selectedRecord.sourceModule] || selectedRecord.sourceModule}
              </Descriptions.Item>
              <Descriptions.Item label="Loại">
                <Tag color={entityColorMap[selectedRecord.sourceEntity] || '#666'}>
                  {SOURCE_ENTITY_LABELS[selectedRecord.sourceEntity] || selectedRecord.sourceEntity}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Người lưu trữ">
                {selectedRecord.principal?.displayName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày lưu trữ">
                {selectedRecord.archivedAt ? dayjs(selectedRecord.archivedAt).format('DD/MM/YYYY HH:mm') : '-'}
              </Descriptions.Item>
              {selectedRecord.reason && (
                <Descriptions.Item label="Lý do" span={2}>
                  {selectedRecord.reason}
                </Descriptions.Item>
              )}
            </Descriptions>

            <div>
              <Text strong className="text-sm mb-3 block">Dữ liệu tại thời điểm lưu trữ (Snapshot)</Text>
              {renderSnapshotData(selectedRecord.snapshotData)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ArchiveVaultPage;
