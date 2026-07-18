import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Tree,
  Button,
  Space,
  Typography,
  Select,
  Modal,
  Form,
  Input,
  Switch,
  InputNumber,
  Popconfirm,
  Spin,
  Alert,
} from 'antd';
import {
  Building2,
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  GitFork,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  useOrganizations,
  useOrgUnitTree,
  useUnitTypes,
  useCreateOrgUnit,
  useUpdateOrgUnit,
  useDeleteOrgUnit,
} from '@features/organization/hooks/useOrganization';
import type { OrganizationUnit } from '@features/organization/types';

const { Title, Text } = Typography;

export default function OrganizationPage() {
  const [selectedOrgId, setSelectedOrgId] = useState<string>();
  const [selectedUnit, setSelectedUnit] = useState<OrganizationUnit | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [form] = Form.useForm();

  // Queries
  const { data: organizations, isLoading: loadingOrgs } = useOrganizations();
  const { data: unitTypes } = useUnitTypes();
  const { data: treeData, isLoading: loadingTree } = useOrgUnitTree(selectedOrgId);

  // Mutations
  const createMutation = useCreateOrgUnit(selectedOrgId);
  const updateMutation = useUpdateOrgUnit(selectedOrgId);
  const deleteMutation = useDeleteOrgUnit(selectedOrgId);

  // Auto-select first organization on load
  useEffect(() => {
    if (organizations && organizations.length > 0 && !selectedOrgId) {
      setSelectedOrgId(organizations[0].id);
    }
  }, [organizations, selectedOrgId]);

  // Map backend tree format to Ant Design Tree format
  const mapTreeData = (units: OrganizationUnit[]): any[] => {
    return units.map((unit) => ({
      key: unit.id,
      title: (
        <span className="flex items-center justify-between w-full pr-4 py-1">
          <span className="font-medium text-text-primary text-[13.5px]">{unit.name}</span>
          <span className="text-[10px] text-text-secondary bg-bg-secondary px-2 py-[2px] rounded border border-solid border-border-light ml-2 uppercase font-semibold">
            {unit.code}
          </span>
        </span>
      ),
      raw: unit,
      children: unit.children ? mapTreeData(unit.children) : [],
    }));
  };

  const handleSelectNode = (selectedKeys: any[], info: any) => {
    if (selectedKeys.length > 0 && info.node.raw) {
      setSelectedUnit(info.node.raw);
    } else {
      setSelectedUnit(null);
    }
  };

  const handleOpenCreateModal = () => {
    setModalMode('create');
    form.resetFields();
    form.setFieldsValue({
      parentUnitId: selectedUnit?.id || null,
      isActive: true,
      sortOrder: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = () => {
    if (!selectedUnit) return;
    setModalMode('edit');
    form.resetFields();
    form.setFieldsValue({
      parentUnitId: selectedUnit.parentUnitId || null,
      unitTypeId: selectedUnit.unitTypeId,
      code: selectedUnit.code,
      name: selectedUnit.name,
      sortOrder: selectedUnit.sortOrder || 1,
      isActive: selectedUnit.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSaveUnit = async () => {
    try {
      const values = await form.validateFields();
      if (modalMode === 'create') {
        await createMutation.mutateAsync({
          ...values,
          organizationId: selectedOrgId,
        });
      } else {
        await updateMutation.mutateAsync({
          unitId: selectedUnit!.id,
          payload: values,
        });
        // Update local detail card view
        setSelectedUnit({
          ...selectedUnit!,
          ...values,
          unitType: unitTypes?.find((t) => t.id === values.unitTypeId),
        });
      }
      setIsModalOpen(false);
    } catch (e) {
      // Validate failed or mutation failed
    }
  };

  const handleDeleteUnit = async () => {
    if (!selectedUnit) return;
    await deleteMutation.mutateAsync(selectedUnit.id);
    setSelectedUnit(null);
  };

  // Find parent unit name for selected node display
  const getParentUnitName = (tree: OrganizationUnit[], parentId?: string | null): string => {
    if (!parentId) return 'Không có (Cấp cao nhất)';
    let foundName = '';
    const findInTree = (nodes: OrganizationUnit[]) => {
      for (const n of nodes) {
        if (n.id === parentId) {
          foundName = n.name;
          return;
        }
        if (n.children) findInTree(n.children);
      }
    };
    if (tree) findInTree(tree);
    return foundName || 'Không xác định';
  };

  const antTreeNodes = treeData ? mapTreeData(treeData) : [];

  return (
    <div style={{ padding: 24 }}>
      {/* Header section */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space direction="vertical" size={4}>
            <Title level={4} style={{ margin: 0 }}>Cơ cấu Tổ chức</Title>
            <Text type="secondary">
              Thiết lập phòng ban, trung tâm chi phí và sơ đồ cấp bậc tổ chức phòng ban của công ty.
            </Text>
          </Space>
        </Col>
        <Col>
          {organizations && organizations.length > 1 && (
            <Select
              style={{ width: 250 }}
              placeholder="Chọn công ty"
              value={selectedOrgId}
              onChange={(val) => {
                setSelectedOrgId(val);
                setSelectedUnit(null);
              }}
              loading={loadingOrgs}
            >
              {organizations.map((org) => (
                <Select.Option key={org.id} value={org.id}>
                  {org.name}
                </Select.Option>
              ))}
            </Select>
          )}
        </Col>
      </Row>

      <Row gutter={24}>
        {/* Left Side: Interactive Tree */}
        <Col xs={24} lg={12} style={{ marginBottom: 24 }}>
          <Card
            title={
              <Space>
                <FolderTree size={18} style={{ color: 'var(--color-primary)' }} />
                <span className="font-semibold text-text-primary text-[15px]">Sơ đồ phòng ban</span>
              </Space>
            }
            extra={
              <Button
                type="primary"
                icon={<Plus size={14} />}
                onClick={handleOpenCreateModal}
                disabled={!selectedOrgId}
                size="small"
                style={{ borderRadius: 6 }}
              >
                Thêm đơn vị
              </Button>
            }
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
            styles={{ body: { padding: '16px 20px', minHeight: 450 } }}
          >
            {loadingTree ? (
              <div className="flex items-center justify-center h-[350px]">
                <Spin size="large" tip="Đang tải sơ đồ cây phòng ban..." />
              </div>
            ) : antTreeNodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[350px] text-center">
                <GitFork size={48} className="text-text-tertiary mb-3 opacity-60" />
                <Text type="secondary" style={{ fontSize: 13.5 }}>
                  Chưa cấu hình cơ cấu phòng ban cho tổ chức này.
                </Text>
                <Button
                  type="primary"
                  icon={<Plus size={14} />}
                  onClick={handleOpenCreateModal}
                  style={{ marginTop: 16, borderRadius: 6 }}
                >
                  Khởi tạo Đơn vị đầu tiên
                </Button>
              </div>
            ) : (
              <div className="max-h-[500px] overflow-y-auto">
                <Tree
                  showLine={{ showLeafIcon: false }}
                  blockNode
                  treeData={antTreeNodes}
                  onSelect={handleSelectNode}
                  defaultExpandAll
                />
              </div>
            )}
          </Card>
        </Col>

        {/* Right Side: Unit Details & Quick Actions */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <Building2 size={18} style={{ color: 'var(--color-primary)' }} />
                <span className="font-semibold text-text-primary text-[15px]">Thông tin chi tiết</span>
              </Space>
            }
            style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
            styles={{ body: { padding: 24, minHeight: 450 } }}
          >
            {selectedUnit ? (
              <div className="flex flex-col justify-between h-full min-h-[380px]">
                <div>
                  <div className="flex justify-between align-middle mb-4">
                    <Title level={5} style={{ margin: 0, color: 'var(--color-text-primary)' }}>
                      {selectedUnit.name}
                    </Title>
                    {selectedUnit.isActive ? (
                      <span className="flex items-center gap-1 text-[11px] bg-green-50 text-green-600 px-2.5 py-0.5 rounded-full font-medium border border-solid border-green-200">
                        <CheckCircle2 size={10} /> Đang hoạt động
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full font-medium border border-solid border-red-200">
                        <XCircle size={10} /> Tạm dừng
                      </span>
                    )}
                  </div>

                  <hr className="border-0 border-b border-solid border-border-light mb-4" />

                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Mã phòng ban</Text>
                      <Text strong style={{ fontSize: 13.5 }}>{selectedUnit.code}</Text>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Loại đơn vị</Text>
                      <Text strong style={{ fontSize: 13.5 }}>
                        {selectedUnit.unitType?.name || 'Không xác định'}
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Phòng ban cấp cha</Text>
                      <Text strong style={{ fontSize: 13.5 }}>
                        {getParentUnitName(treeData || [], selectedUnit.parentUnitId)}
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Thứ tự hiển thị</Text>
                      <Text strong style={{ fontSize: 13.5 }}>{selectedUnit.sortOrder || 0}</Text>
                    </Col>
                    <Col span={24}>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Đường dẫn cấu trúc (Path)</Text>
                      <Text style={{ fontSize: 12.5, fontFamily: 'monospace', wordBreak: 'break-all' }} type="warning">
                        {selectedUnit.path || 'Không có'}
                      </Text>
                    </Col>
                  </Row>
                </div>

                <div className="mt-8 pt-4 border-0 border-t border-solid border-border-light flex gap-3">
                  <Button
                    type="primary"
                    icon={<Edit2 size={14} />}
                    onClick={handleOpenEditModal}
                    style={{ flex: 1, borderRadius: 6 }}
                  >
                    Chỉnh sửa
                  </Button>
                  <Popconfirm
                    title="Xác nhận xóa phòng ban này?"
                    description="Thao tác này cũng sẽ xóa các phòng ban con liên kết (nếu có)."
                    onConfirm={handleDeleteUnit}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
                  >
                    <Button
                      danger
                      icon={<Trash2 size={14} />}
                      style={{ flex: 1, borderRadius: 6 }}
                      loading={deleteMutation.isPending}
                    >
                      Xóa phòng ban
                    </Button>
                  </Popconfirm>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[350px] text-center">
                <GitFork size={48} className="text-text-tertiary mb-3 opacity-60" />
                <Text type="secondary" style={{ fontSize: 13.5 }}>
                  Vui lòng chọn một phòng ban bên sơ đồ để xem thông tin chi tiết.
                </Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Create / Edit Modal */}
      <Modal
        title={modalMode === 'create' ? 'Thêm đơn vị phòng ban con' : 'Chỉnh sửa thông tin phòng ban'}
        open={isModalOpen}
        onOk={handleSaveUnit}
        onCancel={() => setIsModalOpen(false)}
        okText={modalMode === 'create' ? 'Thêm mới' : 'Cập nhật'}
        cancelText="Hủy"
        okButtonProps={{ loading: createMutation.isPending || updateMutation.isPending }}
        destroyOnClose
        style={{ borderRadius: 12 }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {modalMode === 'create' && selectedUnit && (
            <Alert
              message={
                <Text style={{ fontSize: 13 }}>
                  Thêm đơn vị con trực thuộc: <strong>{selectedUnit.name}</strong>
                </Text>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Form Item: Parent unit Id hidden or selected */}
          <Form.Item name="parentUnitId" hidden>
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="code"
                label="Mã phòng ban"
                rules={[
                  { required: true, message: 'Nhập mã phòng ban' },
                  { pattern: /^[A-Z0-9_]+$/, message: 'Chỉ chấp nhận chữ in hoa, số và dấu gạch dưới' },
                ]}
              >
                <Input placeholder="Ví dụ: TECH_DEPT" disabled={modalMode === 'edit'} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unitTypeId"
                label="Loại đơn vị"
                rules={[{ required: true, message: 'Chọn loại đơn vị' }]}
              >
                <Select placeholder="Chọn loại đơn vị">
                  {unitTypes?.map((type) => (
                    <Select.Option key={type.id} value={type.id}>
                      {type.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="name"
            label="Tên phòng ban/đơn vị"
            rules={[{ required: true, message: 'Nhập tên phòng ban' }]}
          >
            <Input placeholder="Ví dụ: Phòng Nghiên cứu và Phát triển" />
          </Form.Item>

          <Row gutter={16} align="middle">
            <Col span={12}>
              <Form.Item name="sortOrder" label="Thứ tự sắp xếp">
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="isActive" label="Trạng thái hoạt động" valuePropName="checked">
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
