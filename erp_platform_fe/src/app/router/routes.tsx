import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { AuthGuard } from './guards/AuthGuard';
import { PermissionGuard } from './guards/PermissionGuard';

// --- Layouts (eagerly loaded) ---
import { MainLayout } from '@layouts/MainLayout/MainLayout';
import { AuthLayout } from '@layouts/AuthLayout/AuthLayout';

// --- Pages (lazy loaded for code splitting) ---
const LoginPage = lazy(() => import('@pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('@pages/dashboard/DashboardPage'));
const EmployeeListPage = lazy(() => import('@pages/hrm/employee/EmployeeListPage'));
const EmployeeDetailPage = lazy(() => import('@pages/hrm/employee/EmployeeDetailPage'));
const EmployeeFormPage = lazy(() => import('@pages/hrm/employee/EmployeeFormPage'));
const LeaveRequestListPage = lazy(() => import('@pages/hrm/leave/LeaveRequestListPage'));
const LeaveRequestFormPage = lazy(() => import('@pages/hrm/leave/LeaveRequestFormPage'));
const AttendanceListPage = lazy(() => import('@pages/hrm/attendance/AttendanceListPage'));
const NotFoundPage = lazy(() => import('@pages/errors/NotFoundPage'));
const ForbiddenPage = lazy(() => import('@pages/errors/ForbiddenPage'));
const UnderConstructionPage = lazy(() => import('@pages/errors/UnderConstructionPage'));

const PayrollPage = lazy(() => import('@pages/hrm/payroll/PayrollPage'));
const RecruitmentPage = lazy(() => import('@pages/hrm/recruitment/RecruitmentPage'));
const LeaveCalendarPage = lazy(() => import('@pages/hrm/leave/LeaveCalendarPage'));
const PerformancePage = lazy(() => import('@pages/hrm/performance/PerformancePage'));
const SettingsPage = lazy(() => import('@pages/admin/settings/SettingsPage'));
const ProfilePage = lazy(() => import('@pages/profile/ProfilePage'));

const ShiftsPage = lazy(() => import('@pages/hrm/shifts/ShiftsPage'));
const TimesheetPage = lazy(() => import('@pages/hrm/timesheet/TimesheetPage'));
const OrganizationPage = lazy(() => import('@pages/organization/OrganizationPage'));

// --- Admin Pages — IAM & RBAC ---
const UserListPage = lazy(() => import('@pages/admin/users/UserListPage'));
const RoleListPage = lazy(() => import('@pages/admin/roles/RoleListPage'));
const RoleDetailPage = lazy(() => import('@pages/admin/roles/RoleDetailPage'));
const AuditLogPage = lazy(() => import('@pages/admin/audit/AuditLogPage'));

// --- Admin Pages — Shared Modules ---
const CalendarHolidayPage = lazy(() => import('@pages/admin/calendar/CalendarHolidayPage'));
const TagManagementPage = lazy(() => import('@pages/admin/tags/TagManagementPage'));
const WorkflowListPage = lazy(() => import('@pages/admin/workflows/WorkflowListPage'));
const CustomFieldPage = lazy(() => import('@pages/admin/custom-fields/CustomFieldPage'));
const NotificationCenterPage = lazy(() => import('@pages/admin/notifications/NotificationCenterPage'));
const FileManagementPage = lazy(() => import('@pages/admin/files/FileManagementPage'));

/**
 * Route Definitions — Organized by module, matching backend structure
 *
 * All authenticated routes are wrapped in AuthGuard.
 * Admin routes are additionally wrapped in PermissionGuard for RBAC enforcement.
 * Lazy loading ensures each module is a separate chunk.
 */
export const routes: RouteObject[] = [
  // --- Public Routes ---
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
    ],
  },

  // --- Authenticated Routes ---
  {
    element: (
      <AuthGuard>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      // Dashboard
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <DashboardPage /> },

      // HRM — Employee
      { path: '/hrm/employees', element: <EmployeeListPage /> },
      { path: '/hrm/employees/new', element: <EmployeeFormPage /> },
      { path: '/hrm/employees/:id', element: <EmployeeDetailPage /> },
      { path: '/hrm/employees/:id/edit', element: <EmployeeFormPage /> },

      // HRM — Leave
      { path: '/hrm/leave-requests', element: <LeaveRequestListPage /> },
      { path: '/hrm/leave-requests/new', element: <LeaveRequestFormPage /> },

      // HRM — Attendance
      { path: '/hrm/attendance', element: <AttendanceListPage /> },

      // HRM — Other Modules
      { path: '/hrm/payroll', element: <PayrollPage /> },
      { path: '/hrm/recruitment', element: <RecruitmentPage /> },
      { path: '/hrm/performance', element: <PerformancePage /> },
      { path: '/hrm/training', element: <UnderConstructionPage /> },
      { path: '/hrm/shifts', element: <ShiftsPage /> },
      { path: '/hrm/timesheet', element: <TimesheetPage /> },
      { path: '/hrm/leave-calendar', element: <LeaveCalendarPage /> },
      { path: '/hrm/payroll-runs', element: <UnderConstructionPage /> },
      { path: '/hrm/recruitment-board', element: <UnderConstructionPage /> },
      { path: '/hrm/performance-cycles', element: <UnderConstructionPage /> },
      { path: '/hrm/training-courses', element: <UnderConstructionPage /> },

      // Organization
      { path: '/organization', element: <OrganizationPage /> },

      // Notifications (accessible to all authenticated users)
      { path: '/notifications', element: <NotificationCenterPage /> },

      // Admin — IAM & RBAC (Protected by PermissionGuard)
      {
        path: '/admin/users',
        element: (
          <PermissionGuard resource="admin.user" action="read">
            <UserListPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/admin/roles',
        element: (
          <PermissionGuard resource="admin.role" action="read">
            <RoleListPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/admin/roles/:id',
        element: (
          <PermissionGuard resource="admin.role" action="read">
            <RoleDetailPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/admin/audit',
        element: (
          <PermissionGuard resource="admin.audit" action="read">
            <AuditLogPage />
          </PermissionGuard>
        ),
      },

      // Admin — Shared Platform Modules
      {
        path: '/admin/calendars',
        element: (
          <PermissionGuard resource="admin.settings" action="read">
            <CalendarHolidayPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/admin/tags',
        element: (
          <PermissionGuard resource="admin.settings" action="read">
            <TagManagementPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/admin/workflows',
        element: (
          <PermissionGuard resource="admin.settings" action="read">
            <WorkflowListPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/admin/custom-fields',
        element: (
          <PermissionGuard resource="admin.settings" action="read">
            <CustomFieldPage />
          </PermissionGuard>
        ),
      },
      {
        path: '/admin/files',
        element: (
          <PermissionGuard resource="admin.settings" action="read">
            <FileManagementPage />
          </PermissionGuard>
        ),
      },

      // Admin — Settings
      { path: '/admin/settings', element: <SettingsPage /> },

      // Profile
      { path: '/profile', element: <ProfilePage /> },
    ],
  },

  // --- Error Pages ---
  { path: '/403', element: <ForbiddenPage /> },
  { path: '*', element: <NotFoundPage /> },
];
