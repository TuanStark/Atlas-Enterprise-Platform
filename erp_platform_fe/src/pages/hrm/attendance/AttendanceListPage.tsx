import { Card, Table, Tag, Typography, Space, Select } from 'antd';
import type { TableColumnsType } from 'antd';


const { Title, Text } = Typography;

import { useAttendanceRecords } from '@features/attendance/hooks/useAttendance';
import type { AttendanceRecord } from '@features/attendance/types';
import { Spin } from 'antd';

const statusMap: Record<string, { color: string; label: string }> = {
  present: { color: 'green', label: 'Có mặt' },
  absent: { color: 'red', label: 'Vắng' },
  late: { color: 'orange', label: 'Đi muộn' },
  early_leave: { color: 'gold', label: 'Về sớm' },
  overtime: { color: 'blue', label: 'Tăng ca' },
  holiday: { color: 'purple', label: 'Nghỉ lễ' },
};

function AttendanceListPage() {
  const { data: records = [], isLoading } = useAttendanceRecords();

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

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Spin size="large" tip="Đang tải danh sách chấm công..." />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ marginBottom: 4 }}>Chấm công</Title>
          <Text type="secondary">Theo dõi giờ làm việc và trạng thái chấm công</Text>
        </div>
        <Space>
          <Select defaultValue="today" style={{ width: 160 }} options={[
            { value: 'today', label: 'Hôm nay' },
            { value: 'week', label: 'Tuần này' },
            { value: 'month', label: 'Tháng này' },
          ]} />
        </Space>
      </div>
      <Card style={{ borderRadius: 12, border: '1px solid var(--color-border-light)' }}>
        <Table columns={columns} dataSource={records} rowKey="id" size="middle"
          pagination={{ pageSize: 20, showTotal: (total) => `Tổng ${total} bản ghi` }}
        />
      </Card>
    </div>
  );
}

export default AttendanceListPage;
