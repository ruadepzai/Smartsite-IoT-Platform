import { theme as antdTheme } from 'antd';

export const lightTokens = {
  colorPrimary: '#0B72E7',
  colorSuccess: '#12B45A',
  colorWarning: '#F79009',
  colorError: '#F04438',
  colorInfo: '#06B6D4',
  colorBgLayout: '#F9FAFB',
  colorBorder: '#E4E7EC',
  borderRadius: 8,
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

export const darkTokens = {
  ...lightTokens,
  colorPrimary: '#4098FF',
  colorSuccess: '#3DD68C',
  colorWarning: '#FDB022',
  colorError: '#F97066',
  colorInfo: '#22D3EE',
  colorBgLayout: '#0D1117',
  colorBorder: '#2A303C',
};

/**
 * Tạo themeConfig cho Ant Design ConfigProvider dựa trên trạng thái Dark mode
 * @param {boolean} isDark 
 */
export const getThemeConfig = (isDark) => ({
  algorithm: isDark
    ? [antdTheme.darkAlgorithm, antdTheme.compactAlgorithm]
    : [antdTheme.defaultAlgorithm, antdTheme.compactAlgorithm],
  token: {
    ...(isDark ? darkTokens : lightTokens),
    fontSize: 12.5,
    fontSizeHeading1: 22,
    fontSizeHeading2: 18,
    fontSizeHeading3: 15,
    fontSizeHeading4: 14,
    fontSizeHeading5: 12.5,
    controlHeight: 30,
    controlHeightLG: 36,
    controlHeightSM: 24,
    borderRadius: 6,
    padding: 10,
    paddingSM: 6,
  },
  components: {
    Layout: {
      siderBg: isDark ? '#0B0F19' : '#101828', // sidebar LUÔN tối ở cả 2 theme
      headerBg: isDark ? '#161B22' : '#FFFFFF',
    },
    Menu: {
      darkItemBg: isDark ? '#0B0F19' : '#101828',
      darkItemSelectedBg: isDark ? '#161B22' : '#1D2939',
      darkItemColor: '#CBD5E1',
      darkItemSelectedColor: '#FFFFFF',
      itemHeight: 34,
      iconSize: 16,
    },
    Card: {
      paddingLG: 14,
      padding: 12,
    },
    Table: {
      padding: 8,
      paddingSM: 6,
      fontSize: 12,
    },
    Form: {
      itemMarginBottom: 14,
    },
    Button: {
      controlHeight: 30,
      paddingInline: 12,
    },
    Input: {
      controlHeight: 30,
    },
    Select: {
      controlHeight: 30,
    },
  },
});
