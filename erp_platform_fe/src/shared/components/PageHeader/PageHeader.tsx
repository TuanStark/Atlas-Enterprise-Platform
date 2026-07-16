import { type ReactNode } from 'react';
import { Typography, Space, Breadcrumb } from 'antd';
import { useNavigate } from 'react-router-dom';
import './PageHeader.css';

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
    <div className="page-header">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb
          className="page-header__breadcrumb"
          items={[
            { title: 'Trang chủ', onClick: () => navigate('/dashboard'), className: 'page-header__breadcrumb-link' },
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
      <div className="page-header__content">
        <div className="page-header__info">
          <Title level={4} style={{ marginBottom: subtitle ? 4 : 0 }}>
            {title}
          </Title>
          {subtitle && (
            <Text type="secondary">{subtitle}</Text>
          )}
        </div>
        {actions && (
          <Space className="page-header__actions">{actions}</Space>
        )}
      </div>
    </div>
  );
}
