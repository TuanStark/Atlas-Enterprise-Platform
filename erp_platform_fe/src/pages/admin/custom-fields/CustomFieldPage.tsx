import { useState } from 'react';
import { Card, Table, Typography, Row, Col, Space, Tag, Button, Modal, Form, Input, Select, Switch, Empty, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import { Sliders, Plus, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@shared/api';
import { message } from 'antd';

const { Title, Text } = Typography;

/** Types matching backend CustomFieldDefinition */
interface CustomFieldOption {
  id: string;
  value: string;
  label: string;
  sortOrder?: number;
  isActive?: boolean;
}

interface CustomFieldDefinition {
  id: string;
  tenantId: string;
  targetModule: string;
  targetEntity: string;
  code: string;
  name: string;
  fieldType: string;
  isRequired?: boolean;
  defaultValue?: string;
  displayOrder?: number;
  createdAt?: string;
  options?: CustomFieldOption[];
}

/** API matching CustomFieldController */
const customFieldApi = {
  async listDefinitions(targetModule: string, targetEntity: string): Promise<CustomFieldDefinition[]> {
    const { data } = await httpClient.get<CustomFieldDefinition[]>(
      `/custom-fields/definitions/${targetModule}/${targetEntity}`,
    );
    return data;
  },
  async createDefinition(dto: Partial<CustomFieldDefinition> & { options?: { value: string; label: string }[] }): Promise<CustomFieldDefinition> {
    const { data } = await httpClient.post<CustomFieldDefinition>('/custom-fields/definitions', dto);
    return data;
  },
  async deleteDefinition(id: string): Promise<void> {
    await httpClient.delete(`/custom-fields/definitions/${id}`);
  },
};

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: 'Văn bản',
  number: 'Số',
  date: 'Ngày',
  boolean: 'Đúng/Sai',
  select: 'Danh sách chọn',
  multiselect: 'Chọn nhiều',
  textarea: 'Văn bản dài',
};

const FIELD_TYPE_COLORS: Record<string, string> = {
  text: 'blue',
  number: 'green',
  date: 'orange',
  boolean: 'purple',
  select: 'cyan',
  multiselect: 'magenta',
  textarea: 'geekblue',
};

const MODULE_OPTIONS = [
  { label: 'Nhân viên (HRM)', value: 'hrm' },
  { label: 'Tổ chức (Org)', value: 'organization' },
  { label: 'Tài sản (Asset)', value: 'asset' },
];

const ENTITY_OPTIONS: Record<string, { label: string; value: string }[]> = {
  hrm: [
    { label: 'Nhân viên (Employee)', value: 'employee' },
    { label: 'Hợp đồng (Employment)', value: 'employment' },
    { label: 'Yêu cầu nghỉ (LeaveRequest)', value: 'leave_request' },
  ],
  organization: [
    { label: 'Tổ chức (Organization)', value: 'organization' },
    { label: 'Đơn vị (OrganizationUnit)', value: 'organization_unit' },
  ],
  asset: [
    { label: 'Tài sản (Asset)', value: 'asset' },
  ],
};

export default function CustomFieldPage() {
  const queryClient = useQueryClient();
  const [selectedModule, setSelectedModule] = useState('hrm');
  const [selectedEntity, setSelectedEntity] = useState('employee');

  const { data: definitions = [], isLoading } = useQuery({
    queryKey: ['custom-fields', selectedModule, selectedEntity],
    queryFn: () => customFieldApi.listDefinitions(selectedModule, selectedEntity),
    enabled: Boolean(selectedModule && selectedEntity),
  });

  const createMutation = useMutation({
    mutationFn: customFieldApi.createDefinition,
    onSuccess: () => {
      message.success('Đã tạo trường tùy chỉnh!');
      void queryClient.invalidateQueries({ queryKey: ['custom-fields'] });
      setIsCreateOpen(false);
      form.resetFields();
    },
    onError: () => message.error('Tạo trường thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: customFieldApi.deleteDefinition,
    onSuccess: () => {
      message.success('Đã xóa trường tùy chỉnh!');
      void queryClient.invalidateQueries({ queryKey: ['custom-fields'] });
    },
    onError: () => message.error('Xóa trường thất bại'),
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form] = Form.useForm();

  const columns: TableColumnsType<CustomFieldDefinition> = [
    {
      title: 'Tên trường',
      key: 'name',
      render: (_, record) => (
        <div>
          <Text strong style={{ fontSize: 13 }}>{record.name}</Text>
          <Text code style={{ display: 'block', fontSize: 11, color: 'var(--color-text-tertiary)' }}>{record.code}</Text>
        </div>
      ),
    },
    {
      title: 'Kiểu dữ liệu',
      dataIndex: 'fieldType',
      key: 'fieldType',
      width: 140,
      render: (val: string) => (
        <Tag color={FIELD_TYPE_COLORS[val] || 'default'} style={{ fontSize: 11 }}>
          {FIELD_TYPE_LABELS[val] || val}
        </Tag>
      ),
    },
    {
      title: 'Bắt buộc',
      dataIndex: 'isRequired',
      key: 'isRequired',
      width: 100,
      render: (val: boolean) => val ? <Tag color="red">Bắt buộc</Tag> : <Text type="secondary">Không</Text>,
    },
    {
      title: 'Giá trị mặc định',
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      width: 140,
      render: (val: string) => val || <Text type="secondary">—</Text>,
    },
    {
      title: 'Thứ tự',
      dataIndex: 'displayOrder',
      key: 'displayOrder',
      width: 80,
      render: (val: number) => val ?? '—',
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Tooltip title="Xóa trường">
          <Button
            type="text"
            danger
            size="small"
            icon={<Trash2 size={14} />}
            onClick={() => {
              Modal.confirm({
                title: 'Xóa trường tùy chỉnh',
                content: `Xóa "${record.name}" sẽ xóa tất cả dữ liệu liên quan. Bạn có chắc?`,
                okText: 'Xóa',
                okType: 'danger',
                cancelText: 'Hủy',
                onOk: () => deleteMutation.mutate(record.id),
              });
            }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space direction="vertical" size={4}>
            <Title level={4} style={{ margin: 0 }}>
              <Space><Sliders size={20} /> Trường tùy chỉnh (Custom Fields)</Space>
            </Title>
            <Text type="secondary">Tạo các trường dữ liệu bổ sung cho bất kỳ entity nào trong hệ thống, không cần thay đổi database.</Text>
          </Space>
        </Col>
        <Col>
          <Button type="primary" icon={<Plus size={14} />} onClick={() => setIsCreateOpen(true)} style={{ borderRadius: 6 }}>
            Tạo trường mới
          </Button>
        </Col>
      </Row>

      {/* Module/Entity Selector */}
      <Card style={{ borderRadius: 12, marginBottom: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }} styles={{ body: { padding: '12px 24px' } }}>
        <Row gutter={16} align="middle">
          <Col xs={24} sm={8}>
            <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Module</Text>
            <Select
              value={selectedModule}
              onChange={(v) => { setSelectedModule(v); setSelectedEntity(ENTITY_OPTIONS[v]?.[0]?.value || ''); }}
              options={MODULE_OPTIONS}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Entity</Text>
            <Select
              value={selectedEntity}
              onChange={setSelectedEntity}
              options={ENTITY_OPTIONS[selectedModule] || []}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>
      </Card>

      <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        <Table<CustomFieldDefinition>
          columns={columns}
          dataSource={definitions}
          rowKey="id"
          loading={isLoading}
          pagination={false}
          locale={{ emptyText: <Empty description={`Chưa có trường tùy chỉnh nào cho ${selectedModule}.${selectedEntity}.`} /> }}
        />
      </Card>

      {/* Create Modal */}
      <Modal title="Tạo trường tùy chỉnh" open={isCreateOpen} onCancel={() => setIsCreateOpen(false)} footer={null} width={520}>
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => createMutation.mutate({
            ...values,
            targetModule: selectedModule,
            targetEntity: selectedEntity,
          })}
          style={{ marginTop: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="code" label="Mã trường" rules={[{ required: true }]}>
                <Input placeholder="VD: blood_type" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="name" label="Tên trường" rules={[{ required: true }]}>
                <Input placeholder="VD: Nhóm máu" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="fieldType" label="Kiểu dữ liệu" rules={[{ required: true }]}>
                <Select options={Object.entries(FIELD_TYPE_LABELS).map(([k, v]) => ({ value: k, label: v }))} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="displayOrder" label="Thứ tự hiển thị">
                <Input type="number" placeholder="1" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="defaultValue" label="Giá trị mặc định">
            <Input placeholder="Tùy chọn" />
          </Form.Item>
          <Form.Item name="isRequired" label="Bắt buộc" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsCreateOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={createMutation.isPending}>Tạo</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
