import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

/**
 * AuthLayout — Layout for unauthenticated pages (login, forgot password)
 *
 * Clean, centered card design with gradient background.
 */
export function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-layout__bg-pattern" />
      <div className="auth-layout__container">
        <div className="auth-layout__header">
          <div className="auth-layout__logo">
            <div className="auth-layout__logo-icon">A</div>
            <h1 className="auth-layout__logo-text">Atlas Enterprise</h1>
          </div>
          <p className="auth-layout__subtitle">
            Nền tảng quản lý doanh nghiệp thế hệ mới
          </p>
        </div>
        <div className="auth-layout__card">
          <Outlet />
        </div>
        <p className="auth-layout__footer">
          © {new Date().getFullYear()} Atlas Enterprise Platform. All rights reserved.
        </p>
      </div>
    </div>
  );
}
