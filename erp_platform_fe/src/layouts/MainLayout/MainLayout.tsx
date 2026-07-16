import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import { Sidebar } from './Sidebar/Sidebar';
import { AppHeader } from './Header/AppHeader';
import './MainLayout.css';

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
    <Layout className="main-layout">
      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <Layout className="main-layout__body">
        <AppHeader collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />
        <Content className="main-layout__content">
          <div className="main-layout__content-inner">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
