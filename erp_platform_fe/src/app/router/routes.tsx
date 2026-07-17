import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { AuthGuard } from './guards/AuthGuard';

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

const ShiftsPage = lazy(() => import('@pages/hrm/shifts/ShiftsPage'));
const TimesheetPage = lazy(() => import('@pages/hrm/timesheet/TimesheetPage'));

/**
 * Route Definitions — Organized by module, matching backend structure
 *
 * All authenticated routes are wrapped in AuthGuard.
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

      // HRM — Missing Pages (Mapped to Under Construction)
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
      { path: '/organization', element: <UnderConstructionPage /> },

      // Admin Management
      { path: '/admin/users', element: <UnderConstructionPage /> },
      { path: '/admin/roles', element: <UnderConstructionPage /> },
      { path: '/admin/workflows', element: <UnderConstructionPage /> },
      { path: '/admin/settings', element: <SettingsPage /> },
    ],
  },

  // --- Error Pages ---
  { path: '/403', element: <ForbiddenPage /> },
  { path: '*', element: <NotFoundPage /> },
];
