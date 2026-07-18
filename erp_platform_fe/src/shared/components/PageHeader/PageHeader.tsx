import { type ReactNode } from 'react';
import { Typography, Space, Breadcrumb } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

/**
 * PageHeader — Reusable page header with title, subtitle, breadcrumb, and actions
 *
 * Usage:
 *   <PageHeader
 *     title="Danh sách nhân viên"
 *     subtitle="Quản lý hồ sơ nhân viên"
 *     breadcrumbs={[{ label: 'HRM' }, { label: 'Nhân viên' }]}
 *     actions={<Button type="primary">Thêm mới</Button>}
 *   />
 */
interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb
          className="mb-3"
          items={[
            { title: 'Trang chủ', onClick: () => navigate('/dashboard'), className: 'cursor-pointer' },
            ...breadcrumbs.map((item) => ({
              title: item.path ? (
                <a onClick={() => navigate(item.path!)}>{item.label}</a>
              ) : (
                item.label
              ),
            })),
          ]}
        />
      )}
      <div className="flex items-start justify-between gap-4 max-[640px]:flex-col max-[640px]:items-stretch">
        <div className="flex-1 min-w-0">
          <Title level={4} style={{ marginBottom: subtitle ? 4 : 0 }}>
            {title}
          </Title>
          {subtitle && (
            <Text type="secondary">{subtitle}</Text>
          )}
        </div>
        {actions && (
          <Space className="shrink-0">{actions}</Space>
        )}
      </div>
    </div>
  );
}
