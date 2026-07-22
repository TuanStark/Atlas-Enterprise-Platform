import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, Card, Tag, Space, Typography, Input, Row, Col, Button } from 'antd';
import { ShieldAlert, Search, RefreshCw } from 'lucide-react';
import { httpClient } from '@shared/api/httpClient';

const { Title, Text } = Typography;

interface SystemAuditLog {
  id: string;
  tenantId?: string;
  tenantCode?: string;
  principalId?: string;
  username?: string;
  action: string;
  resource: string;
  ipAddress?: string;
  createdAt: string;
}

export default function SystemAuditLogPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: logs = [], isLoading, refetch } = useQuery<SystemAuditLog[]>({
    queryKey: ['system-audit-logs'],
    queryFn: async () => {
      const res = await httpClient.get<SystemAuditLog[]>('/audit-logs');
      return Array.isArray(res.data) ? res.data : (res.data as any)?.items || [];
    },
  });

  const filteredLogs = logs.filter(
    (l) =>
      l.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.resource?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.username?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date?: string) => (date ? new Date(date).toLocaleString('vi-VN') : '—'),
    },
    {
      title: 'Tài khoản',
      dataIndex: 'username',
      key: 'username',
      render: (username?: string) => <Text strong>{username || 'Hệ thống'}</Text>,
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => <Tag color="blue">{action}</Tag>,
    },
    {
      title: 'Tài nguyên',
      dataIndex: 'resource',
      key: 'resource',
      render: (resource: string) => <Tag color="purple">{resource}</Tag>,
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      render: (ip?: string) => ip || '127.0.0.1',
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space direction="vertical" size={4}>
            <Space align="center">
              <Title level={4} style={{ margin: 0 }}>
                Nhật ký Hệ thống Toàn sàn (Platform Audit Trail)
              </Title>
              <Tag color="red" icon={<ShieldAlert size={12} style={{ marginRight: 4 }} />}>
                System Super Admin Only
              </Tag>
            </Space>
            <Text type="secondary">
              Theo dõi nhật ký truy cập và thao tác an ninh hệ thống xuyên suốt tất cả các tenant trên toàn sàn SaaS.
            </Text>
          </Space>
        </Col>
        <Col>
          <Button icon={<RefreshCw size={14} />} onClick={() => refetch()}>
            Làm mới
          </Button>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Input
          prefix={<Search size={16} style={{ color: '#bfbfbf' }} />}
          placeholder="Tìm kiếm hành động, tài nguyên hoặc tài khoản..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          style={{ maxWidth: 400 }}
        />
      </Card>

      <Card bodyStyle={{ padding: 0 }}>
        <Table
          dataSource={filteredLogs}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 15 }}
        />
      </Card>
    </div>
  );
}
