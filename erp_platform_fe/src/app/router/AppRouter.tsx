import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import { Spin } from 'antd';
import { routes } from './routes';

/**
 * AppRouter — Renders routes with Suspense fallback for lazy-loaded pages
 */
export function AppRouter() {
  const routeElement = useRoutes(routes);

  return (
    <Suspense
      fallback={
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          background: 'var(--color-bg-secondary)',
        }}>
          <Spin size="large" tip="Đang tải..." />
        </div>
      }
    >
      {routeElement}
    </Suspense>
  );
}
