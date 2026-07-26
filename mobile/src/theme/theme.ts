export const theme = {
  colors: {
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    primaryLight: '#EEF2FF',
    secondary: '#8B5CF6',
    background: '#F1F4F9',
    surface: '#FFFFFF',
    surfaceMuted: '#F3F4F6',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    border: '#E5E7EB',
    success: '#10B981',
    successBg: '#D1FAE5',
    warning: '#F59E0B',
    warningBg: '#FEF3C7',
    error: '#EF4444',
    errorBg: '#FEE2E2',
    star: '#F59E0B',
    white: '#FFFFFF',
    black: '#000000',
  },
  gradients: {
    primary: ['#6366F1', '#8B5CF6'] as [string, string],
    profileHeader: ['#6366F1', '#8B21D0'] as [string, string],
  },
  // Icon-badge accents: a pastel background paired with a saturated icon
  // color, reused across stat cards throughout the app.
  accents: {
    blue: { bg: '#DBEAFE', fg: '#3B82F6' },
    orange: { bg: '#FFEDD5', fg: '#F97316' },
    green: { bg: '#D1FAE5', fg: '#10B981' },
    purple: { bg: '#EDE9FE', fg: '#8B5CF6' },
    pink: { bg: '#FCE7F3', fg: '#EC4899' },
    indigo: { bg: '#E0E7FF', fg: '#6366F1' },
    amber: { bg: '#FEF3C7', fg: '#F59E0B' },
    red: { bg: '#FEE2E2', fg: '#EF4444' },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  radius: {
    sm: 6,
    md: 12,
    lg: 20,
    xl: 28,
    full: 999,
  },
  typography: {
    h1: { fontSize: 26, fontWeight: '800' as const },
    h2: { fontSize: 20, fontWeight: '700' as const },
    h3: { fontSize: 17, fontWeight: '700' as const },
    body: { fontSize: 15, fontWeight: '400' as const },
    bodyBold: { fontSize: 15, fontWeight: '600' as const },
    caption: { fontSize: 13, fontWeight: '400' as const },
    captionBold: { fontSize: 13, fontWeight: '600' as const },
    tiny: { fontSize: 11, fontWeight: '600' as const },
  },
  shadow: {
    card: {
      shadowColor: '#1E293B',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
  },
};

export type Theme = typeof theme;
export type AccentKey = keyof typeof theme.accents;
