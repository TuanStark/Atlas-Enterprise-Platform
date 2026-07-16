import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Tag, Typography } from 'antd';
import type { TableColumnsType } from 'antd';
import { Plus } from 'lucide-react';

const { Title, Text } = Typography;

import { useLeaveRequests, useApproveLeaveRequest, useRejectLeaveRequest } from '@features/leave/hooks/useLeave';
import type { LeaveRequest } from '@features/leave/types';
import { Spin, Space, Popconfirm } from 'antd';

const statusMap: Record<string, { color: string; label: string }> = {
  draft: { color: 'default', label: 'Nháp' },
  pending: { color: 'orange', label: 'Chờ duyệt' },
  approved: { color: 'green', label: 'Đã duyệt' },
  rejected: { color: 'red', label: 'Từ chối' },
  cancelled: { color: 'default', label: 'Đã hủy' },
};

function LeaveRequestListPage() {
  const navigate = useNavigate();

  const { data: requests = [], isLoading } = useLeaveRequests();
  const approveMutation = useApproveLeaveRequest();
  const rejectMutation = useRejectLeaveRequest();

  const columns: TableColumnsType<LeaveRequest> = [
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
      title: 'Loại phép',
      key: 'type',
      width: 120,
      render: (_, record) => <Tag color="blue">{record.leaveType?.name || 'Phép năm'}</Tag>
    },
    {
      title: 'Từ ngày',
      dataIndex: 'startDate',
      width: 120,
      render: (v: string) => new Date(v).toLocaleDateString('vi-VN')
    },
    {
      title: 'Đến ngày',
      dataIndex: 'endDate',
      width: 120,
      render: (v: string) => new Date(v).toLocaleDateString('vi-VN')
    },
    {
      title: 'Số ngày',
      dataIndex: 'totalDays',
      width: 80,
      align: 'center' as const,
      render: (v: any) => typeof v === 'object' && v !== null ? Number(v).toString() : String(v || 0)
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      width: 200
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
    {
      title: 'Thao tác',
      key: 'actions',
      width: 160,
      render: (_, record) => {
        if (record.status !== 'pending') return null;
        return (
          <Space size={8}>
            <Popconfirm
              title="Duyệt đơn nghỉ phép"
              description="Bạn có chắc chắn muốn duyệt đơn này?"
              okText="Đồng ý"
              cancelText="Hủy"
              onConfirm={() => approveMutation.mutate(record.id)}
            >
              <a style={{ color: 'var(--color-success)', fontSize: 13 }}>Duyệt</a>
            </Popconfirm>
            <Popconfirm
              title="Từ chối đơn"
              description="Bạn muốn từ chối đơn nghỉ phép này?"
              okText="Đồng ý"
              cancelText="Hủy"
              onConfirm={() => rejectMutation.mutate({ id: record.id })}
            >
              <a style={{ color: 'var(--color-error)', fontSize: 13 }}>Từ chối</a>
            </Popconfirm>
          </Space>
        );
      }
    }
  ];

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Spin size="large" tip="Đang tải danh sách đơn nghỉ phép..." />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ marginBottom: 4 }}>Quản lý nghỉ phép</Title>
          <Text type="secondary">Theo dõi và phê duyệt đơn xin nghỉ phép</Text>
        </div>
        <Button type="primary" icon={<Plus size={14} />} onClick={() => navigate('/hrm/leave-requests/new')}>
          Tạo đơn nghỉ phép
        </Button>
      </div>
      <Card style={{ borderRadius: 12, border: '1px solid var(--color-border-light)' }}>
        <Table columns={columns} dataSource={requests} rowKey="id" size="middle"
          pagination={{ pageSize: 20, showTotal: (total) => `Tổng ${total} đơn` }}
        />
      </Card>
    </div>
  );
}

export default LeaveRequestListPage;
