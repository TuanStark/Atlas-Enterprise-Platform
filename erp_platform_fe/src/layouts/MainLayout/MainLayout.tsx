import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import { Sidebar } from './Sidebar/Sidebar';
import { AppHeader } from './Header/AppHeader';

const { Content } = Layout;

/**
 * MainLayout — Primary application shell
 *
 * Structure: Sidebar (left) + Header (top) + Content (center)
 * Sidebar is collapsible to save screen space.
 */
export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="min-h-screen">
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout
        className={`transition-all duration-200 min-h-screen ${
          collapsed ? 'ml-[72px]' : 'ml-[270px]'
        } max-[768px]:ml-0`}
      >
        <AppHeader collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
        <Content className="mt-[60px] p-6 min-h-[calc(100vh-60px)] bg-bg-secondary max-[1024px]:p-4">
          <div className="max-w-[1400px] mx-auto animate-[fadeSlideUp_0.3s_ease]">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
