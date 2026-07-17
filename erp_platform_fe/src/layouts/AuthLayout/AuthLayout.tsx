import { Outlet } from 'react-router-dom';
import { ShieldCheck, Lock, Shield, Server } from 'lucide-react';
import './AuthLayout.css';

/**
 * AuthLayout — Layout for unauthenticated pages (login, forgot password)
 * Split-screen layout: left branding/illustration & right form card.
 */
export function AuthLayout() {
  return (
    <div className="auth-layout">
      {/* Left Illustrative Pane */}
      <div className="auth-layout__left">
        <div className="auth-layout__left-content">
          {/* Logo & Brand */}
          <div className="auth-layout__logo">
            <div className="auth-layout__logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6ZM12 18C9.33 18 4.67 19.33 4.67 22C6.24 23.55 8.5 24.5 11 24.5C13.5 24.5 15.76 23.55 17.33 22C17.33 19.33 12.67 18 12 18Z" fill="currentColor"/>
                <circle cx="6" cy="9" r="2" fill="currentColor"/>
                <circle cx="18" cy="9" r="2" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <h1 className="auth-layout__logo-text">HRIMS</h1>
              <p className="auth-layout__logo-subtext">Human Resource Information System</p>
            </div>
          </div>

          {/* Heading */}
          <h2 className="auth-layout__title">Welcome back, Spencer</h2>
          <p className="auth-layout__description">
            Sign in to manage your workforce, payroll, attendance, recruitment, reports, and settings.
          </p>

          {/* Floating Widget Illustration Container */}
          <div className="auth-layout__illustration">
            {/* Widget 1: Employees */}
            <div className="auth-widget auth-widget--employees">
              <div className="auth-widget__icon auth-widget__icon--blue">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div>
                <span className="auth-widget__label">Employees</span>
                <span className="auth-widget__value">1,248</span>
                <span className="auth-widget__trend auth-widget__trend--up">↑ 5.2%</span>
              </div>
            </div>

            {/* Widget 2: Attendance Rate */}
            <div className="auth-widget auth-widget--attendance">
              <div className="auth-widget__icon auth-widget__icon--green">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </div>
              <div>
                <span className="auth-widget__label">Attendance Rate</span>
                <span className="auth-widget__value">94.6%</span>
                <span className="auth-widget__trend auth-widget__trend--up">↑ 2.3%</span>
              </div>
            </div>

            {/* Widget 3: Payroll Due */}
            <div className="auth-widget auth-widget--payroll">
              <div className="auth-widget__icon auth-widget__icon--purple">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div>
                <span className="auth-widget__label">Payroll Due</span>
                <span className="auth-widget__value">$312,450</span>
                <span className="auth-widget__subtext">Due in 5 days</span>
              </div>
            </div>

            {/* Widget 4: Open Positions */}
            <div className="auth-widget auth-widget--positions">
              <div className="auth-widget__icon auth-widget__icon--orange">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              </div>
              <div>
                <span className="auth-widget__label">Open Positions</span>
                <span className="auth-widget__value">24</span>
                <span className="auth-widget__trend auth-widget__trend--up">↑ 9.1%</span>
              </div>
            </div>

            {/* Core Illustration Image / Graphic */}
            <div className="auth-graphic">
              <div className="auth-graphic__shield">
                <ShieldCheck size={48} className="auth-graphic__shield-icon" />
              </div>
              <div className="auth-graphic__user auth-graphic__user--left">
                <div className="auth-graphic__avatar-placeholder" />
                <div className="auth-graphic__bar auth-graphic__bar--short" />
                <div className="auth-graphic__bar auth-graphic__bar--long" />
              </div>
              <div className="auth-graphic__user auth-graphic__user--right">
                <div className="auth-graphic__avatar-placeholder" />
                <div className="auth-graphic__bar auth-graphic__bar--short" />
                <div className="auth-graphic__bar auth-graphic__bar--long" />
              </div>
            </div>
          </div>

          {/* Footer Highlights */}
          <div className="auth-layout__highlights">
            <div className="auth-highlight">
              <div className="auth-highlight__icon">
                <Shield size={16} />
              </div>
              <div>
                <h4 className="auth-highlight__title">Secure Access</h4>
                <p className="auth-highlight__text">Role-based access and permissions</p>
              </div>
            </div>
            <div className="auth-highlight">
              <div className="auth-highlight__icon">
                <Lock size={16} />
              </div>
              <div>
                <h4 className="auth-highlight__title">Encrypted Data</h4>
                <p className="auth-highlight__text">Enterprise-grade data encryption</p>
              </div>
            </div>
            <div className="auth-highlight">
              <div className="auth-highlight__icon">
                <Server size={16} />
              </div>
              <div>
                <h4 className="auth-highlight__title">Admin Portal</h4>
                <p className="auth-highlight__text">Manage your organization with confidence</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Card Pane */}
      <div className="auth-layout__right">
        <div className="auth-layout__card">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
