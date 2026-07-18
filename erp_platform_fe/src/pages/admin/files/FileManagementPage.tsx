import { useState } from 'react';
import { Card, Table, Typography, Row, Col, Space, Tag, Empty, Spin, Tooltip, Button, Modal, Image } from 'antd';
import type { TableColumnsType } from 'antd';
import { FileText, Trash2, Plus, UploadCloud } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@shared/api';
import { message } from 'antd';
import { FileUpload } from '@shared/components/FileUpload/FileUpload';

const { Title, Text } = Typography;

/** Types matching backend File entity */
interface FileItem {
  id: string;
  tenantId: string;
  code?: string;
  fileName?: string;
  mimeType?: string;
  extension?: string;
  visibility?: string;
  currentVersion?: number;
  size?: number;
  checksum?: string;
  createdAt?: string;
}

/** API matching FileController */
const fileApi = {
  async list(): Promise<FileItem[]> {
    const { data } = await httpClient.get<FileItem[]>('/files');
    return data;
  },
  async remove(id: string): Promise<void> {
    await httpClient.delete(`/files/${id}`);
  },
};

function formatFileSize(bytes?: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImage(file: FileItem): boolean {
  if (file.mimeType?.startsWith('image/')) return true;
  const ext = file.extension?.toLowerCase() || '';
  return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext);
}

const extensionColors: Record<string, string> = {
  pdf: 'red',
  docx: 'blue',
  doc: 'blue',
  xlsx: 'green',
  xls: 'green',
  png: 'orange',
  jpg: 'orange',
  jpeg: 'orange',
  csv: 'cyan',
  zip: 'purple',
};

export default function FileManagementPage() {
  const queryClient = useQueryClient();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['files'],
    queryFn: fileApi.list,
  });

  const deleteMutation = useMutation({
    mutationFn: fileApi.remove,
    onSuccess: () => {
      message.success('Đã xóa tệp!');
      void queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: () => message.error('Xóa tệp thất bại'),
  });

  const handleDelete = (id: string, name?: string) => {
    Modal.confirm({
      title: 'Xóa tệp',
      content: `Bạn có chắc muốn xóa "${name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const columns: TableColumnsType<FileItem> = [
    {
      title: 'Tên tệp',
      key: 'fileName',
      render: (_, record) => (
        <Space size={12}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 6,
              background: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8c8c8c',
              overflow: 'hidden',
              border: '1px solid rgba(0, 0, 0, 0.05)',
            }}
          >
            {isImage(record) ? (
              <Image
                src={`/api/v1/files/${record.id}/view`}
                alt={record.fileName}
                width={36}
                height={36}
                style={{ objectFit: 'cover' }}
                preview={{
                  maskClassName: 'rounded-lg text-[10px]'
                }}
              />
            ) : (
              <FileText size={16} />
            )}
          </div>
          <div>
            <a
              href={`/api/v1/files/${record.id}/view`}
              target="_blank"
              rel="noreferrer"
              style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-primary)' }}
            >
              {record.fileName || 'Unnamed'}
            </a>
            {record.code && <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>{record.code}</Text>}
          </div>
        </Space>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'extension',
      key: 'extension',
      width: 100,
      render: (val: string) =>
        val ? (
          <Tag color={extensionColors[val.toLowerCase()] || 'default'} style={{ fontSize: 11, textTransform: 'uppercase' }}>
            {val}
          </Tag>
        ) : '—',
    },
    {
      title: 'MIME Type',
      dataIndex: 'mimeType',
      key: 'mimeType',
      width: 180,
      ellipsis: true,
      render: (val: string) => <Text code style={{ fontSize: 11 }}>{val || '—'}</Text>,
    },
    {
      title: 'Kích thước',
      dataIndex: 'size',
      key: 'size',
      width: 100,
      render: (val: number) => <Text style={{ fontSize: 12 }}>{formatFileSize(val)}</Text>,
      sorter: (a, b) => (a.size || 0) - (b.size || 0),
    },
    {
      title: 'Phiên bản',
      dataIndex: 'currentVersion',
      key: 'version',
      width: 90,
      render: (val: number) => val ? <Tag style={{ fontSize: 11 }}>v{val}</Tag> : '—',
    },
    {
      title: 'Hiển thị',
      dataIndex: 'visibility',
      key: 'visibility',
      width: 100,
      render: (val: string) => {
        if (val === 'public') return <Tag color="green">Public</Tag>;
        if (val === 'private') return <Tag color="red">Private</Tag>;
        return <Tag>{val || '—'}</Tag>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (val: string) =>
        val ? new Date(val).toLocaleDateString('vi-VN') : '—',
      sorter: (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Tooltip title="Xóa tệp">
          <Button
            type="text"
            danger
            size="small"
            icon={<Trash2 size={14} />}
            onClick={() => handleDelete(record.id, record.fileName)}
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
              <Space><FileText size={20} /> Quản lý tệp & tài liệu</Space>
            </Title>
            <Text type="secondary">Xem, quản lý và tải lên tệp tin tài liệu hoặc hình ảnh vào hệ thống.</Text>
          </Space>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => setIsUploadModalOpen(true)}
            style={{ borderRadius: 6, display: 'flex', alignItems: 'center' }}
          >
            Tải tệp lên
          </Button>
        </Col>
      </Row>

      <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        {isLoading ? (
          <div style={{ padding: 60, textAlign: 'center' }}><Spin /></div>
        ) : (
          <Table<FileItem>
            columns={columns}
            dataSource={files}
            rowKey="id"
            pagination={{ pageSize: 15, showSizeChanger: true, showTotal: (total) => `Tổng ${total} tệp` }}
            locale={{ emptyText: <Empty description="Chưa có tệp nào." /> }}
          />
        )}
      </Card>

      {/* Upload File Modal */}
      <Modal
        title={
          <Space>
            <UploadCloud size={18} style={{ color: 'var(--color-primary)' }} />
            <span>Tải tệp lên hệ thống</span>
          </Space>
        }
        open={isUploadModalOpen}
        onCancel={() => setIsUploadModalOpen(false)}
        footer={null}
        destroyOnClose
        style={{ borderRadius: 12 }}
      >
        <div style={{ padding: '16px 0' }}>
          <FileUpload
            onUploadSuccess={() => {
              void queryClient.invalidateQueries({ queryKey: ['files'] });
              setTimeout(() => setIsUploadModalOpen(false), 1500);
            }}
          />
        </div>
      </Modal>
    </div>
  );
}
