import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Space, Tag, Avatar, Typography, Dropdown, Spin, Modal } from 'antd';
import type { TableColumnsType, MenuProps } from 'antd';
import { Plus, Download, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { FilterBar } from '@shared/components/FilterBar';
import type { FilterBarField } from '@shared/components/FilterBar';
import './EmployeeListPage.css';

const { Title, Text } = Typography;

import { useEmployees, useDeleteEmployee } from '@features/employee/hooks/useEmployee';
import type { Employee } from '@features/employee/types';

const statusConfig: Record<string, { color: string; label: string }> = {
  active: { color: 'green', label: 'Chính thức' },
  probation: { color: 'orange', label: 'Thử việc' },
  suspended: { color: 'red', label: 'Tạm ngưng' },
  resigned: { color: 'default', label: 'Nghỉ việc' },
};

function EmployeeListPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<{
    searchText: string;
    status: string | undefined;
  }>({
    searchText: '',
    status: undefined,
  });

  const { data: employees = [], isLoading } = useEmployees();
  const deleteMutation = useDeleteEmployee();

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filterFields: FilterBarField[] = [
    {
      key: 'searchText',
      type: 'text',
      label: 'Tìm kiếm',
      placeholder: 'Tìm nhân viên theo tên hoặc mã...',
      span: 12,
    },
    {
      key: 'status',
      type: 'select',
      label: 'Trạng thái',
      placeholder: 'Chọn trạng thái...',
      options: Object.entries(statusConfig).map(([key, value]) => ({
        value: key,
        label: value.label,
      })),
      span: 12,
    }
  ];

  const handleDelete = (id: string, e: any) => {
    e?.stopPropagation();
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa nhân viên này khỏi hệ thống?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        deleteMutation.mutate(id);
      },
    });
  };

  const getRowActions = (record: Employee): MenuProps['items'] => [
    {
      key: 'view',
      icon: <Eye size={14} />,
      label: 'Xem chi tiết',
      onClick: (info) => {
        info.domEvent.stopPropagation();
        navigate(`/hrm/employees/${record.id}`);
      },
    },
    {
      key: 'edit',
      icon: <Edit size={14} />,
      label: 'Chỉnh sửa',
      onClick: (info) => {
        info.domEvent.stopPropagation();
        navigate(`/hrm/employees/${record.id}/edit`);
      },
    },
    { type: 'divider' },
    {
      key: 'delete',
      icon: <Trash2 size={14} />,
      label: 'Xóa',
      danger: true,
      onClick: (info) => {
        handleDelete(record.id, info.domEvent);
      },
    },
  ];

  const columns: TableColumnsType<Employee> = [
    {
      title: 'Nhân viên',
      key: 'name',
      fixed: 'left',
      width: 280,
      render: (_, record) => {
        const initials = `${record.lastName?.[0] || ''}${record.firstName?.[0] || ''}`;
        const code = record.employeeCode || (record as any).employeeNo || '-';
        return (
          <Space size={12}>
            <Avatar
              size={38}
              style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))',
                fontSize: 13,
                fontWeight: 600,
                color: 'white',
                boxShadow: '0 2px 8px rgba(14, 165, 233, 0.15)',
              }}
            >
              {initials || 'NV'}
            </Avatar>
            <div>
              <Text strong style={{ fontSize: 13, display: 'block', color: 'var(--color-text-primary)' }}>
                {record.lastName} {record.firstName}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {code}
              </Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Phòng ban',
      key: 'department',
      width: 160,
      render: (_, record) => {
        const dept = record.employments?.find(e => e.isCurrent)?.departmentName || '-';
        return <Text style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{dept}</Text>;
      },
    },
    {
      title: 'Chức danh',
      key: 'jobTitle',
      width: 180,
      render: (_, record) => {
        const title = record.employments?.find(e => e.isCurrent)?.jobTitleName || '-';
        return <Text style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{title}</Text>;
      },
    },
    {
      title: 'Email',
      key: 'email',
      width: 220,
      render: (_, record) => {
        const email = record.contacts?.find(c => c.type === 'email' || (c as any).contactType === 'email')?.value || '-';
        return <Text type="secondary" style={{ fontSize: 13 }}>{email}</Text>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 120,
      render: (status: string) => {
        const config = statusConfig[status] || { color: 'default', label: status };
        return <Tag color={config.color} style={{ borderRadius: 4, fontWeight: 500 }}>{config.label}</Tag>;
      },
    },
    {
      title: 'Ngày vào',
      dataIndex: 'joinDate',
      width: 120,
      render: (date: string) => (
        <Text type="secondary" style={{ fontSize: 13 }}>
          {date ? new Date(date).toLocaleDateString('vi-VN') : '-'}
        </Text>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 48,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown menu={{ items: getRowActions(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreHorizontal size={16} />} size="small" onClick={(e) => e.stopPropagation()} />
        </Dropdown>
      ),
    },
  ];

  const filteredData = employees.filter((emp) => {
    const fullName = `${emp.lastName || ''} ${emp.firstName || ''} ${emp.employeeCode || (emp as any).employeeNo || ''}`;
    const matchesSearch = fullName.toLowerCase().includes(filters.searchText.toLowerCase());
    const matchesStatus = !filters.status || emp.status === filters.status;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Spin size="large" tip="Đang tải danh sách nhân viên..." />
      </div>
    );
  }

  return (
    <div className="employee-list-page">
      {/* Page Header */}
      <div className="employee-list-page__header">
        <div>
          <Title level={3} style={{ marginBottom: 4, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Nhân viên
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>Quản lý và cập nhật hồ sơ nhân sự của doanh nghiệp.</Text>
        </div>
        <Space size={12}>
          <Button icon={<Download size={14} />} style={{ borderRadius: 8, height: 38 }}>
            Xuất Excel
          </Button>
          <Button
            type="primary"
            icon={<Plus size={14} />}
            onClick={() => navigate('/hrm/employees/new')}
            style={{ 
              borderRadius: 8, 
              height: 38,
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))',
              border: 'none',
              fontWeight: 600
            }}
          >
            Thêm nhân viên
          </Button>
        </Space>
      </div>

      <FilterBar
        values={filters}
        onChange={handleFilterChange}
        fields={filterFields}
      />

      {/* Table Card */}
      <Card className="employee-list-page__card" style={{ borderRadius: 16, border: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Tìm thấy <Text strong>{filteredData.length}</Text> nhân viên
          </Text>
        </div>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          scroll={{ x: 1100 }}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} nhân viên`,
          }}
          size="middle"
          rowClassName="employee-list-page__row"
          onRow={(record) => ({
            onClick: () => navigate(`/hrm/employees/${record.id}`),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>
    </div>
  );
}

export default EmployeeListPage;
