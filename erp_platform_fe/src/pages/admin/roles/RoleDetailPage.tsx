import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Row, Col, Space, Tag, Tabs, Table, Checkbox, Spin, Empty, Descriptions, Button, Tooltip, Avatar } from 'antd';
import type { TableColumnsType } from 'antd';
import { ArrowLeft, Shield, Lock, Clock } from 'lucide-react';
import { useRole, usePermissions, useAssignPermissionToRole } from '@features/rbac/hooks/useRbac';
import type { Permission, PrincipalRole } from '@features/rbac/types';
import { useMemo } from 'react';
import { useCanAccessCode } from '@shared/hooks/usePermission';
import { PERMISSIONS } from '@shared/constants/permissions';
import { findRegistryEntry } from '@features/rbac/config/permission-registry';

const { Title, Text } = Typography;

export default function RoleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: role, isLoading: roleLoading } = useRole(id);
  const { data: permissions = [], isLoading: permLoading } = usePermissions();
  const assignPermission = useAssignPermissionToRole();
  const canEditPermissions = useCanAccessCode(PERMISSIONS.ADMIN.ROLE.UPDATE);

  // Group permissions by resource for the matrix display
  const permissionMatrix = useMemo(() => {
    const resourceMap = new Map<string, Map<string, Permission>>();
    const allActions = new Set<string>();

    for (const perm of permissions) {
      const [resourceCode, actionCode] = perm.code.split(':');
      if (!resourceCode || !actionCode) continue;

      if (!resourceMap.has(resourceCode)) {
        resourceMap.set(resourceCode, new Map());
      }
      resourceMap.get(resourceCode)!.set(actionCode, perm);
      allActions.add(actionCode);
    }

    return {
      resources: Array.from(resourceMap.entries()).map(([code, actions]) => ({
        code,
        actions: Object.fromEntries(actions),
      })),
      actionColumns: Array.from(allActions).sort(),
    };
  }, [permissions]);

  // Get currently assigned permission IDs
  const assignedPermissionIds = useMemo(() => {
    return new Set(role?.rolePermissions?.map((rp) => rp.permissionId) || []);
  }, [role]);

  const handleTogglePermission = (permissionId: string, checked: boolean) => {
    if (!id || !checked) return; // Currently only support assign, not unassign via this API
    assignPermission.mutate({ roleId: id, permissionId });
  };

  const isLoading = roleLoading || permLoading;

  if (isLoading) {
    return <div style={{ padding: 60, textAlign: 'center' }}><Spin /></div>;
  }

  if (!role) {
    return <div style={{ padding: 60, textAlign: 'center' }}><Empty description="Không tìm thấy vai trò." /></div>;
  }

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
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                        <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, fontSize: 13, color: 'var(--color-text-secondary)' }}>
                          Resource
                        </th>
                        {permissionMatrix.actionColumns.map((action) => (
                          <th
                            key={action}
                            style={{
                              textAlign: 'center',
                              padding: '12px 16px',
                              fontWeight: 600,
                              fontSize: 12,
                              color: 'var(--color-text-secondary)',
                              textTransform: 'capitalize',
                            }}
                          >
                            {action}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {permissionMatrix.resources.map((resource, idx) => (
                        <tr
                          key={resource.code}
                          style={{
                            borderBottom: '1px solid var(--color-border-secondary)',
                            backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--color-fill-quaternary, #fafafa)',
                          }}
                        >
                          <td style={{ padding: '10px 16px' }}>
                            <Text code style={{ fontSize: 12 }}>{resource.code}</Text>
                          </td>
                          {permissionMatrix.actionColumns.map((action) => {
                            const perm = resource.actions[action];
                            if (!perm) {
                              return (
                                <td key={action} style={{ textAlign: 'center', padding: '10px 16px' }}>
                                  <Text type="secondary" style={{ fontSize: 11 }}>—</Text>
                                </td>
                              );
                            }
                            const isAssigned = assignedPermissionIds.has(perm.id);
                            const registryInfo = findRegistryEntry(perm.code);
                            const tooltipContent = registryInfo ? (
                              <div>
                                <div style={{ fontWeight: 600, marginBottom: 4 }}>{registryInfo.description}</div>
                                {registryInfo.affectedUI.length > 0 && (
                                  <div>
                                    <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>UI bị ảnh hưởng:</div>
                                    {registryInfo.affectedUI.map((ui, i) => (
                                      <div key={i} style={{ fontSize: 11 }}>• {ui}</div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : perm.description || perm.code;

                            return (
                              <td key={action} style={{ textAlign: 'center', padding: '10px 16px' }}>
                                <Tooltip title={tooltipContent} overlayStyle={{ maxWidth: 320 }}>
                                  <Checkbox
                                    checked={isAssigned}
                                    onChange={(e) => handleTogglePermission(perm.id, e.target.checked)}
                                    disabled={role.isSystem || !canEditPermissions}
                                  />
                                </Tooltip>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {permissionMatrix.resources.length === 0 && (
                  <div style={{ padding: 40, textAlign: 'center' }}>
                    <Empty description="Chưa có quyền hạn nào trong hệ thống." />
                  </div>
                )}
              </Card>
            ),
          },
          {
            key: 'users',
            label: (
              <Space size={6}>
                <Shield size={14} />
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
