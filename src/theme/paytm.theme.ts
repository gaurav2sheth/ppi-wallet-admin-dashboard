import type { ThemeConfig } from 'antd';

export const paytmTheme: ThemeConfig = {
  token: {
    colorPrimary: '#002E6E',
    colorLink: '#00B9F1',
    colorSuccess: '#12B76A',
    colorWarning: '#F79009',
    colorError: '#F04438',
    colorInfo: '#00B9F1',
    borderRadius: 8,
    fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif",
    fontSize: 14,
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#F5F7FA',
    colorBorder: '#D0D5DD',
    colorText: '#1A1A2E',
    colorTextSecondary: '#666666',
  },
  components: {
    Layout: {
      siderBg: '#002E6E',
      headerBg: '#FFFFFF',
      bodyBg: '#F5F7FA',
      triggerBg: '#001F4D',
      triggerColor: '#FFFFFF',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkItemColor: '#B0C4DE',
      darkItemHoverBg: 'rgba(0, 185, 241, 0.15)',
      darkItemHoverColor: '#FFFFFF',
      darkItemSelectedBg: 'rgba(0, 185, 241, 0.25)',
      darkItemSelectedColor: '#00B9F1',
      darkSubMenuItemBg: 'rgba(0, 0, 0, 0.1)',
    },
    Table: {
      headerBg: '#F5F7FA',
      headerColor: '#1A1A2E',
      rowHoverBg: '#E8F4FD',
      headerSortActiveBg: '#E8F4FD',
      borderColor: '#D0D5DD',
    },
    Card: {
      borderRadiusLG: 12,
    },
    Button: {
      borderRadius: 8,
    },
    Input: {
      borderRadius: 8,
    },
    Select: {
      borderRadius: 8,
    },
    Tag: {
      borderRadiusSM: 6,
    },
  },
};
