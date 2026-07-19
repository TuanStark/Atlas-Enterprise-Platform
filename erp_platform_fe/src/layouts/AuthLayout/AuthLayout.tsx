import { Outlet } from 'react-router-dom';
import { ShieldCheck, Lock, Shield, Server } from 'lucide-react';
import logoHrm from '@/assets/logo-hrm.jpeg';

/**
 * AuthLayout — Layout for unauthenticated pages (login, forgot password)
 * Split-screen layout: left branding/illustration & right form card.
 */
export function AuthLayout() {
  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Illustrative Pane */}
      <div className="flex-1 bg-[radial-gradient(circle_at_10%_20%,rgba(10,101,255,0.04)_0%,rgba(255,255,255,0)_90%),radial-gradient(circle_at_90%_80%,rgba(10,101,255,0.02)_0%,rgba(255,255,255,0)_90%),#f8fafc] flex items-center justify-center p-12 px-8 border-0 border-r border-solid border-border-light overflow-hidden max-[992px]:hidden">
        <div className="w-full max-w-[520px] flex flex-col h-full">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 mb-8">
            <img
              src={logoHrm}
              alt="Logo HRIMS"
              className="w-11 h-11 rounded-xl object-cover shadow-[0_8px_16px_rgba(10,101,255,0.15)] border border-solid border-slate-100"
            />
            <div>
              <h1 className="text-xl font-extrabold text-text-primary leading-tight tracking-tight">HRIMS</h1>
              <p className="text-[11px] text-text-tertiary font-medium">Hệ thống Thông tin Nhân sự</p>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-extrabold text-text-primary tracking-tight mb-2 leading-tight">Chào mừng quay trở lại, Spencer</h2>
          <p className="text-[14px] text-text-secondary leading-relaxed mb-10">
            Đăng nhập để quản lý nhân sự, bảng lương, chuyên cần, tuyển dụng, báo cáo và cài đặt.
          </p>

          {/* Floating Widget Illustration Container */}
          <div className="relative h-[320px] w-full mb-12 bg-[radial-gradient(circle,rgba(10,101,255,0.02)_0%,transparent_70%)]">
            {/* Widget 1: Employees */}
            <div className="absolute bg-white rounded-lg p-2.5 px-3.5 shadow-[0_10px_25px_rgba(15,23,42,0.05),0_2px_4px_rgba(15,23,42,0.02)] border border-solid border-slate-200/80 flex items-center gap-3 z-10 transition-transform duration-300 hover:-translate-y-0.5 top-[10%] left-[2%] animate-[floatAnim_6s_ease-in-out_infinite_alternate]">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#f0f6ff] text-[#0a65ff]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div>
                <span className="text-[11px] text-text-tertiary font-medium block">Nhân viên</span>
                <span className="text-[15px] font-bold text-text-primary mr-1.5">1,248</span>
                <span className="text-[10px] font-semibold text-[#10b981]">↑ 5.2%</span>
              </div>
            </div>

            {/* Widget 2: Attendance Rate */}
            <div className="absolute bg-white rounded-lg p-2.5 px-3.5 shadow-[0_10px_25px_rgba(15,23,42,0.05),0_2px_4px_rgba(15,23,42,0.02)] border border-solid border-slate-200/80 flex items-center gap-3 z-10 transition-transform duration-300 hover:-translate-y-0.5 top-[5%] right-[5%] animate-[floatAnim_6s_ease-in-out_infinite_alternate_1.5s]">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#ecfdf5] text-[#10b981]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </div>
              <div>
                <span className="text-[11px] text-text-tertiary font-medium block">Tỷ lệ chuyên cần</span>
                <span className="text-[15px] font-bold text-text-primary mr-1.5">94.6%</span>
                <span className="text-[10px] font-semibold text-[#10b981]">↑ 2.3%</span>
              </div>
            </div>

            {/* Widget 3: Payroll Due */}
            <div className="absolute bg-white rounded-lg p-2.5 px-3.5 shadow-[0_10px_25px_rgba(15,23,42,0.05),0_2px_4px_rgba(15,23,42,0.02)] border border-solid border-slate-200/80 flex items-center gap-3 z-10 transition-transform duration-300 hover:-translate-y-0.5 bottom-[12%] left-[-2%] animate-[floatAnim_6s_ease-in-out_infinite_alternate_0.5s]">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#faf5ff] text-[#a855f7]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <div>
                <span className="text-[11px] text-text-tertiary font-medium block">Lương đến hạn</span>
                <span className="text-[15px] font-bold text-text-primary mr-1.5">$312,450</span>
                <span className="text-[10px] text-text-tertiary">Đến hạn trong 5 ngày</span>
              </div>
            </div>

            {/* Widget 4: Open Positions */}
            <div className="absolute bg-white rounded-lg p-2.5 px-3.5 shadow-[0_10px_25px_rgba(15,23,42,0.05),0_2px_4px_rgba(15,23,42,0.02)] border border-solid border-slate-200/80 flex items-center gap-3 z-10 transition-transform duration-300 hover:-translate-y-0.5 bottom-[22%] right-[1%] animate-[floatAnim_6s_ease-in-out_infinite_alternate_2s]">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#fffbeb] text-[#f59e0b]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
              </div>
              <div>
                <span className="text-[11px] text-text-tertiary font-medium block">Vị trí đang tuyển</span>
                <span className="text-[15px] font-bold text-text-primary mr-1.5">24</span>
                <span className="text-[10px] font-semibold text-[#10b981]">↑ 9.1%</span>
              </div>
            </div>

            {/* Core Illustration Image / Graphic */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 flex items-center justify-center">
              <div className="w-[110px] h-[110px] rounded-full bg-white border border-solid border-[#0a65ff]/15 shadow-[0_12px_36px_rgba(10,101,255,0.15)] flex items-center justify-center text-[#0a65ff] relative z-10 animate-[pulseShield_4s_infinite]">
                <ShieldCheck size={48} className="w-12 h-12" />
              </div>
              <div className="absolute w-[90px] p-2.5 bg-white rounded-xl shadow-[0_8px_20px_rgba(15,23,42,0.04)] border border-solid border-slate-200/60 flex flex-col gap-1.5 left-[10px] top-[110px] -rotate-[8deg]">
                <div className="w-6 h-6 rounded-full bg-[#f1f5f9]" />
                <div className="h-1.5 bg-[#f1f5f9] rounded-[3px] w-[60%]" />
                <div className="h-1.5 bg-[#f1f5f9] rounded-[3px] w-full" />
              </div>
              <div className="absolute w-[90px] p-2.5 bg-white rounded-xl shadow-[0_8px_20px_rgba(15,23,42,0.04)] border border-solid border-slate-200/60 flex flex-col gap-1.5 right-[15px] top-[130px] rotate-[6deg]">
                <div className="w-6 h-6 rounded-full bg-[#f1f5f9]" />
                <div className="h-1.5 bg-[#f1f5f9] rounded-[3px] w-[60%]" />
                <div className="h-1.5 bg-[#f1f5f9] rounded-[3px] w-full" />
              </div>
            </div>
          </div>

          {/* Footer Highlights */}
          <div className="flex justify-between gap-4 mt-auto border-0 border-t border-solid border-border-light pt-6">
            <div className="flex items-start gap-2.5 flex-1">
              <div className="w-7 h-7 rounded-md bg-[#f0f6ff] text-[#0a65ff] flex items-center justify-center shrink-0">
                <Shield size={16} />
              </div>
              <div>
                <h4 className="text-[12px] font-bold text-text-primary mb-0.5">Truy cập Bảo mật</h4>
                <p className="text-[10px] text-text-secondary leading-normal">Quyền và truy cập dựa trên vai trò</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 flex-1">
              <div className="w-7 h-7 rounded-md bg-[#f0f6ff] text-[#0a65ff] flex items-center justify-center shrink-0">
                <Lock size={16} />
              </div>
              <div>
                <h4 className="text-[12px] font-bold text-text-primary mb-0.5">Dữ liệu mã hóa</h4>
                <p className="text-[10px] text-text-secondary leading-normal">Mã hóa dữ liệu cấp doanh nghiệp</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 flex-1">
              <div className="w-7 h-7 rounded-md bg-[#f0f6ff] text-[#0a65ff] flex items-center justify-center shrink-0">
                <Server size={16} />
              </div>
              <div>
                <h4 className="text-[12px] font-bold text-text-primary mb-0.5">Trang quản trị</h4>
                <p className="text-[10px] text-text-secondary leading-normal">Quản lý tổ chức của bạn một cách tin cậy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Card Pane */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white max-[992px]:bg-[radial-gradient(circle_at_50%_50%,rgba(10,101,255,0.02)_0%,transparent_80%)] max-[480px]:p-4">
        <div className="w-full max-w-[440px] animate-[authCardEnter_0.5s_ease]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
