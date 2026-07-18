import { useState } from 'react';
import { Card, Table, Typography, Row, Col, Space, Tag, Badge, Drawer, Descriptions, Timeline, Empty } from 'antd';
import type { TableColumnsType } from 'antd';
import { History, ArrowRight } from 'lucide-react';
import { FilterBar } from '@shared/components/FilterBar';
import type { FilterBarField } from '@shared/components/FilterBar';
import { useAuditLogs } from '@features/rbac/hooks/useRbac';
import type { AuditLog, AuditDetail } from '@features/rbac/types';

const { Title, Text } = Typography;

const actionColors: Record<string, string> = {
  CREATE: 'green',
  UPDATE: 'blue',
  DELETE: 'red',
  LOGIN: 'cyan',
  LOGOUT: 'default',
  EXPORT: 'purple',
};

const actionLabels: Record<string, string> = {
  CREATE: 'Tạo mới',
  UPDATE: 'Cập nhật',
  DELETE: 'Xóa',
  LOGIN: 'Đăng nhập',
  LOGOUT: 'Đăng xuất',
  EXPORT: 'Xuất dữ liệu',
};

export default function AuditLogPage() {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const { data: auditLogs = [], isLoading } = useAuditLogs({
    module: filters.module || undefined,
    action: filters.action || undefined,
    limit: 50,
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filterFields: FilterBarField[] = [
    {
      key: 'search',
      type: 'text',
      placeholder: 'Tìm kiếm theo người thực hiện, module...',
      span: 8,
    },
    {
      key: 'module',
      type: 'select',
      placeholder: 'Module',
      options: [
        { label: 'Tất cả module', value: '' },
        { label: 'Nhân viên (HRM)', value: 'hrm' },
        { label: 'Quản trị (Admin)', value: 'admin' },
        { label: 'Tổ chức (Org)', value: 'organization' },
        { label: 'Tài sản (Asset)', value: 'asset' },
      ],
      span: 6,
    },
    {
      key: 'action',
      type: 'select',
      placeholder: 'Hành động',
      options: [
        { label: 'Tất cả', value: '' },
        { label: 'Tạo mới', value: 'CREATE' },
        { label: 'Cập nhật', value: 'UPDATE' },
        { label: 'Xóa', value: 'DELETE' },
        { label: 'Đăng nhập', value: 'LOGIN' },
      ],
      span: 5,
    },
  ];

  // Client-side search filtering
  const filteredLogs = auditLogs.filter((log) => {
    const search = filters.search?.toLowerCase() || '';
    if (!search) return true;
    return (
      log.actorPrincipal?.displayName?.toLowerCase().includes(search) ||
      log.actorPrincipal?.user?.username.toLowerCase().includes(search) ||
      log.targetModule?.toLowerCase().includes(search) ||
      log.targetEntity?.toLowerCase().includes(search)
    );
  });

  const columns: TableColumnsType<AuditLog> = [
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (val: string) =>
        val ? (
          <Text style={{ fontSize: 12 }}>{new Date(val).toLocaleString('vi-VN')}</Text>
        ) : '—',
      sorter: (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Người thực hiện',
      key: 'actor',
      width: 180,
      render: (_, record) => {
        const name = record.actorPrincipal?.displayName || record.actorPrincipal?.user?.username || 'System';
        return (
          <Space size={6}>
            <Badge status="processing" />
            <div>
              <Text strong style={{ fontSize: 12 }}>{name}</Text>
              {record.ipAddress && (
                <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>{record.ipAddress}</Text>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_, record) => {
        const action = record.action || 'UNKNOWN';
        return (
          <Tag color={actionColors[action] || 'default'} style={{ fontSize: 11 }}>
            {actionLabels[action] || action}
          </Tag>
        );
      },
    },
    {
      title: 'Module / Entity',
      key: 'target',
      render: (_, record) => (
        <Space size={4}>
          {record.targetModule && <Text code style={{ fontSize: 11 }}>{record.targetModule}</Text>}
          {record.targetEntity && (
            <>
              <ArrowRight size={10} style={{ color: 'var(--color-text-tertiary)' }} />
              <Text code style={{ fontSize: 11 }}>{record.targetEntity}</Text>
            </>
          )}
        </Space>
      ),
    },
    {
      title: 'Số thay đổi',
      key: 'changes',
      width: 100,
      render: (_, record) => {
        const count = record.auditDetails?.length || 0;
        return count > 0 ? (
          <Tag color="blue" style={{ fontSize: 11 }}>{count} trường</Tag>
        ) : (
          <Text type="secondary" style={{ fontSize: 11 }}>—</Text>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space direction="vertical" size={4}>
            <Title level={4} style={{ margin: 0 }}>
              <Space>
                <History size={20} />
                Nhật ký kiểm toán
              </Space>
            </Title>
            <Text type="secondary">Theo dõi toàn bộ hoạt động thay đổi dữ liệu trong hệ thống.</Text>
          </Space>
        </Col>
      </Row>

      <FilterBar values={filters} onChange={handleFilterChange} fields={filterFields} />

      <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        <Table<AuditLog>
          columns={columns}
          dataSource={filteredLogs}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (total) => `Tổng cộng ${total} bản ghi` }}
          onRow={(record) => ({
            onClick: () => setSelectedLog(record),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>

      {/* Detail Drawer */}
      <Drawer
        title="Chi tiết nhật ký kiểm toán"
        open={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        width={520}
      >
        {selectedLog && (
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Người thực hiện">
                <Text strong>
                  {selectedLog.actorPrincipal?.displayName || selectedLog.actorPrincipal?.user?.username || 'System'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Hành động">
                <Tag color={actionColors[selectedLog.action || ''] || 'default'}>
                  {actionLabels[selectedLog.action || ''] || selectedLog.action}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Module">
                <Text code>{selectedLog.targetModule}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Entity">
                <Text code>{selectedLog.targetEntity}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Record ID">
                <Text copyable style={{ fontSize: 11 }}>{selectedLog.targetRecordId}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian">
                {selectedLog.createdAt ? new Date(selectedLog.createdAt).toLocaleString('vi-VN') : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ IP">{selectedLog.ipAddress || '—'}</Descriptions.Item>
              <Descriptions.Item label="Request ID">
                <Text copyable style={{ fontSize: 10 }}>{selectedLog.requestId || '—'}</Text>
              </Descriptions.Item>
            </Descriptions>

            {/* Changes Timeline (diff display) */}
            {selectedLog.auditDetails && selectedLog.auditDetails.length > 0 ? (
              <div>
                <Title level={5} style={{ marginBottom: 12 }}>Chi tiết thay đổi</Title>
                <Timeline
                  items={selectedLog.auditDetails.map((detail: AuditDetail) => ({
                    key: detail.id,
                    color: detail.oldValue ? 'blue' : 'green',
                    children: (
                      <div style={{ marginBottom: 8 }}>
                        <Text strong style={{ fontSize: 12 }}>{detail.fieldName}</Text>
                        <div
                          style={{
                            background: 'var(--color-fill-quaternary, #fafafa)',
                            borderRadius: 6,
                            padding: '8px 12px',
                            marginTop: 4,
                            fontSize: 12,
                          }}
                        >
                          {detail.oldValue && (
                            <div style={{ color: '#f5222d', marginBottom: 4 }}>
                              <Text delete type="secondary" style={{ fontSize: 12 }}>- {detail.oldValue}</Text>
                            </div>
                          )}
                          {detail.newValue && (
                            <div style={{ color: '#52c41a' }}>
                              <Text style={{ fontSize: 12, color: '#52c41a' }}>+ {detail.newValue}</Text>
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                  }))}
                />
              </div>
            ) : (
              <Empty description="Không có chi tiết thay đổi." />
            )}
          </Space>
        )}
      </Drawer>
    </div>
  );
}
