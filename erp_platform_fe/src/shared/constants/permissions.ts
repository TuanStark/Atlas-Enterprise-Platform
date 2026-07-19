export const PERMISSIONS = {
  HRM: {
    EMPLOYEE: {
      READ: 'hrm.employee:read',
      CREATE: 'hrm.employee:create',
      UPDATE: 'hrm.employee:update',
      DELETE: 'hrm.employee:delete',
      EXPORT: 'hrm.employee:export',
    },
    LEAVE: {
      READ: 'hrm.leave:read',
      CREATE: 'hrm.leave:create',
      APPROVE: 'hrm.leave:approve',
      REJECT: 'hrm.leave:reject',
    },
    ATTENDANCE: {
      READ: 'hrm.attendance:read',
      CREATE: 'hrm.attendance:create',
      UPDATE: 'hrm.attendance:update',
    },
    SHIFT: {
      READ: 'hrm.shift:read',
      CREATE: 'hrm.shift:create',
      UPDATE: 'hrm.shift:update',
      DELETE: 'hrm.shift:delete',
    },
    PAYROLL: {
      READ: 'hrm.payroll:read',
      CREATE: 'hrm.payroll:create',
      EXPORT: 'hrm.payroll:export',
    },
    RECRUITMENT: {
      READ: 'hrm.recruitment:read',
      CREATE: 'hrm.recruitment:create',
      UPDATE: 'hrm.recruitment:update',
    },
    PERFORMANCE: {
      READ: 'hrm.performance:read',
      CREATE: 'hrm.performance:create',
      UPDATE: 'hrm.performance:update',
    },
  },

  ORGANIZATION: {
    STRUCTURE: {
      READ: 'org.structure:read',
      CREATE: 'org.structure:create',
      UPDATE: 'org.structure:update',
      DELETE: 'org.structure:delete',
    },
    POSITION: {
      READ: 'org.position:read',
      CREATE: 'org.position:create',
      UPDATE: 'org.position:update',
      DELETE: 'org.position:delete',
    },
  },

  ADMIN: {
    USER: {
      READ: 'admin.user:read',
      CREATE: 'admin.user:create',
      UPDATE: 'admin.user:update',
      DELETE: 'admin.user:delete',
    },
    ROLE: {
      READ: 'admin.role:read',
      CREATE: 'admin.role:create',
      UPDATE: 'admin.role:update',
      DELETE: 'admin.role:delete',
    },
    AUDIT: {
      READ: 'admin.audit:read',
    },
    SETTINGS: {
      READ: 'admin.settings:read',
      UPDATE: 'admin.settings:update',
    },
  },
} as const;

export function parsePermissionCode(code: string): { resource: string; action: string } {
  const [resource, action] = code.split(':');
  return { resource: resource || '', action: action || '' };
}
