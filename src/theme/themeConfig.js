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
    // 3 Kích thước Font chuẩn thống nhất toàn website:
    // Nhỏ: 12px | Vừa: 14px | To: 18px
    fontSize: 14,          // Vừa (mặc định cho controls, inputs, buttons, tables, forms)
    fontSizeSM: 12,        // Nhỏ (phụ đề, tags, helper text)
    fontSizeLG: 14,        // Vừa
    fontSizeXL: 18,        // To
    fontSizeHeading1: 18,  // To
    fontSizeHeading2: 18,  // To
    fontSizeHeading3: 18,  // To
    fontSizeHeading4: 18,  // To
    fontSizeHeading5: 14,  // Vừa
    controlHeight: 32,
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
      fontSize: 14,
    },
    Card: {
      paddingLG: 14,
      padding: 12,
      headerFontSize: 18,
    },
    Table: {
      padding: 8,
      paddingSM: 6,
      fontSize: 14,
    },
    Form: {
      itemMarginBottom: 14,
      labelFontSize: 14,
    },
    Button: {
      controlHeight: 32,
      paddingInline: 12,
      contentFontSize: 14,
    },
    Input: {
      controlHeight: 32,
      fontSize: 14,
    },
    Select: {
      controlHeight: 32,
      fontSize: 14,
    },
    Tag: {
      fontSize: 12,
    },
    Breadcrumb: {
      fontSize: 12,
    },
    Typography: {
      fontSize: 14,
    },
  },
});
