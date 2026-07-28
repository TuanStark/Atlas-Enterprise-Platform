import { useState } from 'react';
import { Card, Table, Button, Space, Tag, Typography, Spin, Tooltip, Modal, Form, InputNumber, Select, DatePicker, Input, Dropdown, Descriptions } from 'antd';
import type { TableColumnsType, MenuProps } from 'antd';
import { FileText, Download, Eye, Plus, MoreVertical, PenTool, Trash2, FileSignature, FilePlus, Ban, Archive } from 'lucide-react';
import { FilterBar } from '@shared/components/FilterBar';
import type { FilterBarField } from '@shared/components/FilterBar';
import {
  useContracts,
  useCreateContract,
  useUpdateContract,
  useSignContract,
  useTerminateContract,
  useDeleteContract,
  useCreateContractAnnex,
  useExportContracts,
} from '@features/contract/hooks/useContract';
import { useEmployees } from '@features/employee/hooks/useEmployee';
import { PermissionGate, useCanAccessCode } from '@shared/hooks/usePermission';
import { PERMISSIONS } from '@shared/constants/permissions';
import type { Contract } from '@features/contract/types';
import { useArchiveRecord } from '@features/archive/hooks/useArchive';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const contractStatusConfig: Record<string, { color: string; label: string }> = {
  draft: { color: 'default', label: 'Bản nháp' },
  pending_signature: { color: 'processing', label: 'Chờ ký' },
  active: { color: 'green', label: 'Có hiệu lực' },
  expired: { color: 'red', label: 'Hết hạn' },
  terminated: { color: 'error', label: 'Đã chấm dứt' },
};

