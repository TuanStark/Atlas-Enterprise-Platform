import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Tag, Typography, Spin, Space, Popconfirm } from 'antd';
import type { TableColumnsType } from 'antd';
import { Plus } from 'lucide-react';
import { FilterBar } from '@shared/components/FilterBar';
import type { FilterBarField } from '@shared/components/FilterBar';
import { useLeaveRequests, useApproveLeaveRequest, useRejectLeaveRequest } from '@features/leave/hooks/useLeave';
import type { LeaveRequest } from '@features/leave/types';
import { PermissionGate } from '@shared/hooks/usePermission';
import { PERMISSIONS } from '@shared/constants/permissions';

const { Title, Text } = Typography;

const statusMap: Record<string, { color: string; label: string }> = {
  draft: { color: 'default', label: 'Nháp' },
  pending: { color: 'orange', label: 'Chờ duyệt' },
  approved: { color: 'green', label: 'Đã duyệt' },
  rejected: { color: 'red', label: 'Từ chối' },
  cancelled: { color: 'default', label: 'Đã hủy' },
};

function LeaveRequestListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<{
    searchText: string;
    status: string | undefined;
  }>({
    searchText: '',
    status: undefined,
  });

  const { data: requests = [], isLoading } = useLeaveRequests();
  const approveMutation = useApproveLeaveRequest();
  const rejectMutation = useRejectLeaveRequest();

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filterFields: FilterBarField[] = [
    {
      key: 'searchText',
      type: 'text',
      label: 'Nhân viên',
      placeholder: 'Tìm nhân viên theo tên...',
      span: 12,
    },
    {
      key: 'status',
      type: 'select',
      label: 'Trạng thái đơn',
      placeholder: 'Chọn trạng thái...',
      options: Object.entries(statusMap).map(([key, value]) => ({
        value: key,
        label: value.label,
      })),
      span: 12,
    }
  ];

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
            <PermissionGate permission={PERMISSIONS.HRM.LEAVE.APPROVE}>
              <Popconfirm
                title="Duyệt đơn nghỉ phép"
                description="Bạn có chắc chắn muốn duyệt đơn này?"
                okText="Đồng ý"
                cancelText="Hủy"
                onConfirm={() => approveMutation.mutate(record.id)}
              >
                <a style={{ color: 'var(--color-success)', fontSize: 13 }}>Duyệt</a>
              </Popconfirm>
            </PermissionGate>
            <PermissionGate permission={PERMISSIONS.HRM.LEAVE.REJECT}>
              <Popconfirm
                title="Từ chối đơn"
                description="Bạn muốn từ chối đơn nghỉ phép này?"
                okText="Đồng ý"
                cancelText="Hủy"
                onConfirm={() => rejectMutation.mutate({ id: record.id })}
              >
                <a style={{ color: 'var(--color-error)', fontSize: 13 }}>Từ chối</a>
              </Popconfirm>
            </PermissionGate>
          </Space>
        );
      }
    }
  ];

  const filteredRequests = requests.filter(req => {
    const emp = req.employment?.employee;
    const empName = emp ? `${emp.lastName || ''} ${emp.firstName || ''}` : '';
    const matchesSearch = empName.toLowerCase().includes(filters.searchText.toLowerCase());
    const matchesStatus = !filters.status || req.status === filters.status;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Spin size="large" tip="Đang tải danh sách đơn nghỉ phép..." />
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ marginBottom: 4, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
            Quản lý nghỉ phép
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>Theo dõi và phê duyệt đơn xin nghỉ phép của nhân viên.</Text>
        </div>
        <PermissionGate permission={PERMISSIONS.HRM.LEAVE.CREATE}>
          <Button
            type="primary"
            icon={<Plus size={14} />}
            onClick={() => navigate('/hrm/leave-requests/new')}
            style={{ height: 38, borderRadius: 8, fontWeight: 600 }}
          >
            Tạo đơn nghỉ phép
          </Button>
        </PermissionGate>
      </div>

      <FilterBar
        values={filters}
        onChange={handleFilterChange}
        fields={filterFields}
      />

      <Card style={{ borderRadius: 16, border: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <Table columns={columns} dataSource={filteredRequests} rowKey="id" size="middle"
          pagination={{ pageSize: 20, showTotal: (total) => `Tổng ${total} đơn` }}
        />
      </Card>
    </div>
  );
}

export default LeaveRequestListPage;
