import type { ThemeConfig } from 'antd';

/**
 * Atlas Enterprise Platform — Ant Design Theme Configuration
 *
 * Maps our CSS design tokens to AntD's Design Token system.
 * This ensures consistency between custom CSS and AntD components.
 */
export const atlasTheme: ThemeConfig = {
  token: {
    // Primary
    colorPrimary: '#0a65ff',
    colorPrimaryHover: '#0052d4',
    colorPrimaryActive: '#0043b3',
    colorPrimaryBg: '#f0f6ff',
    colorPrimaryBgHover: '#e1eeff',

    // Success / Warning / Error / Info
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#3b82f6',

    // Typography
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,
    fontSizeHeading1: 30,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 18,
    fontSizeHeading5: 16,
    fontSizeSM: 13,
    fontSizeLG: 16,

    // Border
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    colorBorder: '#e2e8f0',
    colorBorderSecondary: '#f1f5f9',

    // Layout
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f8fafc',
    colorBgElevated: '#ffffff',

    // Text
    colorText: '#0f172a',
    colorTextSecondary: '#475569',
    colorTextTertiary: '#94a3b8',
    colorTextQuaternary: '#cbd5e1',

    // Shadows
    boxShadow:
      '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)',
    boxShadowSecondary:
      '0 4px 12px rgba(15, 23, 42, 0.05), 0 2px 4px rgba(15, 23, 42, 0.02)',

    // Spacing
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,
    paddingXXS: 4,
    margin: 16,
    marginLG: 24,
    marginSM: 12,
    marginXS: 8,
    marginXXS: 4,

    // Motion
    motionDurationFast: '0.15s',
    motionDurationMid: '0.25s',
    motionDurationSlow: '0.35s',

    // Control
    controlHeight: 38,
    controlHeightLG: 44,
    controlHeightSM: 32,

    // Line
    lineHeight: 1.5,
    lineWidth: 1,
    lineType: 'solid',
  },
  components: {
    Layout: {
      siderBg: '#ffffff',
      headerBg: '#ffffff',
      bodyBg: '#f8fafc',
      headerHeight: 60,
      headerPadding: '0 24px',
    },
    Menu: {
      darkItemBg: '#0f172a',
      darkItemHoverBg: '#1e293b',
      darkItemSelectedBg: 'rgba(10, 101, 255, 0.15)',
      darkItemColor: '#cbd5e1',
      darkItemSelectedColor: '#ffffff',
      itemBg: '#ffffff',
      itemSelectedBg: '#f0f6ff',
      itemSelectedColor: '#0a65ff',
      itemHoverBg: '#f8fafc',
      itemColor: '#64748b',
      itemBorderRadius: 8,
      itemMarginInline: 8,
      itemPaddingInline: 16,
      iconSize: 18,
    },
    Button: {
      primaryShadow: '0 2px 4px rgba(10, 101, 255, 0.25)',
      borderRadius: 8,
      controlHeight: 38,
      controlHeightLG: 44,
      controlHeightSM: 32,
    },
    Table: {
      headerBg: '#f8fafc',
      headerColor: '#475569',
      headerSortActiveBg: '#f1f5f9',
      rowHoverBg: '#f8fafc',
      borderColor: '#f1f5f9',
      cellPaddingBlock: 12,
      cellPaddingInline: 16,
    },
    Card: {
      borderRadiusLG: 16,
      paddingLG: 24,
      boxShadowTertiary:
        '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.02)',
    },
    Input: {
      controlHeight: 38,
      borderRadius: 8,
      activeShadow: '0 0 0 3px rgba(10, 101, 255, 0.1)',
    },
    Select: {
      controlHeight: 38,
      borderRadius: 8,
    },
    Modal: {
      borderRadiusLG: 12,
      paddingContentHorizontalLG: 24,
    },
    Notification: {
      borderRadiusLG: 10,
    },
    Tag: {
      borderRadiusSM: 4,
    },
    Breadcrumb: {
      fontSize: 13,
      separatorMargin: 8,
    },
  },
};
