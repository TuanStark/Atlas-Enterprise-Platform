import { type ReactNode } from 'react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { atlasTheme } from '@app/styles/theme';

/**
 * Theme Provider — Wraps AntD ConfigProvider with Atlas theme tokens
 */
interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <ConfigProvider theme={atlasTheme}>
      <AntdApp
        message={{ maxCount: 3, duration: 3 }}
        notification={{ placement: 'topRight', duration: 4 }}
      >
        {children}
      </AntdApp>
    </ConfigProvider>
  );
}
