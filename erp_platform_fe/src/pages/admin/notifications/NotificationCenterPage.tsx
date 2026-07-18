import { Card, Table, Typography, Row, Col, Space, Tag, Button, Badge, Empty, Spin, Tooltip } from 'antd';
import type { TableColumnsType } from 'antd';
import { Bell, CheckCheck, Eye } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@shared/api';
import { message } from 'antd';

const { Title, Text } = Typography;

/** Types matching backend Notification + NotificationRecipient */
interface NotificationItem {
  id: string;
  tenantId: string;
  title?: string;
  message?: string;
  targetModule?: string;
  targetEntity?: string;
  targetRecordId?: string;
  createdAt?: string;
  scheduledAt?: string;
  isRead?: boolean;
  readAt?: string;
  recipientId?: string;
}

/** API matching NotificationController */
const notificationApi = {
  async list(): Promise<NotificationItem[]> {
    const { data } = await httpClient.get<NotificationItem[]>('/notifications');
    return data;
  },
  async markRead(recipientId: string): Promise<void> {
    await httpClient.patch(`/notifications/${recipientId}/read`);
  },
  async markAllRead(): Promise<void> {
    await httpClient.post('/notifications/read-all');
  },
};

export default function NotificationCenterPage() {
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.list,
  });

  const markReadMutation = useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => {
      message.success('Đã đánh dấu tất cả đã đọc!');
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const columns: TableColumnsType<NotificationItem> = [
    {
      title: 'Trạng thái',
      key: 'status',
      width: 80,
      render: (_, record) => (
        <Badge status={record.isRead ? 'default' : 'processing'} text="" />
      ),
    },
    {
      title: 'Thông báo',
      key: 'content',
      render: (_, record) => (
        <div>
          <Text strong={!record.isRead} style={{ fontSize: 13 }}>{record.title || 'Thông báo hệ thống'}</Text>
          {record.message && (
            <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 2 }}>
              {record.message.length > 100 ? `${record.message.slice(0, 100)}...` : record.message}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Module',
      key: 'module',
      width: 140,
      render: (_, record) => (
        record.targetModule ? <Tag style={{ fontSize: 11 }}>{record.targetModule}</Tag> : '—'
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (val: string) =>
        val ? <Text style={{ fontSize: 12 }}>{new Date(val).toLocaleString('vi-VN')}</Text> : '—',
      sorter: (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) =>
        !record.isRead && record.recipientId ? (
          <Tooltip title="Đánh dấu đã đọc">
            <Button
              type="text"
              size="small"
              icon={<Eye size={14} />}
              onClick={() => markReadMutation.mutate(record.recipientId!)}
            />
          </Tooltip>
        ) : null,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space direction="vertical" size={4}>
            <Title level={4} style={{ margin: 0 }}>
              <Space>
                <Bell size={20} />
                Trung tâm thông báo
                {unreadCount > 0 && (
                  <Badge count={unreadCount} style={{ marginLeft: 8 }} />
                )}
              </Space>
            </Title>
            <Text type="secondary">Xem và quản lý tất cả thông báo hệ thống của bạn.</Text>
          </Space>
        </Col>
        <Col>
          {unreadCount > 0 && (
            <Button
              icon={<CheckCheck size={14} />}
              onClick={() => markAllMutation.mutate()}
              loading={markAllMutation.isPending}
              style={{ borderRadius: 6 }}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </Col>
      </Row>

      <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        {isLoading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><Spin /></div>
        ) : (
          <Table<NotificationItem>
            columns={columns}
            dataSource={notifications}
            rowKey="id"
            pagination={{ pageSize: 15, showTotal: (total) => `Tổng ${total} thông báo` }}
            rowClassName={(record) => record.isRead ? '' : 'ant-table-row-selected'}
            locale={{ emptyText: <Empty description="Không có thông báo nào." /> }}
          />
        )}
      </Card>
    </div>
  );
}
