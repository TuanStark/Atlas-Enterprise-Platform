import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Button, Space, Tag, Avatar, Typography, Dropdown, Spin, Modal } from 'antd';
import type { TableColumnsType, MenuProps } from 'antd';
import { Plus, Download, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { FilterBar } from '@shared/components/FilterBar';
import type { FilterBarField } from '@shared/components/FilterBar';
import { PermissionGate, useCanAccessCode } from '@shared/hooks/usePermission';
import { PERMISSIONS } from '@shared/constants/permissions';

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

  const canEdit = useCanAccessCode(PERMISSIONS.HRM.EMPLOYEE.UPDATE);
  const canDelete = useCanAccessCode(PERMISSIONS.HRM.EMPLOYEE.DELETE);

  const getRowActions = (record: Employee): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'view',
        icon: <Eye size={14} />,
        label: 'Xem chi tiết',
        onClick: (info) => {
          info.domEvent.stopPropagation();
          navigate(`/hrm/employees/${record.id}`);
        },
      },
    ];

    if (canEdit) {
      items.push({
        key: 'edit',
        icon: <Edit size={14} />,
        label: 'Chỉnh sửa',
        onClick: (info) => {
          info.domEvent.stopPropagation();
          navigate(`/hrm/employees/${record.id}/edit`);
        },
      });
    }

    if (canDelete) {
      items.push({ type: 'divider' });
      items.push({
        key: 'delete',
        icon: <Trash2 size={14} />,
        label: 'Xóa',
        danger: true,
        onClick: (info) => {
          handleDelete(record.id, info.domEvent);
        },
      });
    }

    return items;
  };

  const columns: TableColumnsType<Employee> = [
    {
      title: 'Nhân viên',
      key: 'name',
      fixed: 'left',
      width: 220,
      render: (_, record) => {
        const initials = `${record.lastName?.[0] || ''}${record.firstName?.[0] || ''}`;
        return (
          <Space size={12}>
            <Avatar
              size={38}
              src={record.avatarFileId ? `/api/v1/files/${record.avatarFileId}/view` : undefined}
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
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Mã nhân viên',
      key: 'employeeCode',
      fixed: 'left',
      width: 140,
      render: (_, record) => {
        const code = record.employeeCode || (record as any).employeeNo || '-';
        return <Text style={{ fontSize: 13 }}>{code}</Text>;
      },
    },
    {
      title: 'Tên',
      dataIndex: 'firstName',
      key: 'firstName',
      width: 120,
      render: (val: string) => <Text style={{ fontSize: 13 }}>{val || '-'}</Text>,
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      width: 110,
      render: (val: string) => {
        const label = val === 'male' ? 'Nam' : val === 'female' ? 'Nữ' : val === 'other' ? 'Khác' : '-';
        return <Text style={{ fontSize: 13 }}>{label}</Text>;
      },
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      width: 130,
      render: (val: string) => (
        <Text style={{ fontSize: 13 }}>
          {val ? new Date(val).toLocaleDateString('vi-VN') : '-'}
        </Text>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 220,
      render: (val: string) => <Text style={{ fontSize: 13 }}>{val || '-'}</Text>,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (val: string) => <Text style={{ fontSize: 13 }}>{val || '-'}</Text>,
    },
    {
      title: 'Tình trạng hôn nhân',
      dataIndex: 'maritalStatus',
      key: 'maritalStatus',
      width: 180,
      render: (val: string) => {
        const label =
          val === 'single'
            ? 'Độc thân'
            : val === 'married'
              ? 'Đã kết hôn'
              : val === 'divorced'
                ? 'Ly hôn'
                : val === 'widowed'
                  ? 'Góa bụa'
                  : val || '-';
        return <Text style={{ fontSize: 13 }}>{label}</Text>;
      },
    },
    {
      title: 'Quốc tịch',
      dataIndex: 'nationality',
      key: 'nationality',
      width: 130,
      render: (val: string) => <Text style={{ fontSize: 13 }}>{val || '-'}</Text>,
    },
    {
      title: 'Số CCCD/CMND',
      dataIndex: 'nationalId',
      key: 'nationalId',
      width: 160,
      render: (val: string) => <Text style={{ fontSize: 13 }}>{val || '-'}</Text>,
    },
    {
      title: 'Mã số thuế',
      dataIndex: 'taxNumber',
      key: 'taxNumber',
      width: 160,
      render: (val: string) => <Text style={{ fontSize: 13 }}>{val || '-'}</Text>,
    },
    {
      title: 'Địa chỉ hiện tại',
      key: 'address',
      width: 320,
      render: (_, record) => {
        const addr = record.addresses?.find((a) => a.isPrimary) || record.addresses?.[0];
        if (!addr) return '-';
        const parts = [addr.addressLine, addr.city, addr.country].filter(Boolean);
        return <Text style={{ fontSize: 13 }}>{parts.join(', ') || '-'}</Text>;
      },
    },
    {
      title: 'Phòng ban',
      key: 'department',
      width: 180,
      render: (_, record) => {
        const currentEmployment = record.employments?.find((e: any) => e.isCurrent) || record.employments?.[0];
        return <Text style={{ fontSize: 13 }}>{currentEmployment?.departmentName || '-'}</Text>;
      },
    },
    {
      title: 'Chức danh',
      key: 'jobTitle',
      width: 180,
      render: (_, record) => {
        const currentEmployment = record.employments?.find((e: any) => e.isCurrent) || record.employments?.[0];
        return <Text style={{ fontSize: 13 }}>{currentEmployment?.jobTitleName || '-'}</Text>;
      },
    },
    {
      title: 'Ngày vào làm',
      key: 'joinDate',
      width: 140,
      render: (_, record) => {
        const currentEmployment = record.employments?.find((e: any) => e.isCurrent) || record.employments?.[0];
        const date = currentEmployment?.startDate || record.joinDate;
        return (
          <Text style={{ fontSize: 13 }}>
            {date ? new Date(date).toLocaleDateString('vi-VN') : '-'}
          </Text>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (val: string) => {
        const config = statusConfig[val] || { color: 'default', label: val || 'Unknown' };
        return (
          <Tag color={config.color} style={{ borderRadius: 6, fontSize: 11, fontWeight: 500 }}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (val: string) => (
        <Text style={{ fontSize: 13 }}>
          {val ? new Date(val).toLocaleDateString('vi-VN') : '-'}
        </Text>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 80,
      render: (_, record) => (
        <Dropdown menu={{ items: getRowActions(record) }} trigger={['click']}>
          <Button type="text" size="small" icon={<MoreHorizontal size={16} />} onClick={(e) => e.stopPropagation()} />
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
      <div className="flex justify-center items-center h-[300px]">
        <Spin size="large" tip="Đang tải danh sách nhân viên..." />
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-start mb-6 max-[768px]:flex-col max-[768px]:gap-4">
        <div>
          <Title level={3} style={{ marginBottom: 4, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Nhân viên
          </Title>
          <Text type="secondary" style={{ fontSize: 14 }}>Quản lý và cập nhật hồ sơ nhân sự của doanh nghiệp.</Text>
        </div>
        <Space size={12}>
          <PermissionGate permission={PERMISSIONS.HRM.EMPLOYEE.EXPORT}>
            <Button icon={<Download size={14} />} style={{ borderRadius: 8, height: 38 }}>
              Xuất Excel
            </Button>
          </PermissionGate>
          <PermissionGate permission={PERMISSIONS.HRM.EMPLOYEE.CREATE}>
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
          </PermissionGate>
        </Space>
      </div>

      <FilterBar
        values={filters}
        onChange={handleFilterChange}
        fields={filterFields}
      />

      {/* Table Card */}
      <Card className="!rounded-2xl !border-solid !border-border-light shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Tìm thấy <Text strong>{filteredData.length}</Text> nhân viên
          </Text>
        </div>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          scroll={{ x: 3800 }}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} nhân viên`,
          }}
          size="middle"
          rowClassName="hover:!bg-bg-tertiary !cursor-pointer transition-colors duration-150"
          onRow={(record) => ({
            onClick: () => navigate(`/hrm/employees/${record.id}`),
          })}
        />
      </Card>
    </div>
  );
}

export default EmployeeListPage;
