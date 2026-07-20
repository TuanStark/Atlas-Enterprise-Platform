import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Row, Col, Space, Tag, Tabs, Table, Checkbox, Spin, Empty, Descriptions, Button, Tooltip, Avatar } from 'antd';
import type { TableColumnsType } from 'antd';
import { ArrowLeft, Shield, Lock, Clock, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { useRole, usePermissions, useAssignPermissionToRole, useRemovePermissionFromRole } from '@features/rbac/hooks/useRbac';
import type { Permission, PrincipalRole } from '@features/rbac/types';
import { useMemo, useState } from 'react';
import { useCanAccessCode } from '@shared/hooks/usePermission';
import { PERMISSIONS } from '@shared/constants/permissions';
import { PERMISSION_REGISTRY, groupRegistryByModule } from '@features/rbac/config/permission-registry';
import type { PermissionRegistryEntry } from '@features/rbac/config/permission-registry';

const { Title, Text } = Typography;

// Module icons and colors for visual grouping
const MODULE_CONFIG: Record<string, { icon: string; color: string }> = {
  'Quản lý nhân sự': { icon: '👥', color: '#1890ff' },
  'Tổ chức': { icon: '🏢', color: '#722ed1' },
  'Quản trị hệ thống': { icon: '⚙️', color: '#fa8c16' },
};

interface ModuleGroup {
  moduleName: string;
  resources: ResourceRow[];
  totalPerms: number;
  assignedPerms: number;
}

interface ResourceRow {
  resourceName: string;
  permissions: {
    entry: PermissionRegistryEntry;
    permission: Permission | undefined;
    isAssigned: boolean;
  }[];
}

export default function RoleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: role, isLoading: roleLoading } = useRole(id);
  const { data: permissions = [], isLoading: permLoading } = usePermissions();
  const assignPermission = useAssignPermissionToRole();
  const removePermission = useRemovePermissionFromRole();
  const canEditPermissions = useCanAccessCode(PERMISSIONS.ADMIN.ROLE.UPDATE);

  // Track which modules are expanded
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  // Get currently assigned permission IDs
  const assignedPermissionIds = useMemo(() => {
    return new Set(role?.rolePermissions?.map((rp) => rp.permissionId) || []);
  }, [role]);

  // Build a permission lookup by code
  const permissionByCode = useMemo(() => {
    const map = new Map<string, Permission>();
    for (const p of permissions) {
      map.set(p.code, p);
    }
    return map;
  }, [permissions]);

  // Build the grouped permission matrix using the registry
  const moduleGroups: ModuleGroup[] = useMemo(() => {
    const registryByModule = groupRegistryByModule();
    const groups: ModuleGroup[] = [];

    for (const [moduleName, entries] of registryByModule) {
      // Group entries by resource within each module
      const resourceMap = new Map<string, PermissionRegistryEntry[]>();
      for (const entry of entries) {
        const existing = resourceMap.get(entry.resource) || [];
        existing.push(entry);
        resourceMap.set(entry.resource, existing);
      }

      let totalPerms = 0;
      let assignedPerms = 0;
      const resources: ResourceRow[] = [];

      for (const [resourceName, resourceEntries] of resourceMap) {
        const perms = resourceEntries.map((entry) => {
          const perm = permissionByCode.get(entry.code);
          const isAssigned = perm ? assignedPermissionIds.has(perm.id) : false;
          totalPerms++;
          if (isAssigned) assignedPerms++;
          return { entry, permission: perm, isAssigned };
        });
        resources.push({ resourceName, permissions: perms });
      }

      groups.push({ moduleName, resources, totalPerms, assignedPerms });
    }

    // Also add any permissions from DB that are NOT in the registry (core RBAC perms)
    const registryCodes = new Set(PERMISSION_REGISTRY.map((e) => e.code));
    const unregistered = permissions.filter((p) => !registryCodes.has(p.code));
    if (unregistered.length > 0) {
      const resourceMap = new Map<string, { entry: PermissionRegistryEntry; permission: Permission | undefined; isAssigned: boolean }[]>();
      let totalPerms = 0;
      let assignedPerms = 0;

      for (const perm of unregistered) {
        const [resourceCode, actionCode] = perm.code.split(':');
        const resourceName = resourceCode || perm.code;
        const existing = resourceMap.get(resourceName) || [];
        const isAssigned = assignedPermissionIds.has(perm.id);
        totalPerms++;
        if (isAssigned) assignedPerms++;
        existing.push({
          entry: {
            code: perm.code,
            module: 'Hệ thống (Core RBAC)',
            resource: resourceName,
            action: actionCode || '',
            description: perm.description || perm.code,
            affectedUI: [],
          },
          permission: perm,
          isAssigned,
        });
        resourceMap.set(resourceName, existing);
      }

      const resources: ResourceRow[] = [];
      for (const [resourceName, perms] of resourceMap) {
        resources.push({ resourceName, permissions: perms });
      }
      groups.push({ moduleName: 'Hệ thống (Core RBAC)', resources, totalPerms, assignedPerms });
    }

    return groups;
  }, [permissions, assignedPermissionIds, permissionByCode]);

  const handleTogglePermission = (permissionId: string, checked: boolean) => {
    if (!id) return;
    if (checked) {
      assignPermission.mutate({ roleId: id, permissionId });
    } else {
      removePermission.mutate({ roleId: id, permissionId });
    }
  };

  const toggleModule = (moduleName: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleName) ? prev.filter((m) => m !== moduleName) : [...prev, moduleName],
    );
  };

  const toggleAllModules = () => {
    if (expandedModules.length === moduleGroups.length) {
      setExpandedModules([]);
    } else {
      setExpandedModules(moduleGroups.map((g) => g.moduleName));
    }
  };

  const isLoading = roleLoading || permLoading;

  if (isLoading) {
    return <div style={{ padding: 60, textAlign: 'center' }}><Spin /></div>;
  }

  if (!role) {
    return <div style={{ padding: 60, textAlign: 'center' }}><Empty description="Không tìm thấy vai trò." /></div>;
  }

  const isDisabled = role.isSystem || !canEditPermissions;


  // Principal roles table columns
  const principalColumns: TableColumnsType<PrincipalRole> = [
    {
      title: 'Người dùng',
      key: 'user',
      render: (_, record) => {
        const name = record.principal?.displayName || record.principal?.user?.username || 'N/A';
        return (
          <Space>
            <Avatar size="small" style={{ backgroundColor: 'var(--color-primary)', fontSize: 10 }}>
              {name.slice(0, 2).toUpperCase()}
            </Avatar>
            <div>
              <Text strong style={{ fontSize: 13 }}>{name}</Text>
              {record.principal?.user?.email && (
                <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>{record.principal.user.email}</Text>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Phạm vi',
      key: 'scope',
      render: (_, record) => <Tag>{record.scope?.name || 'Global'}</Tag>,
    },
    {
      title: 'Ngày gán',
      key: 'assignedAt',
      render: (_, record) =>
        record.assignedAt ? new Date(record.assignedAt).toLocaleString('vi-VN') : '—',
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Header with back navigation */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Button type="text" icon={<ArrowLeft size={16} />} onClick={() => navigate('/admin/roles')} />
            <Space direction="vertical" size={4}>
              <Space size={8} align="center">
                <Title level={4} style={{ margin: 0 }}>{role.name || role.code}</Title>
                {role.isSystem && <Tag color="orange">System Role</Tag>}
              </Space>
              <Text type="secondary">{role.description || 'Không có mô tả'}</Text>
            </Space>
          </Space>
        </Col>
      </Row>

      {/* Role Overview */}
      <Card
        style={{ borderRadius: 12, marginBottom: 24, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
        styles={{ body: { padding: 20 } }}
      >
        <Descriptions column={{ xs: 1, sm: 2, lg: 4 }} size="small">
          <Descriptions.Item label="Mã vai trò">
            <Text code>{role.code}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Loại">
            {role.isSystem ? (
              <Space size={4}><Lock size={12} /> <Text>Hệ thống</Text></Space>
            ) : (
              <Space size={4}><Shield size={12} /> <Text>Tùy chỉnh</Text></Space>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Số quyền hạn">
            <Tag color="blue">{role.rolePermissions?.length || 0} quyền</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {role.createdAt ? (
              <Space size={4}>
                <Clock size={12} />
                <Text>{new Date(role.createdAt).toLocaleDateString('vi-VN')}</Text>
              </Space>
            ) : '—'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Tabs: Permissions & Users */}
      <Tabs
        defaultActiveKey="permissions"
        items={[
          {
            key: 'permissions',
            label: (
              <Space size={6}>
                <Shield size={14} />
                Ma trận quyền hạn
              </Space>
            ),
            children: (
              <Card
                style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
                styles={{ body: { padding: 0 } }}
              >
                {/* Toolbar */}
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Gán quyền cho vai trò bằng cách check/uncheck các ô bên dưới. Hover để xem chi tiết.
                  </Text>
                  <Button size="small" type="link" onClick={toggleAllModules}>
                    {expandedModules.length === moduleGroups.length ? 'Thu gọn tất cả' : 'Mở rộng tất cả'}
                  </Button>
                </div>

                {moduleGroups.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center' }}>
                    <Empty description="Chưa có quyền hạn nào trong hệ thống." />
                  </div>
                ) : (
                  <div>
                    {moduleGroups.map((group) => {
                      const config = MODULE_CONFIG[group.moduleName] || { icon: '📋', color: '#8c8c8c' };
                      const isExpanded = expandedModules.includes(group.moduleName);

                      return (
                        <div key={group.moduleName} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          {/* Module Header */}
                          <div
                            onClick={() => toggleModule(group.moduleName)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '14px 16px',
                              cursor: 'pointer',
                              background: isExpanded ? `${config.color}08` : 'transparent',
                              transition: 'background 0.2s',
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = `${config.color}10`; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = isExpanded ? `${config.color}08` : 'transparent'; }}
                          >
                            <Space size={10}>
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              <span style={{ fontSize: 16 }}>{config.icon}</span>
                              <Text strong style={{ fontSize: 14 }}>{group.moduleName}</Text>
                            </Space>
                            <Tag
                              color={group.assignedPerms === group.totalPerms && group.totalPerms > 0 ? 'green' : group.assignedPerms > 0 ? 'blue' : 'default'}
                              style={{ fontSize: 12, fontWeight: 500 }}
                            >
                              {group.assignedPerms}/{group.totalPerms} quyền
                            </Tag>
                          </div>

                          {/* Expanded Content — Permission Table */}
                          {isExpanded && (
                            <div style={{ overflowX: 'auto' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                  <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-fill-quaternary, #fafafa)' }}>
                                    <th style={{ textAlign: 'left', padding: '10px 16px 10px 48px', fontWeight: 600, fontSize: 12, color: 'var(--color-text-secondary)', width: '200px' }}>
                                      Chức năng
                                    </th>
                                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                                      Quyền
                                    </th>
                                    <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 600, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                                      Mô tả
                                    </th>
                                    <th style={{ textAlign: 'center', padding: '10px 16px', fontWeight: 600, fontSize: 12, color: 'var(--color-text-secondary)', width: '80px' }}>
                                      Gán
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {group.resources.map((resource) =>
                                    resource.permissions.map((permEntry, pIdx) => {
                                      const { entry, permission, isAssigned } = permEntry;
                                      const isFirstInResource = pIdx === 0;
                                      const tooltipContent = entry.affectedUI.length > 0 ? (
                                        <div>
                                          <div style={{ fontWeight: 600, marginBottom: 4 }}>{entry.description}</div>
                                          <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>UI bị ảnh hưởng:</div>
                                          {entry.affectedUI.map((ui, i) => (
                                            <div key={i} style={{ fontSize: 11 }}>• {ui}</div>
                                          ))}
                                          <div style={{ marginTop: 4, fontSize: 10, opacity: 0.6 }}>Code: {entry.code}</div>
                                        </div>
                                      ) : (
                                        <div>
                                          <div>{entry.description}</div>
                                          <div style={{ marginTop: 4, fontSize: 10, opacity: 0.6 }}>Code: {entry.code}</div>
                                        </div>
                                      );

                                      const isMutating = permission
                                        ? (assignPermission.isPending && assignPermission.variables?.permissionId === permission.id) ||
                                          (removePermission.isPending && removePermission.variables?.permissionId === permission.id)
                                        : false;

                                      return (
                                        <tr
                                          key={entry.code}
                                          style={{
                                            borderBottom: '1px solid var(--color-border-secondary, #f0f0f0)',
                                          }}
                                        >
                                          {/* Resource name — only show for the first permission in this resource */}
                                          <td
                                            style={{
                                              padding: '8px 16px 8px 48px',
                                              verticalAlign: 'top',
                                              fontWeight: isFirstInResource ? 500 : 400,
                                              fontSize: 13,
                                              color: isFirstInResource ? 'var(--color-text-primary)' : 'transparent',
                                              borderRight: '1px solid var(--color-border-secondary, #f0f0f0)',
                                            }}
                                          >
                                            {isFirstInResource ? resource.resourceName : ''}
                                          </td>
                                          {/* Action name */}
                                          <td style={{ padding: '8px 16px', fontSize: 13 }}>
                                            <Tag
                                              color={isAssigned ? 'blue' : 'default'}
                                              style={{ fontSize: 11, minWidth: 60, textAlign: 'center' }}
                                            >
                                              {entry.action}
                                            </Tag>
                                          </td>
                                          {/* Description */}
                                          <td style={{ padding: '8px 16px', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                                            {entry.description}
                                          </td>
                                          {/* Checkbox */}
                                          <td style={{ textAlign: 'center', padding: '8px 16px' }}>
                                            <Tooltip title={tooltipContent} overlayStyle={{ maxWidth: 320 }}>
                                              {isMutating ? (
                                                <Spin size="small" />
                                              ) : (
                                                <Checkbox
                                                  checked={isAssigned}
                                                  onChange={(e) => {
                                                    if (permission) {
                                                      handleTogglePermission(permission.id, e.target.checked);
                                                    }
                                                  }}
                                                  disabled={isDisabled || !permission}
                                                />
                                              )}
                                            </Tooltip>
                                          </td>
                                        </tr>
                                      );
                                    }),
                                  )}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            ),
          },
          {
            key: 'users',
            label: (
              <Space size={6}>
                <Users size={14} />
                Người dùng ({role.principalRoles?.length || 0})
              </Space>
            ),
            children: (
              <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                <Table<PrincipalRole>
                  columns={principalColumns}
                  dataSource={role.principalRoles || []}
                  rowKey={(r) => `${r.principalId}-${r.roleId}-${r.scopeId}`}
                  pagination={false}
                  locale={{ emptyText: <Empty description="Chưa có người dùng nào được gán vai trò này." /> }}
                />
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
