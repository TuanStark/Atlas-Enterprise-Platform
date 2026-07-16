/**
 * Application-wide constants
 */

/** API versioned base path */
export const API_VERSION = 'v1';

/** Default pagination limit */
export const DEFAULT_PAGE_SIZE = 20;

/** Supported page sizes for tables */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

/** Date format pattern for display */
export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm';
export const TIME_FORMAT = 'HH:mm';

/** Local storage keys */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'atlas_access_token',
  REFRESH_TOKEN: 'atlas_refresh_token',
  AUTH_STATE: 'atlas-auth-storage',
  THEME_MODE: 'atlas_theme_mode',
  SIDEBAR_COLLAPSED: 'atlas_sidebar_collapsed',
  LOCALE: 'atlas_locale',
} as const;

/** Route paths — centralized to avoid hardcoded strings */
export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',

  // HRM
  EMPLOYEES: '/hrm/employees',
  EMPLOYEE_NEW: '/hrm/employees/new',
  EMPLOYEE_DETAIL: (id: string) => `/hrm/employees/${id}`,
  EMPLOYEE_EDIT: (id: string) => `/hrm/employees/${id}/edit`,

  LEAVE_REQUESTS: '/hrm/leave-requests',
  LEAVE_REQUEST_NEW: '/hrm/leave-requests/new',

  ATTENDANCE: '/hrm/attendance',
  SHIFTS: '/hrm/shifts',
  TIMESHEET: '/hrm/timesheet',

  PAYROLL: '/hrm/payroll',
  RECRUITMENT: '/hrm/recruitment',
  PERFORMANCE: '/hrm/performance',
  TRAINING: '/hrm/training',

  // Organization
  ORG_CHART: '/organization',

  // Admin
  ADMIN_USERS: '/admin/users',
  ADMIN_ROLES: '/admin/roles',
  ADMIN_WORKFLOWS: '/admin/workflows',
  ADMIN_SETTINGS: '/admin/settings',

  // Errors
  NOT_FOUND: '/404',
  FORBIDDEN: '/403',
} as const;

/** Backend resource types — maps to PBAC resource identifiers */
export const RESOURCES = {
  EMPLOYEE: 'hrm.employee',
  LEAVE_REQUEST: 'hrm.leave_request',
  ATTENDANCE: 'hrm.attendance',
  SHIFT: 'hrm.shift',
  PAYROLL: 'hrm.payroll',
  RECRUITMENT: 'hrm.job_requisition',
  PERFORMANCE: 'hrm.performance_review',
  TRAINING: 'hrm.training_course',
  ORGANIZATION: 'core.organization',
  USER: 'core.user',
  ROLE: 'core.role',
  WORKFLOW: 'core.workflow',
} as const;

/** PBAC Actions */
export const ACTIONS = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'approve',
  REJECT: 'reject',
  EXPORT: 'export',
} as const;