function ContractListPage() {
  // --- State ---
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
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAnnexModalVisible, setIsAnnexModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [annexForm] = Form.useForm();

  // --- Queries ---
  const { data: response, isLoading } = useContracts({
    page: filters.page,
    pageSize: filters.pageSize,
    status: filters.status,
  });

  const contracts = response?.data || [];
  const total = response?.total || 0;

  // Fetch employees for the create form dropdown
  const { data: employeesResponse } = useEmployees({ pageSize: 1000 });
  const employeesList = employeesResponse?.data || [];

  // --- Mutations ---
  const createMutation = useCreateContract();
  const updateMutation = useUpdateContract();
  const signMutation = useSignContract();
  const terminateMutation = useTerminateContract();
  const deleteMutation = useDeleteContract();
  const annexMutation = useCreateContractAnnex();
  const exportMutation = useExportContracts();
  const archiveMutation = useArchiveRecord();

  // --- RBAC ---
  // const canCreate = useCanAccessCode(PERMISSIONS.HRM.CONTRACT.CREATE);
  const canUpdate = useCanAccessCode(PERMISSIONS.HRM.CONTRACT.UPDATE);
  const canSign = useCanAccessCode(PERMISSIONS.HRM.CONTRACT.SIGN);
  const canDelete = useCanAccessCode(PERMISSIONS.HRM.CONTRACT.DELETE);
  const canTerminate = useCanAccessCode(PERMISSIONS.HRM.CONTRACT.TERMINATE);
  const canArchive = useCanAccessCode(PERMISSIONS.HRM.CONTRACT.ARCHIVE);

  // --- Filter Config ---
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
        { label: 'Chờ ký', value: 'pending_signature' },
        { label: 'Có hiệu lực', value: 'active' },
        { label: 'Hết hạn', value: 'expired' },
        { label: 'Đã chấm dứt', value: 'terminated' },
      ],
    },
  ];

  // --- Handlers ---

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
      createForm.resetFields();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEditContract = async (values: any) => {
    if (!selectedContract) return;
    try {
      await updateMutation.mutateAsync({
        id: selectedContract.id,
        data: {
          contractType: values.contractType,
          startDate: values.startDate?.format('YYYY-MM-DD'),
          endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
          baseSalary: values.baseSalary,
        },
      });
      setIsEditModalVisible(false);
      editForm.resetFields();
      setSelectedContract(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSignContract = (record: Contract) => {
    Modal.confirm({
      title: 'Xác nhận ký hợp đồng',
      content: (
        <div>
          <Text>Bạn có chắc chắn muốn ký duyệt hợp đồng <Text strong>{record.contractNumber}</Text>?</Text>
          <br />
          <Text type="secondary" className="text-xs">Hợp đồng sẽ chuyển sang trạng thái "Có hiệu lực" và không thể chỉnh sửa.</Text>
        </div>
      ),
      okText: 'Ký duyệt',
      cancelText: 'Hủy',
      okButtonProps: { className: 'bg-primary' },
      onOk: () => {
        return signMutation.mutateAsync({
          id: record.id,
          employmentId: record.employmentId,
          data: { signedDate: dayjs().format('YYYY-MM-DD') },
        });
      },
    });
  };

  const handleTerminateContract = (record: Contract) => {
    let reason = '';
    Modal.confirm({
      title: 'Chấm dứt hợp đồng',
      icon: null,
      content: (
        <div>
          <Text>Bạn có chắc chắn muốn chấm dứt hợp đồng <Text strong>{record.contractNumber}</Text>?</Text>
          <br />
          <Text type="warning" className="text-xs">Thao tác này không thể hoàn tác.</Text>
          <Input.TextArea
            className="mt-3"
            placeholder="Lý do chấm dứt (không bắt buộc)"
            rows={3}
            onChange={(e) => { reason = e.target.value; }}
          />
        </div>
      ),
      okText: 'Chấm dứt',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        return terminateMutation.mutateAsync({
          id: record.id,
          data: {
            terminationDate: dayjs().format('YYYY-MM-DD'),
            reason: reason || undefined,
          },
        });
      },
    });
  };

  const handleDeleteContract = (record: Contract) => {
    Modal.confirm({
      title: 'Xác nhận xóa hợp đồng',
      content: (
        <div>
          <Text>Bạn có chắc chắn muốn xóa hợp đồng <Text strong>{record.contractNumber}</Text>?</Text>
          <br />
          <Text type="danger" className="text-xs">Thao tác này sẽ xóa vĩnh viễn hợp đồng khỏi hệ thống.</Text>
        </div>
      ),
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        return deleteMutation.mutateAsync(record.id);
      },
    });
  };

  const handleOpenEdit = (record: Contract) => {
    setSelectedContract(record);
    editForm.setFieldsValue({
      contractType: record.contractType,
      startDate: record.startDate ? dayjs(record.startDate) : undefined,
      endDate: record.endDate ? dayjs(record.endDate) : undefined,
      baseSalary: record.baseSalary,
    });
    setIsEditModalVisible(true);
  };

  const handleOpenAnnex = (record: Contract) => {
    setSelectedContract(record);
    annexForm.resetFields();
    setIsAnnexModalVisible(true);
  };

  const handleCreateAnnex = async (values: any) => {
    if (!selectedContract) return;
    try {
      await annexMutation.mutateAsync({
        contractId: selectedContract.id,
        employmentId: selectedContract.employmentId,
        data: {
          annexNumber: values.annexNumber,
          effectiveDate: values.effectiveDate.format('YYYY-MM-DD'),
          content: values.content,
        },
      });
      setIsAnnexModalVisible(false);
      annexForm.resetFields();
      setSelectedContract(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleViewDetail = (record: Contract) => {
    setSelectedContract(record);
    setIsDetailModalVisible(true);
  };

  const handleExport = () => {
    exportMutation.mutate({ status: filters.status });
  };

  const handleArchiveContract = (record: Contract) => {
    Modal.confirm({
      title: 'Xác nhận lưu trữ hợp đồng',
      content: (
        <div>
          <Text>Bạn có chắc chắn muốn lưu trữ hợp đồng <Text strong>{record.contractNumber}</Text>?</Text>
          <br />
          <Text type="secondary" className="text-xs">Hợp đồng sẽ được chuyển vào Kho Lưu trữ và không còn hiển thị trong danh sách này.</Text>
        </div>
      ),
      okText: 'Lưu trữ',
      cancelText: 'Hủy',
      okButtonProps: { className: 'bg-primary' },
      onOk: () => {
        return archiveMutation.mutateAsync({
          sourceModule: 'hrm',
          sourceEntity: 'contract',
          sourceRecordId: record.id,
          displayLabel: `${record.contractNumber}${record.employeeName ? ' — ' + record.employeeName : ''}`,
          snapshotData: record as any,
        });
      },
    });
  };

  // --- Table Columns ---

  const getRowActions = (record: Contract): MenuProps['items'] => {
    const items: MenuProps['items'] = [];

    // Edit — only draft, requires UPDATE permission
    if (canUpdate && record.status === 'draft') {
      items.push({
        key: 'edit',
        icon: <PenTool size={14} />,
        label: 'Chỉnh sửa',
        onClick: () => handleOpenEdit(record),
      });
    }

    // Sign — only draft, requires SIGN permission
    if (canSign && record.status === 'draft') {
      items.push({
        key: 'sign',
        icon: <FileSignature size={14} />,
        label: 'Ký hợp đồng',
        onClick: () => handleSignContract(record),
      });
    }

    // Add Annex — only active, requires UPDATE permission
    if (canUpdate && record.status === 'active') {
      items.push({
        key: 'annex',
        icon: <FilePlus size={14} />,
        label: 'Thêm phụ lục',
        onClick: () => handleOpenAnnex(record),
      });
    }

    // Terminate — only active, requires TERMINATE permission
    if (canTerminate && record.status === 'active') {
      items.push({
        key: 'terminate',
        icon: <Ban size={14} />,
        label: 'Chấm dứt hợp đồng',
        danger: true,
        onClick: () => handleTerminateContract(record),
      });
    }

    // Delete — only draft, requires DELETE permission
    if (canDelete && record.status === 'draft') {
      if (items.length > 0) {
        items.push({ type: 'divider' });
      }
      items.push({
        key: 'delete',
        icon: <Trash2 size={14} />,
        label: 'Xóa',
        danger: true,
        onClick: () => handleDeleteContract(record),
      });
    }
    // Archive — requires ARCHIVE permission
    if (canArchive) {
      if (items.length > 0) {
        items.push({ type: 'divider' });
      }
      items.push({
        key: 'archive',
        icon: <Archive size={14} />,
        label: 'Lưu trữ',
        onClick: () => handleArchiveContract(record),
      });
    }

    return items;
  };

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
      render: (_, record) => {
        const menuItems = getRowActions(record);

        return (
          <Space size={4}>
            <Tooltip title="Xem chi tiết">
              <Button
                type="text"
                icon={<Eye size={16} />}
                className="text-text-tertiary hover:text-primary hover:bg-primary/5"
                onClick={() => handleViewDetail(record)}
              />
            </Tooltip>
            {menuItems && menuItems.length > 0 && (
              <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                <Button
                  type="text"
                  icon={<MoreVertical size={16} />}
                  className="text-text-tertiary hover:text-primary hover:bg-primary/5"
                />
              </Dropdown>
            )}
          </Space>
        );
      },
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
          <PermissionGate permission={PERMISSIONS.HRM.CONTRACT.CREATE}>
            <Button
              type="primary"
              icon={<Plus size={16} />}
              className="rounded-lg h-9 font-semibold text-[13px] shadow-sm"
              onClick={() => setIsCreateModalVisible(true)}
            >
              Tạo hợp đồng
            </Button>
          </PermissionGate>
          <PermissionGate permission={PERMISSIONS.HRM.CONTRACT.EXPORT}>
            <Button
              icon={<Download size={16} />}
              className="rounded-lg h-9 font-semibold text-[13px] border-border-light text-text-secondary hover:text-primary hover:border-primary shadow-sm"
              onClick={handleExport}
              loading={exportMutation.isPending}
            >
              Xuất dữ liệu
            </Button>
          </PermissionGate>
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

      {/* =================== CREATE CONTRACT MODAL =================== */}
      <Modal
        title="Tạo Hợp đồng mới"
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onOk={() => createForm.submit()}
        confirmLoading={createMutation.isPending}
        destroyOnClose={false}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateContract}>
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

      {/* =================== EDIT CONTRACT MODAL =================== */}
      <Modal
        title="Chỉnh sửa Hợp đồng"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          editForm.resetFields();
          setSelectedContract(null);
        }}
        onOk={() => editForm.submit()}
        confirmLoading={updateMutation.isPending}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditContract}>
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

      {/* =================== CONTRACT ANNEX MODAL =================== */}
      <Modal
        title="Tạo Phụ lục Hợp đồng"
        open={isAnnexModalVisible}
        onCancel={() => {
          setIsAnnexModalVisible(false);
          annexForm.resetFields();
          setSelectedContract(null);
        }}
        onOk={() => annexForm.submit()}
        confirmLoading={annexMutation.isPending}
        destroyOnClose
      >
        <div className="mb-4 p-3 bg-bg-tertiary rounded-lg">
          <Text type="secondary" className="text-xs">Hợp đồng: </Text>
          <Text strong className="text-sm">{selectedContract?.contractNumber}</Text>
        </div>
        <Form form={annexForm} layout="vertical" onFinish={handleCreateAnnex}>
          <Form.Item name="annexNumber" label="Số phụ lục" rules={[{ required: true, message: 'Vui lòng nhập số phụ lục' }]}>
            <Input placeholder="Nhập số phụ lục (vd: PL-001)" />
          </Form.Item>
          <Form.Item name="effectiveDate" label="Ngày hiệu lực" rules={[{ required: true, message: 'Vui lòng chọn ngày hiệu lực' }]}>
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" placeholder="Chọn ngày hiệu lực" />
          </Form.Item>
          <Form.Item name="content" label="Nội dung phụ lục" rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}>
            <Input.TextArea rows={4} placeholder="Mô tả nội dung thay đổi trong phụ lục..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* =================== CONTRACT DETAIL MODAL =================== */}
      <Modal
        title="Chi tiết Hợp đồng"
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setSelectedContract(null);
        }}
        footer={null}
        width={640}
      >
        {selectedContract && (
          <Descriptions bordered column={2} size="small" className="mt-4">
            <Descriptions.Item label="Số hợp đồng" span={2}>
              <Text strong>{selectedContract.contractNumber}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Nhân viên" span={2}>
              {selectedContract.employeeName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Loại hợp đồng">
              {selectedContract.contractType}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={contractStatusConfig[selectedContract.status]?.color || 'default'}>
                {contractStatusConfig[selectedContract.status]?.label || selectedContract.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày hiệu lực">
              {selectedContract.startDate ? dayjs(selectedContract.startDate).format('DD/MM/YYYY') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày hết hạn">
              {selectedContract.endDate ? dayjs(selectedContract.endDate).format('DD/MM/YYYY') : 'Vô thời hạn'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày ký" span={2}>
              {selectedContract.signedDate ? dayjs(selectedContract.signedDate).format('DD/MM/YYYY') : 'Chưa ký'}
            </Descriptions.Item>
            <Descriptions.Item label="Lương cơ bản" span={2}>
              {selectedContract.baseSalary
                ? `${selectedContract.baseSalary.toLocaleString('vi-VN')} ${selectedContract.salaryCurrency || 'VND'}`
                : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {selectedContract.createdAt ? dayjs(selectedContract.createdAt).format('DD/MM/YYYY HH:mm') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lần cuối">
              {selectedContract.updatedAt ? dayjs(selectedContract.updatedAt).format('DD/MM/YYYY HH:mm') : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}

export default ContractListPage;
