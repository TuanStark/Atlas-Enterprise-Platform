import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import { Sidebar } from './Sidebar/Sidebar';
import { AppHeader } from './Header/AppHeader';
import { ImpersonationBanner } from '@features/account-switch/components/ImpersonationBanner';
import { useCurrentUser } from '@features/auth/hooks/useAuth';

const { Content } = Layout;

/**
 * MainLayout — Primary application shell
 *
 * Structure: Sidebar (left) + Header (top) + Content (center)
 * Sidebar is collapsible to save screen space.
 * When impersonating, an amber banner is shown at the top.
 */
export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const user = useCurrentUser();
  const isImpersonating = !!(user as any)?.impersonatorId;
  const bannerHeight = isImpersonating ? 36 : 0;

  return (
    <Layout className="min-h-screen">
      <ImpersonationBanner />
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout
        className={`transition-all duration-200 min-h-screen ${
          collapsed ? 'ml-[72px]' : 'ml-[270px]'
        } max-[768px]:ml-0`}
        style={{ paddingTop: bannerHeight }}
      >
        <AppHeader collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
        <Content
          className="p-6 bg-bg-secondary max-[1024px]:p-4"
          style={{ marginTop: 60, minHeight: `calc(100vh - 60px - ${bannerHeight}px)` }}
        >
          <div className="max-w-[1400px] mx-auto animate-[fadeSlideUp_0.3s_ease]">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

