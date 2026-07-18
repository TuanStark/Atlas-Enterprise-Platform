import { Card, Table, Typography, Row, Col, Space, Tag, Badge, Empty, Spin, Descriptions, Drawer } from 'antd';
import type { TableColumnsType } from 'antd';
import { Workflow, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@shared/api';

const { Title, Text } = Typography;

/** Types matching backend WorkflowDefinition + WorkflowInstance */
interface WorkflowStep {
  id: string;
  name?: string;
  stepOrder?: number;
  assigneeType?: string;
}

interface WorkflowDefinition {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description?: string;
  entityType?: string;
  isActive?: boolean;
  createdAt?: string;
  steps?: WorkflowStep[];
}

/** API matching WorkflowController */
const workflowApi = {
  async listDefinitions(): Promise<WorkflowDefinition[]> {
    const { data } = await httpClient.get<WorkflowDefinition[]>('/workflows/definitions');
    return data;
  },
};

export default function WorkflowListPage() {
  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflow-definitions'],
    queryFn: workflowApi.listDefinitions,
  });

  const [selectedWf, setSelectedWf] = useState<WorkflowDefinition | null>(null);

  const columns: TableColumnsType<WorkflowDefinition> = [
    {
      title: 'Quy trình',
      key: 'name',
      render: (_, record) => (
        <Space>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: '#f0f5ff',
              color: '#1890ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Workflow size={18} />
          </div>
          <div>
            <Text strong style={{ fontSize: 13 }}>{record.name}</Text>
            <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>{record.code}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Áp dụng cho',
      dataIndex: 'entityType',
      key: 'entityType',
      width: 160,
      render: (val: string) => val ? <Tag>{val}</Tag> : '—',
    },
    {
      title: 'Số bước',
      key: 'steps',
      width: 100,
      render: (_, record) => (
        <Tag color="blue">{record.steps?.length || 0} bước</Tag>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <Badge
          status={record.isActive !== false ? 'success' : 'default'}
          text={record.isActive !== false ? 'Hoạt động' : 'Tắt'}
        />
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (val: string) => val || <Text type="secondary">—</Text>,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space direction="vertical" size={4}>
            <Title level={4} style={{ margin: 0 }}>
              <Space><Workflow size={20} /> Quản lý quy trình duyệt</Space>
            </Title>
            <Text type="secondary">Thiết lập và theo dõi các quy trình phê duyệt (Workflow) trong hệ thống.</Text>
          </Space>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        {isLoading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><Spin /></div>
        ) : (
          <Table<WorkflowDefinition>
            columns={columns}
            dataSource={workflows}
            rowKey="id"
            pagination={{ pageSize: 10, showTotal: (total) => `Tổng ${total} quy trình` }}
            onRow={(record) => ({
              onClick: () => setSelectedWf(record),
              style: { cursor: 'pointer' },
            })}
            locale={{ emptyText: <Empty description="Chưa có quy trình nào." /> }}
          />
        )}
      </Card>

      {/* Workflow Detail Drawer */}
      <Drawer
        title={selectedWf?.name || 'Chi tiết quy trình'}
        open={Boolean(selectedWf)}
        onClose={() => setSelectedWf(null)}
        width={480}
      >
        {selectedWf && (
          <Space direction="vertical" size={20} style={{ width: '100%' }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Mã">{selectedWf.code}</Descriptions.Item>
              <Descriptions.Item label="Entity">{selectedWf.entityType || '—'}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Badge status={selectedWf.isActive !== false ? 'success' : 'default'}
                  text={selectedWf.isActive !== false ? 'Hoạt động' : 'Tắt'} />
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả">{selectedWf.description || '—'}</Descriptions.Item>
            </Descriptions>

            <div>
              <Title level={5} style={{ marginBottom: 12 }}>Các bước duyệt</Title>
              {selectedWf.steps && selectedWf.steps.length > 0 ? (
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  {selectedWf.steps
                    .sort((a, b) => (a.stepOrder || 0) - (b.stepOrder || 0))
                    .map((step, idx) => (
                      <Card
                        key={step.id}
                        size="small"
                        style={{ borderRadius: 8, borderLeft: '3px solid #1890ff' }}
                      >
                        <Space>
                          <Tag color="blue" style={{ fontSize: 11, margin: 0 }}>Bước {idx + 1}</Tag>
                          <Text strong style={{ fontSize: 12 }}>{step.name || `Step ${idx + 1}`}</Text>
                          {step.assigneeType && (
                            <Text type="secondary" style={{ fontSize: 11 }}>({step.assigneeType})</Text>
                          )}
                        </Space>
                      </Card>
                    ))}
                </Space>
              ) : (
                <Empty description="Chưa có bước duyệt nào." />
              )}
            </div>
          </Space>
        )}
      </Drawer>
    </div>
  );
}
