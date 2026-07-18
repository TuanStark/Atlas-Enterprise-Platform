import { useState } from 'react';
import { Card, Table, Tag, Typography, Spin } from 'antd';
import type { TableColumnsType } from 'antd';
import { FilterBar } from '@shared/components/FilterBar';
import type { FilterBarField } from '@shared/components/FilterBar';
import { useAttendanceRecords } from '@features/attendance/hooks/useAttendance';
import type { AttendanceRecord } from '@features/attendance/types';

const { Title, Text } = Typography;

const statusMap: Record<string, { color: string; label: string }> = {
  present: { color: 'green', label: 'Có mặt' },
  absent: { color: 'red', label: 'Vắng' },
  late: { color: 'orange', label: 'Đi muộn' },
  early_leave: { color: 'gold', label: 'Về sớm' },
  overtime: { color: 'blue', label: 'Tăng ca' },
  holiday: { color: 'purple', label: 'Nghỉ lễ' },
};

function AttendanceListPage() {
  const [filters, setFilters] = useState<{
    timeRange: string;
    searchText: string;
    status: string | undefined;
  }>({
    timeRange: 'month',
    searchText: '',
    status: undefined,
  });

  const { data: records = [], isLoading } = useAttendanceRecords();

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filterFields: FilterBarField[] = [
    {
      key: 'timeRange',
      type: 'select',
      label: 'Thời gian',
      options: [
        { value: 'all', label: 'Tất cả thời gian' },
        { value: 'today', label: 'Hôm nay' },
        { value: 'week', label: 'Tuần này' },
        { value: 'month', label: 'Tháng này' },
      ],
      span: 6,
    },
    {
      key: 'searchText',
      type: 'text',
      label: 'Nhân viên',
      placeholder: 'Tìm nhân viên theo tên...',
      span: 10,
    },
    {
      key: 'status',
      type: 'select',
      label: 'Trạng thái',
      placeholder: 'Chọn trạng thái...',
      options: Object.entries(statusMap).map(([key, value]) => ({
        value: key,
        label: value.label,
      })),
      span: 8,
    }
  ];

  const columns: TableColumnsType<AttendanceRecord> = [
    {
      title: 'Nhân viên',
      key: 'employee',
      width: 180,
      render: (_, record) => {
        const emp = record.employment?.employee;
        return <Text strong style={{ fontSize: 13 }}>{emp ? `${emp.lastName || ''} ${emp.firstName || ''}` : 'Chưa gán'}</Text>;
      }
    },
    {
      title: 'Ngày',
      dataIndex: 'attendanceDate',
      width: 120,
      render: (v: string) => new Date(v).toLocaleDateString('vi-VN')
    },
    {
      title: 'Check-in',
      dataIndex: 'checkInAt',
      width: 100,
      align: 'center' as const,
      render: (v?: string) => v ? new Date(v).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-'
    },
    {
      title: 'Check-out',
      dataIndex: 'checkOutAt',
      width: 100,
      align: 'center' as const,
      render: (v?: string) => v ? new Date(v).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '-'
    },
    {
      title: 'Giờ công',
      dataIndex: 'workedMinutes',
      width: 100,
      align: 'center' as const,
      render: (v?: number) => v && v > 0 ? `${(v / 60).toFixed(1)}h` : '-'
    },
    {
      title: 'Nguồn',
      dataIndex: 'source',
      width: 100,
      render: (v?: string) => <Text type="secondary" style={{ fontSize: 12, textTransform: 'capitalize' }}>{v || '-'}</Text>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      render: (s: string) => {
        const c = statusMap[s];
        return <Tag color={c?.color}>{c?.label || s}</Tag>;
      },
    },
  ];

  const filteredRecords = records.filter(rec => {
    const empName = `${rec.employment?.employee?.lastName || ''} ${rec.employment?.employee?.firstName || ''}`;
    const matchesSearch = empName.toLowerCase().includes(filters.searchText.toLowerCase());
    const matchesStatus = !filters.status || rec.status === filters.status;
    
    let matchesTime = true;
    if (filters.timeRange === 'today') {
      matchesTime = new Date(rec.attendanceDate).toDateString() === new Date().toDateString();
    } else if (filters.timeRange === 'week') {
      const diff = new Date().getTime() - new Date(rec.attendanceDate).getTime();
      matchesTime = diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
    } else if (filters.timeRange === 'month') {
      const recDate = new Date(rec.attendanceDate);
      const today = new Date();
      matchesTime = recDate.getMonth() === today.getMonth() && recDate.getFullYear() === today.getFullYear();
    }
    
    return matchesSearch && matchesStatus && matchesTime;
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Spin size="large" tip="Đang tải danh sách chấm công..." />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 4 }}>Chấm công</Title>
        <Text type="secondary">Theo dõi giờ làm việc và trạng thái chấm công</Text>
      </div>

      <FilterBar
        values={filters}
        onChange={handleFilterChange}
        fields={filterFields}
      />

      <Card style={{ borderRadius: 12, border: '1px solid var(--color-border-light)' }}>
        <Table columns={columns} dataSource={filteredRecords} rowKey="id" size="middle"
          pagination={{ pageSize: 20, showTotal: (total) => `Tổng ${total} bản ghi` }}
        />
      </Card>
    </div>
  );
}

export default AttendanceListPage;
